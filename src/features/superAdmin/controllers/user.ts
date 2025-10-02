
import { Request, Response, NextFunction } from "express";
import { Prisma } from "../../../lib/prisma";
import { deleteMatchingKeys, swrCache } from "../../../lib/cache";
import { actionRole, KycDocumentType, KycStatus, Prisma as prisma, UserRole } from "@prisma/client";
import { redis } from "../../../lib/redis";
import CustomResponse from "../../../utils/helpers/response.util";
import { DuplicateError, InternalServerError } from "../../../lib/appError";
import { mailController } from "../../../utils/nodemailer";
import { accountSuspendMailOption } from "../../../utils/mailer";
import bcrypt from "bcryptjs";


export const getAllAdmins = async (req: Request, res: Response, next: NextFunction) => {

      const role = req.query.role as UserRole;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";

    const cacheKey = `admins:${page}:${limit}:${search ? search : "all"}:${role || "ALL"}`;


    try {


               const filters: prisma.UserWhereInput = {
                role: {
                    // notIn: 
                    equals: "ADMIN"
                },
                 
                  AND: [
                    search
                      ? {
                        OR: [
                        { fullname: { contains: search, mode: "insensitive" }, },
                        { username: { contains: search, mode: "insensitive" }, },
                        { email: { contains: search, mode: "insensitive" }, },
                         
                        ].filter(Boolean)
                      }
                      : undefined,
                        role ? { role } : undefined,
            
                    
                  ].filter(Boolean) as prisma.UserWhereInput[]
                };


        const result = await swrCache(cacheKey, async () => {

            const [data, total] = await Promise.all([
                Prisma.user.findMany({
                    where: filters,
                     select: {
                        id: true,
                        fullname: true,
                        email: true,
                        avatar: true,
                        suspended: true,
                        AdminPermission: {
                            select: {action: true}
                        }
                     },
                    skip,
                    take: limit,
                    // orderBy: { : "desc" },
                }),
                Prisma.user.count({ where: filters }),
            ]);

            const totalPages = Math.ceil(total / limit);

             const transformedData = data.map(user => {
                const { ...rest} =  user;
                return ({
                ...rest,
                lastSeen: Date.now(),
               
                })
            });



            return {
                data: transformedData,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages,
                    canGoNext: page < totalPages,
                    canGoPrev: page > 1,
                },
            }
        })


        await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

        new CustomResponse(200, true, "Fetched successfully", res, result);
    } catch (error) {
        console.error(error)
        next(new InternalServerError("Internal server error", 500));
        
    }
};


