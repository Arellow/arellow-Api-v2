import { Request, Response, NextFunction } from "express";
import { InternalServerError } from "../../../lib/appError";
import CustomResponse from '../../../utils/helpers/response.util'
import dotenv from 'dotenv'
import { Prisma } from "../../../lib/prisma";
import { redis } from "../../../lib/redis";
import { AssignmentStatus, Prisma as prisma, PropertyCategory } from "@prisma/client";
import { deleteMatchingKeys, swrCache } from "../../../lib/cache";
import { formatInky } from "../../../utils/constants.util";
import { emailQueue } from "../queues/email.queue";
import { User } from "../../../types/custom";
dotenv.config();


export const createPropertyRequest = async (req: Request, res: Response, next: NextFunction) => {

  const user = req?.user;

  const {
    username,
    userRole,
    email,
    phoneNumber,
    propertyCategory,
    propertyType,
    furnishingStatus,
    numberOfBedrooms,
    numberOfBathrooms,
    budget,
    description,
    country,
    state,
    city,
    location,

  } = req.body;



  try {


    const isLogin = await Prisma.user.findUnique({ where: { id: user?.id } });

    const response = await Prisma.propertyRequest.create({
      data: {
        username: isLogin ? isLogin.fullname : username,
        userRole: isLogin ? isLogin.role : userRole,
        email: isLogin ? isLogin.email : email,
        phoneNumber: isLogin ? isLogin.phone_number : phoneNumber,
        propertyCategory,
        propertyType,
        furnishingStatus,
        propertyAddress: {
          country,
          state,
          city,
          location,
        },
        numberOfBedrooms: Number(numberOfBedrooms),
        numberOfBathrooms: Number(numberOfBathrooms),
        budget: Number(budget),
        description,

        ...(user && {
          createdBy: {
            connect: { id: user.id }
          }
        }),

      }
    });


    await deleteMatchingKeys("propertyRequests:*");


    new CustomResponse(201, true, "Property request created successfully", res, response.id);
  } catch (error) {
    // console.error("Property request creation error:", error);
    next(new InternalServerError("Failed to create property request."));
  }
};


export const propertyRequestDetail = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const user = req?.user

  const cacheKey = `propertyRequests:${id}:${user}`;

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

    const baseSelect = {
      propertyAddress: true,
      propertyCategory: true,
      propertyType: true,
      furnishingStatus: true,
      numberOfBedrooms: true,
      numberOfBathrooms: true,
      budget: true,
      description: true,
    };


    const adminSelect = (user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") ? {
      email: true,
      phoneNumber: true,
      userRole: true,
      adminStatus: true,
      createdBy: {
        select: {
          id: true,
          fullname: true,
          _count: {
            select: {
              propertyRequests: true
            }
          },
          address: {
            select: {
              state: true
            }
          }
        }
      },
      developerAssignments: {
          select: {
            developer: {
              select: {
                fullname: true
              }
            }
          }
        }
    } : {};


    const property = await Prisma.propertyRequest.findUnique({
      where: { id },
      select: {
        ...baseSelect,
        ...adminSelect,
      }
    });


    if (!property) {
      return next(new InternalServerError("Property request not found", 404));
    }


    await redis.set(cacheKey, JSON.stringify(property), "EX", 60);


    new CustomResponse(200, true, "successfully", res, property);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }


};


export const propertyAssignDetail = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const cacheKey = `propertyRequests:${id}:other`;

  // const cached = await redis.get(cacheKey);
  // if (cached) {
  //   res.status(200).json({
  //     success: true,
  //     message: "successfully. from cache",
  //     data: JSON.parse(cached)
  //   });
  //   return
  // }

  try {


    const property = await Prisma.developerAssignment.findUnique({
      where: { id },
      select: {
        status: true,
        comment: true,
        propertyRequest: {
          select: {
            propertyAddress: true,
           propertyCategory: true,
           propertyType: true,
          furnishingStatus: true,
          numberOfBedrooms: true,
          numberOfBathrooms: true,
          budget: true,
          description: true
          }
        }
      }
    });



    if (!property) {
      return next(new InternalServerError("Property request not found", 404));
    }


    await redis.set(cacheKey, JSON.stringify(property), "EX", 60);


    new CustomResponse(200, true, "successfully", res, property);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }

};


