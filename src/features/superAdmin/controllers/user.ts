
import { Request, Response, NextFunction } from "express";
import { UserQueryDTO } from "../dtos/user.dto";
import { Prisma } from "../../../lib/prisma";
import { deleteMatchingKeys, swrCache } from "../../../lib/cache";
import { actionRole, Prisma as prisma, UserRole } from "@prisma/client";
import { redis } from "../../../lib/redis";
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError } from "../../../lib/appError";



export const getAllAdmins = async (req: Request, res: Response, next: NextFunction) => {

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";

    const cacheKey = `admins:${page}:${limit}:${search}`;

   


    const cached = await redis.get(cacheKey);
    if (cached) {

        res.status(200).json({
            success: true,
            message: "successfully. from cache",
            data: JSON.parse(cached)
        });
        return
    }

    try {
        // const upperSearch = (search as string).toUpperCase();


        const filters = search
            ? {
               role: UserRole.ADMIN,
                
                OR: [
                    // { status: upperSearch as ticketStatus },
                    { fullname: { contains: search, mode: "insensitive" }, },
                    { username: { contains: search, mode: "insensitive" }, },
                    // { description: { contains: search, mode: "insensitive" }, }
                ].filter(Boolean) as prisma.UserWhereInput[],
            }
            : {role: UserRole.ADMIN,};

        const result = await swrCache(cacheKey, async () => {

            const [data, total] = await Promise.all([
                Prisma.user.findMany({
                    where: filters,
                    // include: {
                    //     ticketPhotos: {
                    //         select: {
                    //             url: true
                    //         }
                    //     },
                    //     user: {
                    //         select: {
                    //             fullname: true,
                    //             email: true,
                    //             avatar: true
                    //         }
                    //     }

                    // },
                    skip,
                    take: limit,
                    orderBy: { createdAt: "desc" },
                }),
                Prisma.user.count({ where: filters }),
            ]);

            const totalPages = Math.ceil(total / limit);



            return {
                data,
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
        next(new InternalServerError("Internal server error", 500));
    }
};


export const getUsersController = async (req: Request, res: Response, next: NextFunction) => {

    const allowedRoles: UserRole[] = ["REALTOR", "DEVELOPER", "BUYER", "ADMIN"];
    const role = req.query.role as UserRole;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";

    const cacheKey = `users:${page}:${limit}:${search}:${allowedRoles.includes(role) ? role : 'ALL'}`;


    try {
       
            const filters: prisma.UserWhereInput = {

              AND: [
                search
                  ? {
                    OR: [
                      { fullname: { contains: search as string, mode: 'insensitive' } },
                      { username: { contains: search as string, mode: 'insensitive' } },
                    ]
                  }
                  : undefined,
        
               allowedRoles.includes(role) ? { role } : { role: { in: allowedRoles } },
               
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
                        role: true,
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
                location: "lagos",
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


export const addAdmin = async (req: Request, res: Response, next: NextFunction) => {
    const {email, action}: {email:  actionRole, action: string[]}  = req.body;

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



    await Prisma.adminPermission.create({
        data: {
            userId: user.id,
            action: parsedAction
        }
    })











        
    } catch (error) {
        
    }

}




// model User {
//   id                String             @id @default(auto()) @map("_id") @db.ObjectId
//   email             String             @unique
//   fullname          String
//   username          String
//   password          String
//   phone_number      String
//   role              UserRole
//   avatar            String             @default("https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?semt=ais_hybrid&w=740")
//   is_verified       Boolean            @default(false)
//   suspended         Boolean            @default(false)
//   points            Int                @default(0)
//   rewardHistory     RewardHistory[]
//   rewardWithdrawals RewardWithdrawal[]
//   companyId         String?            @db.ObjectId
//   company           Company?           @relation(fields: [companyId], references: [id])
//   likes             UserPropertyLike[]

//   properties           Property[]                 @relation("UserProperties")
//   approvedProperties   Property[]                 @relation("ApprovedProperties")
//   // PropertyRequest    PropertyRequest[]
//   mortgage             MortgageCalculationDraft[]
//   Campaign             Campaign[]
//   preQualifications    PreQualification[]
//   featuredContributors BlogFeaturedContributor[]  @relation("UserFeaturedContributors")
//   createdAt            DateTime                   @default(now())
//   updatedAt            DateTime                   @updatedAt
//   Blog                 Blog[]

//   kyc             Kyc?
//   tickets         Ticket[]
//   AdminPermission AdminPermission?
// }