export const getUsersController = async (req: Request, res: Response, next: NextFunction) => {

    
    const role = req.query.role as UserRole;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";

    const cacheKey = `users:${page}:${limit}:${search}:${ role || 'ALL'}`;


    try {
    

               const filters: prisma.UserWhereInput = {
                role: {
                    notIn: ["ADMIN", "SUPER_ADMIN"]
                },
                 
                  AND: [
                    search
                      ? {
                        OR: [
                        { fullname: { contains: search, mode: "insensitive" }, },
                        { username: { contains: search, mode: "insensitive" }, },
                        { email: { contains: search, mode: "insensitive" }, },
                         
                        ].filter(Boolean)
                      }
                      : undefined,

                    role ? { role } : undefined,
                  
                    ].filter(Boolean) as prisma.UserWhereInput[]
                };

        const result = await swrCache(cacheKey, async () => {

            const [data, total] = await Promise.all([
                Prisma.user.findMany({
                    where: filters,
                    select: {
                        id: true,
                        fullname: true,
                        email: true,
                        phone_number: true,
                        avatar: true,
                        role: true,
                        address: true,
                        suspended: true,
                        kyc: {
                            select: {
                                status: true
                            }
                        },
                        properties: {
                            where:{status: "APPROVED"},
                              select: { id: true }

                        }
                    },
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                Prisma.user.count({ where: filters }),
            ]);

            const totalPages = Math.ceil(total / limit);

            const transformedData = data.map(user => {
                const {properties, ...rest} =  user;
                return ({
                ...rest,
                lastSeen: Date.now(),
                 approvedPropertyCount: user.properties.length,
                })
            });


            return {
                data: transformedData,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages,
                    canGoNext: page < totalPages,
                    canGoPrev: page > 1,
                },
            }
        });


        await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

        new CustomResponse(200, true, "Fetched successfully", res, result);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }
};


export const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const {email, action, username, password, phone_number, fullname


    }: {email:  string, action: actionRole[], username: string, password:  string, phone_number: {phone: string, country: string}, fullname: string}  = req.body;

    const parsedAction: actionRole[] = typeof action === 'string' ? JSON.parse(action) : action;


    try {


     const existingUser = await Prisma.user.findUnique({
      where: { email },
    });

    const existingUserName = await Prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return next(new DuplicateError("Email already exists."));
     
    }

    if (existingUserName) {
      return next(new DuplicateError("User name already exists."));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const cleanedPhoneNumber = phone_number.phone.replace(/[^\d+]/g, '');

    const newUser = await Prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phone_number: cleanedPhoneNumber,
        role: "ADMIN",
        fullname,
        address: {
          country: phone_number.country,
          city: "",
          location: "",
          state: ""
        },
        setting: {
          emailNotification: true,
          pushNotification: true,
          smsNotification: false
        }
      }
    });



     if (!newUser) {
      return next(new InternalServerError("Admin registration failed", 500));
    }



   const adminPermission =  await Prisma.adminPermission.create({
             data: {
                 userId: newUser.id,
                 action: parsedAction,
                 
             }
         })

         await Prisma.user.update({
      where: { id: newUser.id },
      data: {
        AdminPermission: {connect: {id: adminPermission.id}}
      }
    });



      const kycPayload = {
                    userId: newUser.id,
                    documentType: KycDocumentType.NIN,
                    status: KycStatus.VERIFIED,
                    documentNumber: "12345",
                    documentPhoto: "",
                    tryCount: 1,
                    ninData: {
                        nin: "12345",
                        firstname: "Arellow",
                        lastname: "Arellow",
                        middlename: "Arellow",
                        phone: "",
                        gender: "N/A",
                        birthdate: "",
                        photo: "",
                        residence: {
                            address1: "",
                            town: "",
                            lga: "",
                            state: ""
                        } 
                       
                    }
                };
    
               
     await Prisma.kyc.create({ data: kycPayload });

    


    await deleteMatchingKeys("admins:*")

     new CustomResponse(200, true, "Admin added", res,);

    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }

}

export const addAdminRole = async (req: Request, res: Response, next: NextFunction) => {
    const {email, action}: {email:  string, action: actionRole[]}  = req.body;

    const parsedAction: actionRole[] = typeof action === 'string' ? JSON.parse(action) : action;

    try {

         const user = await Prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        kyc: true
      }
    });

     if(!user){
        return next(new InternalServerError("Not a register user", 403));
        }

     if(!user.is_verified){
        return next(new InternalServerError("User email is not verify", 403));
    }

     if(user.kyc?.status !== "VERIFIED"){
        return next(new InternalServerError("User kyc is not verify", 403));
    }



  const  isAdminPermission =   await Prisma.adminPermission.findUnique({
        where: {userId: user.id}
     })

     if(isAdminPermission) {
         await Prisma.adminPermission.update({
            where: {userId: user.id},
             data: {
                 action: parsedAction
             }
         })

     } else {
         await Prisma.adminPermission.create({
             data: {
                 userId: user.id,
                 action: parsedAction
             }
         })

     }




    // if(user.role !== UserRole.ADMIN){
    //     await Prisma.user.update({
    //         where: {id: user.id},
    //         data: {role: UserRole.ADMIN}
    //     })

    // }

    await deleteMatchingKeys("admins:*")

     new CustomResponse(200, true, "Admin added", res,);

    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }

}

export const suspendAdminStatus = async (req: Request, res: Response, next: NextFunction) => {

    const { userId } = req.params;
     const {  message } = req.body;

    try {

        const admin = await Prisma.user.findUnique({where: {id: userId}});

         if(!admin){
            return next(new InternalServerError("invalid user", 403));
        }


        await Prisma.user.update({
            where: {id: userId},
            data: {suspended: true}
        })

    
        if(message){

            const mailOptions = await accountSuspendMailOption({
               email: admin.email,
               fullname: admin.fullname,
                suspensionReason: message
               });
    
               mailController({from: "support@arellow.com", ...mailOptions});
        }
 
        await deleteMatchingKeys("admins:*");

        new CustomResponse(200, true, "User suspended successfully", res);

    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }


};


