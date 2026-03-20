import { NextFunction, Request, Response } from "express";
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError } from "../../../lib/appError";
import { deleteMatchingKeys, swrCache } from "../../../lib/cache";
import { LandCategory, SalesStatus } from "../../../../generated/prisma/enums";
import { redis } from "../../../lib/redis";
import { mapEnumValue } from "../../../utils/enumMap";
import { LandsCategoryMap } from "../routes/lands.validate";

import { Prisma, } from '../../../lib/prisma';
import { Prisma as prisma, } from "../../../../generated/prisma/client";
import { cloudinary } from "../../../configs/cloudinary";


export const singleLand = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const cacheKey = `land:${id}:${userId || ""}`;

    // Check cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return new CustomResponse(200, true, "Successfully from cache", res, JSON.parse(cached));
    }

    // Fetch from DB
    const land = await Prisma.lands.findUnique({
      where: { id },
      include: {
        media: true,
        user: {
          include: { media: true }
        },
         approvedBy: {select: {phone_number: true, id: true, email: true, avatar: true, username: true, role: true, createdAt: true}}
      }
    });

    if (!land) return next(new InternalServerError("Land not found", 404));

    // Determine if liked
    const isLiked = userId
      ? !!(await Prisma.userLandLike.findFirst({ where: { userId, landId: id } }))
      : false;

    // Increment views if not owner
    if (userId !== land.userId) {
      await Prisma.lands.update({
        where: { id },
        data: { viewsCount: { increment: 1 } }
      });
    }

    // Total views for owner
    const totalViews = await Prisma.lands.aggregate({
      _sum: { viewsCount: true },
      where: { userId: land.userId }
    });
    const totalViewsCount = totalViews._sum.viewsCount ?? 0;

    // Map enums
    land.category = mapEnumValue(LandsCategoryMap, land.category) as LandCategory;

    const { user, ...other } = land;
    const responseData = { ...other, isLiked, user: { ...user, totalViewsCount } };

    // Cache
    await redis.set(cacheKey, JSON.stringify(responseData), "EX", 60);

    new CustomResponse(200, true, "Successfully", res, responseData);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};



export const getLands = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const {
      category, state, city, country, neighborhood, minPrice, maxPrice, salesStatus,
      page = "1", limit = "10", search = ""
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const cacheKey = `lands:${userId}:${JSON.stringify(req.query)}`;

    const filters: prisma.LandsWhereInput = {
      archived: false,
      status: "APPROVED",
      AND: [
        search ? {
          OR: [
            { title: iLike(search as string) },
            { city: iLike(search as string) },
            { state: iLike(search as string) },
            { country: iLike(search as string) }
          ]
        } : undefined,
        category ? { category: category as LandCategory } : undefined,
        state ? { state: iLike(state as string) } : undefined,
        city ? { city: iLike(city as string) } : undefined,
        country ? { country: iLike(country as string) } : undefined,
        neighborhood ? { neighborhood: iLike(neighborhood as string) } : undefined,
        salesStatus ? { salesStatus: salesStatus as SalesStatus } : undefined,
        (minPrice || maxPrice) ? {
          price: {
            is: {
              amount: {
                ...(minPrice ? { gte: parseFloat(minPrice as string) } : {}),
                ...(maxPrice ? { lte: parseFloat(maxPrice as string) } : {})
              }
            }
          }
        } : undefined
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
    };

    if (userId) include.likedBy = { where: { userId }, select: { id: true } };

    const result = await swrCache(cacheKey, async () => {
      const [lands, total] = await Promise.all([
        Prisma.lands.findMany({ where: filters, include }),
        Prisma.lands.count({ where: filters }),

      ]);

      const totalPages = Math.ceil(total / pageSize);
      const paginated = shuffleArray(lands).slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

      const dataWithIsLiked = paginated.map(({ likedBy, ...rest }) => ({
        ...rest,
        isLiked: Array.isArray(likedBy) && likedBy.length > 0
      }));

      return {
        data: dataWithIsLiked,
        pagination: {
          total, page: pageNumber, pageSize, totalPages,
          nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
          prevPage: pageNumber > 1 ? pageNumber - 1 : null,
          canGoNext: pageNumber < totalPages,
          canGoPrev: pageNumber > 1
        }
      };
    });

    new CustomResponse(200, true, "Success", res, result);
  } catch (error) {
    next(error)
  }
};



