
import { Request, Response, NextFunction } from "express";
import { getUsersService } from "../services/user";
import { UserQueryDTO } from "../dtos/user.dto";
import { Prisma } from "../../../lib/prisma";
import { deleteMatchingKeys, swrCache } from "../../../lib/cache";
import { Prisma as prisma, UserRole } from "@prisma/client";
import { redis } from "../../../lib/redis";
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError } from "../../../lib/appError";

export const getUsersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query: UserQueryDTO = req.query;
    const result = await getUsersService(query);

    res.status(200).json({
      status: "success",
      data: result.users,
      total: result.total,
      page: result.page,
      pages: result.pages,
    });
  } catch (error: any) {
    console.error("User fetch failed", error);
    res.status(500).json({
      status: "failed",
      message: error.message || "Internal server error",
    });
  }
};


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

//  await deleteMatchingKeys(cacheKey);