export const propertyRequests = async (req: Request, res: Response, next: NextFunction) => {
    const {
      propertyType,
      country,
      state,
      status,
     
    } = req.query;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const user = req?.user

  const search = (req.query.search as string) || "";

    const cacheKey = `propertyRequests:${user?.id}:${page}:${limit}:${search || "all"}:${status || ""}:${state || ""}:${country || ""}:${propertyType || ""}:self`;


       const isAdmin = getIsAdmin(req.user!);

  try {

    const matchedCategory = getValidCategory(search);

    const filters: prisma.PropertyRequestWhereInput = {

      createdBy: {
            id: isAdmin ? undefined : user?.id,
          },

      AND: [
        search
          ? {
            OR: [
              matchedCategory ? { propertyCategory: matchedCategory } : null,
              { propertyType: { contains: search, mode: "insensitive" } },
              { propertyAddress: { is: { country: { contains: search, mode: "insensitive" } } } },
              { propertyAddress: { is: { state: { contains: search, mode: "insensitive" } } } },
              { propertyAddress: { is: { city: { contains: search, mode: "insensitive" } } } },
              { propertyAddress: { is: { location: { contains: search, mode: "insensitive" } } } },
            ]
          }
          : undefined,
            status ? { status: status as AssignmentStatus } : undefined,

          country ? { propertyAddress: { is: { country: { contains: country, mode: "insensitive" } } } } : undefined,
          state ? { propertyAddress: { is: { state: { contains: state, mode: "insensitive" } } } } : undefined,
           propertyType ? { propertyType: { contains: propertyType, mode: "insensitive" } } : undefined,
      ].filter(Boolean) as prisma.PropertyRequestWhereInput[]
    };




    const adminSelect = isAdmin ? {
      username: true,
      email: true,
      phoneNumber: true,
      userRole: true,
      budget: true,
      adminStatus: true,
      createdById: true,
      
    } : {
      propertyCategory: true,
      propertyType: true,
      budget: true,
      propertyAddress: true,
      createdAt: true,
      userStatus: true,
      createdById: true,
      // developerAssignments: {
      //   where: { developerId: user?.id },
      //   select: {
      //     status: true
      //   }
      // }

    }


    const result = await swrCache(cacheKey, async () => {



      const [data, total] = await Promise.all([
        Prisma.propertyRequest.findMany({
          where: filters,
          select: {
            id: true,
            ...adminSelect,
          },
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        Prisma.propertyRequest.count({ where: filters }),
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
    // console.log(error)
    next(new InternalServerError("Internal server error", 500));
  }
};


export const propertyAssigns = async (req: Request, res: Response, next: NextFunction) => {


    const {
      propertyType,
      country,
      state,
      status,
     
    } = req.query;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const user = req?.user;

  const search = (req.query.search as string) || "";

  const cacheKey = `propertyRequests:${user?.id}:${page}:${limit}:${search || "all"}:${status || ""}:${state || ""}:${country || ""}:${propertyType || ""}`;

  // const cached = await redis.get(cacheKey);
  // if (cached) {

  //   res.status(200).json({
  //     success: true,
  //     message: "successfully. from cache",
  //     data: JSON.parse(cached)
  //   });
  //   return
  // }

  try {

    const matchedCategory = getValidCategory(search);

    const filters: prisma.DeveloperAssignmentWhereInput = {
      developer: {id: user?.id},
      AND: [
        search
          ? {
            OR: [
              matchedCategory ? {propertyRequest: { propertyCategory: matchedCategory }} : null,
              {propertyRequest: { propertyType: { contains: search, mode: "insensitive" } }},
              {propertyRequest: { propertyAddress: { is: { country: { contains: search, mode: "insensitive" } } } }},
              {propertyRequest: { propertyAddress: { is: { state: { contains: search, mode: "insensitive" } } } }},
              {propertyRequest: { propertyAddress: { is: { city: { contains: search, mode: "insensitive" } } } }},
              {propertyRequest: { propertyAddress: { is: { location: { contains: search, mode: "insensitive" } } } }},
            ]
          }
          : undefined,

          status ? { status: status as AssignmentStatus } : undefined,

          country ? {propertyRequest: { propertyAddress: { is: { country: { contains: country, mode: "insensitive" } } } } } : undefined,
          state ? {propertyRequest: { propertyAddress: { is: { state: { contains: state, mode: "insensitive" } } } } }: undefined,
           propertyType ? {propertyRequest: { propertyType: { contains: propertyType, mode: "insensitive" } } } : undefined,

      ].filter(Boolean) as prisma.DeveloperAssignmentWhereInput[]
    };

    const result = await swrCache(cacheKey, async () => {



      const [data, total] = await Promise.all([
        Prisma.developerAssignment.findMany({
          where: filters,
          select: {
            id: true,
            status: true,
            propertyRequest: {
              select: {
                  propertyCategory: true,
                 propertyType: true,
              budget: true,
             propertyAddress: true,
               createdAt: true,
              }
            }
          },
          skip,
          take: limit,
          orderBy: { assignedAt: "desc" },
        }),
        Prisma.developerAssignment.count({ where: filters }),
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


function getValidCategory(value: string): PropertyCategory | null {
  const lowerValue = value.toLowerCase();
  return (
    Object.values(PropertyCategory).find(
      (category) => category.toLowerCase().includes(lowerValue)
    ) ?? null
  );
}


type TTransferPropertyRequest = {
  developerIds: string[];
  comment: string;
  sendmail: boolean
};

export const assignDevelopers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id: requestId } = req.params;
  const { developerIds, comment, sendmail }: TTransferPropertyRequest = req.body;
  const assignedById = req?.user?.id;

  try {
    if (!Array.isArray(developerIds) || developerIds.length === 0) {
      return res.status(400).json({ success: false, message: "No developers provided." });
    }

    const existingAssignments = await Prisma.developerAssignment.findMany({
      where: { propertyRequestId: requestId },
      include: { developer: { select: { id: true, email: true, fullname: true } } }
    });

    const existingDeveloperMap = new Map(
      existingAssignments.map(a => [a.developer.id, a.developer])
    );

    const existingDeveloperIds = [...existingDeveloperMap.keys()];


    const toDelete = existingDeveloperIds.filter(id => !developerIds.includes(id));
    const toAdd = developerIds.filter(id => !existingDeveloperIds.includes(id));

    if (toDelete.length > 0) {
      await Prisma.developerAssignment.updateMany({
        where: {
          propertyRequestId: requestId,
          developerId: { in: toDelete }
        },
        data: {
          status: "CLOSED",
          comment: "property was found",
          responseAt: new Date()
        }
      });
    }

    const newAssignments = toAdd.map((developerId: string) => ({
      propertyRequestId: requestId,
      developerId,
      assignedById,
      comment,
      status: AssignmentStatus.IN_PROGRESS,

    }));

    if (newAssignments.length > 0) {
      await Prisma.developerAssignment.createMany({
        data: newAssignments
      });
    }


    const response = await Prisma.propertyRequest.update({
      where: { id: requestId },
      data: {
        adminStatus: "ASSIGNED",
        userStatus: "IN_PROGRESS",
      }
    })


    if (sendmail) {
      const addedMails = toAdd.map(async (developerId) => {
        const developer = await Prisma.user.findUnique({
          where: { id: developerId },
          select: { email: true, fullname: true }
        });

        if (developer?.email) {
          await emailQueue.add("send-email", {
            email: response.email,
            realtorName: response.username,
            location: response.propertyAddress.location,
            propertyType: response.propertyType,
            bedrooms: response.numberOfBedrooms,
            budget: formatInky(response.budget?.toString()),
            furnishingStatus: response.furnishingStatus,
          from: "noreply@arellow.com"

          }, {
          removeOnFail: {count: 3},
          removeOnComplete: true
          })
        }
      });
   
      await Promise.allSettled([...addedMails,]);
    }


    await deleteMatchingKeys("propertyRequests:*");
    new CustomResponse(200, true, "Developer assignments successfully", res);
  } catch (error) {
    next(new InternalServerError("Failed to update assignments."));
  }
};



export const updateDeveloperAssignment = async (req: Request, res: Response, next: NextFunction) => {
  const { id: propertyRequestId } = req.params;

  try {
    await Prisma.developerAssignment.updateMany({
      where: { propertyRequestId },
      data: {
        status: "CLOSED",
        comment: "property found",
        responseAt: new Date()
      }
    });

    await Prisma.propertyRequest.update({
      where: { id: propertyRequestId },
      data: {
        adminStatus: "CLOSED",
        userStatus: "SEEN",
      }
    })


    await deleteMatchingKeys("propertyRequests:*");
    new CustomResponse(200, true, "updated successfully", res);


  } catch (error) {
    next(new InternalServerError("Failed to update developer assignment."));
  }
};


const getIsAdmin = (user: User, ) => {
    return ['ADMIN', 'SUPER_ADMIN'].includes(user.role);
}