export const getLandsByPartner = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const partnerId = req.params?.id;
    const {
      category, state, city, country, neighborhood, minPrice, maxPrice, salesStatus,
      page = "1", limit = "10", search = ""
    } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);
    const cacheKey = `partnerlands:${userId}:${partnerId}:${JSON.stringify(req.query)}`;


    const filters: prisma.LandsWhereInput = {
      userId: partnerId,
      archived: false,
      status: "APPROVED",
      AND: [
        search ? {
          OR: [
            { title: iLike(search as string) },
            { city: iLike(search as string) },
            { state: iLike(search as string) },
            { country: iLike(search as string) }
          ]
        } : undefined,
       (category && Object.values(LandCategory).includes(category as LandCategory))
      ? { category: category as LandCategory }
      : undefined,
        state ? { state: iLike(state as string) } : undefined,
        city ? { city: iLike(city as string) } : undefined,
        country ? { country: iLike(country as string) } : undefined,
        neighborhood ? { neighborhood: iLike(neighborhood as string) } : undefined,
        salesStatus ? { salesStatus: salesStatus as SalesStatus } : {salesStatus: "SELLING"},
        (minPrice || maxPrice) ? {
          price: {
            is: {
              amount: {
                ...(minPrice ? { gte: parseFloat(minPrice as string) } : {}),
                ...(maxPrice ? { lte: parseFloat(maxPrice as string) } : {})
              }
            }
          }
        } : undefined
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
   
      approvedBy: {select: {phone_number: true, id: true, email: true, avatar: true, username: true, role: true }}


    };

    if (userId) include.likedBy = { where: { userId }, select: { id: true } };


    const result = await swrCache(cacheKey, async () => {
      const [lands, total,
        // category type
        OTHERS,
        GATES_ESTATE,
        GOVERNMENT_ALLOCATION,
        COMMUNITY,
        MIXED_USED,
        INDUSTRIAL,
        COMMERCIAL,
        ESTATE,
        // 
        partnerDetail


      ] = await Promise.all([
        Prisma.lands.findMany({ where: filters, include ,
           orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.lands.count({ where: filters }),

        // category count
        Prisma.lands.count({ where: { userId: partnerId, archived: false, status: "APPROVED", category: "OTHERS" } }),
        Prisma.lands.count({ where: { userId: partnerId, archived: false, status: "APPROVED", category: "GATES_ESTATE" } }),
        Prisma.lands.count({ where: { userId: partnerId, archived: false, status: "APPROVED", category: "GOVERNMENT_ALLOCATION" } }),
        Prisma.lands.count({ where: { userId: partnerId, archived: false, status: "APPROVED", category: "COMMUNITY" } }),
        Prisma.lands.count({ where: { userId: partnerId, archived: false, status: "APPROVED", category: "MIXED_USED" } }),
        Prisma.lands.count({ where: { userId: partnerId, archived: false, status: "APPROVED", category: "INDUSTRIAL" } }),
        Prisma.lands.count({ where: { userId: partnerId, archived: false, status: "APPROVED", category: "COMMERCIAL" } }),
        Prisma.lands.count({ where: { userId: partnerId, archived: false, status: "APPROVED", category: "ESTATE" } }),

        // partner
        Prisma.arellowPartner.findUnique({where: {id: partnerId},  
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
        } })


      ]);

      // const totalPages = Math.ceil(total / pageSize);
      // const paginated = shuffleArray(lands).slice((pageNumber - 1) * pageSize, pageNumber * pageSize);




      const dataWithIsLiked = lands.map(({ likedBy, ...rest }) => ({
        ...rest,
        isLiked: Array.isArray(likedBy) && likedBy.length > 0
      }));


         const totalPages = Math.ceil(total / pageSize);
      const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
      const prevPage = pageNumber > 1 ? pageNumber - 1 : null;

      return {
        data: dataWithIsLiked,
        category_count: {
          OTHERS,
          GATES_ESTATE,
          GOVERNMENT_ALLOCATION,
          COMMUNITY,
          MIXED_USED,
          INDUSTRIAL,
          COMMERCIAL,
          ESTATE
        },
        partnerDetail,
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

    new CustomResponse(200, true, "Success", res, result);
  } catch (error) {
    next(error)
  }
};




export const shareLand = async (req: Request, res: Response, next: NextFunction) => {

  const landId = req.params.id;

  try {
    // Check if already liked
    const existingLand = await Prisma.lands.findUnique({
      where: {
        id: landId
      },
    });

    if (!existingLand) {
      next(new InternalServerError("Land not found", 400));
    }


    // Increment likes count
    await Prisma.lands.update({
      where: { id: landId },
      data: { sharesCount: { increment: 1 } },
    });


    new CustomResponse(200, true, "Property Shared", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};


// likes a property
export const likeLand = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id!;
  const landId = req.params.id;

  // const cacheKey = `saved:${userId}`;

  try {
    // Check if already liked
    const existingLike = await Prisma.userLandLike.findUnique({
      where: {
        userId_landId: {
          userId,
          landId
        },
      },
    });

    if (existingLike) {
      next(new InternalServerError("Land already liked", 400));
    }

    // Create like relation
    await Prisma.userLandLike.create({
      data: {
        user: { connect: { id: userId } },
        land: { connect: { id: landId } },
      },
    });

    // Increment likes count
    await Prisma.lands.update({
      where: { id: landId },
      data: { likesCount: { increment: 1 } },
    });


     const cacheKey = `land:${landId}:${userId || ""}`;
      const lastestCacheKey = `partnerlands:${userId}:*`;

    await deleteMatchingKeys(cacheKey);
    await deleteMatchingKeys(lastestCacheKey);


    new CustomResponse(200, true, "Land liked", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};


// Unlike a property
export const unLikeLand = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?.id!;
  const landId = req.params.id;


  try {
    // Delete the like relation
    const deleteResult = await Prisma.userLandLike.deleteMany({
      where: {
        userId,
        landId,
      },
    });

    if (deleteResult.count === 0) {
      next(new InternalServerError("Like does not exist", 400));
    }

    // Decrement likes count
    await Prisma.lands.update({
      where: { id: landId },
      data: { likesCount: { decrement: 1 } },
    });

      const cacheKey = `land:${landId}:${userId || ""}`;
      const lastestCacheKey = `partnerlands:${userId}:*`;

    await deleteMatchingKeys(cacheKey);
    await deleteMatchingKeys(lastestCacheKey);

    new CustomResponse(200, true, "Land unliked", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};



export const deleteLand = async (req: Request, res: Response, next: NextFunction) => {
  const { id: landId } = req.params;
  try {

    const land = await Prisma.lands.findUnique({ where: { id: landId } });
    if (!land) {
      return next(new InternalServerError("Land not found", 404));
    }

    //  Delete old media
    const oldMedia = await Prisma.media.findMany({
      where: { landsId: landId },
    });

    // Delete from Cloudinary
    for (const media of oldMedia) {
      try {
        await cloudinary.uploader.destroy(media.publicId);
      } catch (err) {
        // console.warn(`Failed to delete media ${media.publicId}:`, err);
      }
    }

    // Delete from DB
    await Prisma.media.deleteMany({ where: { landsId: landId } });

    await Prisma.userLandLike.deleteMany({ where: { landId } });
 

    await Prisma.lands.delete({ where: { id: landId } });

    await deleteMatchingKeys(`lands:*`);

    new CustomResponse(200, true, "Land deleted permanently", res,);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));

  }

};




const iLike = (value?: string) => value ? { contains: value, mode: "insensitive" } : undefined;
const shuffleArray = <T>(arr: T[]) => arr.map(v => ({ v, sort: Math.random() })).sort((a, b) => a.sort - b.sort).map(({ v }) => v);
