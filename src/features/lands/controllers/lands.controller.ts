
import { NextFunction, Request, Response } from "express";
import { Prisma, } from '../../../lib/prisma';
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError, UnAuthorizedError } from "../../../lib/appError";

import { redis } from "../../../lib/redis";
import { deleteMatchingKeys, swrCache } from "../../../lib/cache";
import { mapEnumValue } from "../../../utils/enumMap";
import { canUserAffordProperty } from "../../../utils/buyabilitycalculator";
import { LandCategory,  SalesStatus } from "../../../../generated/prisma/enums";
import { Prisma as prisma, } from "../../../../generated/prisma/client";
import { getDateRange } from "../../../utils/getDateRange";
import { LandsCategoryMap } from "../routes/lands.validate";


//All get requests

export const singleLand = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id;

  const cacheKey = `land:${id}:${userId || ""}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    res.status(200).json({
      success: true,
      message: "successfully from cache",
      data: JSON.parse(cached)
    });
    return
  }

  try {

    // find single
    const lands = await Prisma.lands.findUnique({
      where: { id },
      include: {
        media: {
          select: {
            url: true,
            altText: true,
            type: true,
            photoType: true,
            sizeInKB: true

          }
        },
        user: {
          include: {
           media: {
          select: {
            url: true,
            altText: true,
            type: true,
            photoType: true,
            sizeInKB: true

          }
        }
          }
        }
        // user: {
        //   select: {
        //     id: true,
        //     // role: true,
        //     email: true,
        //     // fullname: true,
        //     username: true,
        //     is_verified: true,
        //     avatar: true,
        //     createdAt: true,
        //     lastSeen: true,
        //     online: true,
        //     // approvedProperties: {
        //     //   where: { archived: false, status: "APPROVED" },
        //     //   include: {
        //     //     _count: true,
        //     //     amenities: true,
        //     //     media: true,

        //     //   }
        //     // }

        //   }
        // }

      },
    });



    if (!lands) {
      return next(new InternalServerError("Property not found", 404));
    }

    let isLiked = false;

    if (userId) {
      const like = await Prisma.userLandLike.findFirst({
        where: {
          userId,
          landId: id
        }
      });

      isLiked = !!like;
    }


    if (userId !== lands.userId) {
      await Prisma.lands.update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
      })
    }


    const totalViews = await Prisma.lands.aggregate({
      _sum: {
        viewsCount: true
      },
      where: {
        userId: lands?.userId
      }
    });

    const totalViewsCount = totalViews._sum.viewsCount ?? 0;


    lands.category = mapEnumValue(LandsCategoryMap, lands.category) as LandCategory;


    const { user, ...other } = lands;


    const responseData = {
      ...other,
      isLiked,
      user: { ...user, totalViewsCount }

    };

    await redis.set(cacheKey, JSON.stringify(responseData), "EX", 60);

    new CustomResponse(200, true, "successfully", res, responseData);
  } catch (error) {

    next(new InternalServerError("Internal server error", 500));
    // next(error)
  }


};



export const getLands = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    const {
      category,
      state,
      city,
      country,
      neighborhood,
      minPrice,
      maxPrice,
      salesStatus,
      page = "1",
      limit = "10"
    } = req.query;

    const search = (req.query.search as string) || "";

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    const cacheKey = `lastestland:${userId}:${JSON.stringify(req.query)}`;

    const matchedCategory = getValidCategory(search);


    const filters: prisma.LandsWhereInput = {
      archived: false,
      status: "APPROVED",

      AND: [
        search
          ? {
            OR: [
              { title: iLike(search) },
              matchedCategory ? { category: matchedCategory } : null,
              { city: iLike(search) },
              { state: iLike(search) },
              { country: iLike(search) }
            ].filter(Boolean)
          }
          : undefined,

        category ? { category: category as LandCategory } : undefined,

        state ? { state: iLike(state as string) } : undefined,
        city ? { city: iLike(city as string) } : undefined,
        country ? { country: iLike(country as string) } : undefined,
        neighborhood ? { neighborhood: iLike(neighborhood as string) } : undefined,
        salesStatus ? { salesStatus: salesStatus as SalesStatus } : undefined,

        (minPrice || maxPrice)
          ? {

            price: {
              is: {
                amount: {
                  ...(minPrice ? { gte: parseFloat(minPrice as string) } : {}),
                  ...(maxPrice ? { lte: parseFloat(maxPrice as string) } : {})
                }
              }

            }
          }
          : undefined,
      ].filter(Boolean) as prisma.LandsWhereInput[]
    };


    const include: any = {
      media: {
        select: {
          url: true,
          altText: true,
          type: true,
          photoType: true,
          sizeInKB: true
        }
      },
      user: {
        select: {
          email: true,
          fullname: true,
          username: true,
          is_verified: true,
          avatar: true,
          // approvedProperties: {
          //   include: {
          //     _count: true
          //   }
          // }
        }
      },

    };

    // Only include likedBy if user is logged in
    if (userId) {
      include.likedBy = {
        where: {
          userId: userId
        },
        select: {
          id: true
        }
      };
    }


    const result = await swrCache(cacheKey, async () => {
      const [properties, total] = await Promise.all([
        Prisma.lands.findMany({
          where: filters,
          include,
          // orderBy: { createdAt: "desc" },
          // skip: (pageNumber - 1) * pageSize,
          // take: pageSize
          // take: 50
        }),
        Prisma.lands.count({ where: filters })
      ]);

      const totalPages = Math.ceil(total / pageSize);
      const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
      const prevPage = pageNumber > 1 ? pageNumber - 1 : null;

      const shuffled = shuffleArray(properties);
      const paginated = shuffled.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);


      const dataWithIsLiked = paginated.map(({ likedBy, ...rest }) => ({
        ...rest,
        isLiked: Array.isArray(likedBy) && likedBy.length > 0
      }));


      return {
        data: dataWithIsLiked,
        pagination: {
          total,
          page: pageNumber,
          pageSize,
          totalPages,
          nextPage,
          prevPage,
          canGoNext: pageNumber < totalPages,
          canGoPrev: pageNumber > 1
        }
      };
    });

    new CustomResponse(200, true, "success", res, result);


  } catch (error) {

    next(new InternalServerError("Server Error", 500));

  }

};











function getValidCategory(value: string): LandCategory | null {
  if (!value) return null
  const lowerValue = value.toLowerCase();
  return (
    Object.values(LandCategory).find(
      (category) => category.toLowerCase().includes(lowerValue)
    ) ?? null
  );
}


const iLike = (field?: string) =>
  field ? { contains: field, mode: "insensitive" } : undefined;


function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}


