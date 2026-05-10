import { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../../../lib/appError";
import { Prisma } from "../../../lib/prisma";
import CustomResponse from "../../../utils/helpers/response.util";
import { swrCache } from "../../../lib/cache";
import { getDateRange } from "../../../utils/getDateRange";
import { calculateTrend } from "../../../utils/calculateTrend";


export const userDashbroad = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id!;
    const filterTime = (req.query.filterTime as string) || "this_year";
    const cacheKey = `userdashbroad:${userId}:${filterTime}`;

    try {
        const { current, previous } = getDateRange(filterTime);

        const result = await swrCache(cacheKey, async () => {
            const [
                propertyLocationData,
                totalPropertyLocationData,

                rewardCreditAgg,
                rewardDebitAgg,
                rewards,

                listedPropertyCurrent,  listedPropertyPrevious,
                listedProjectCurrent,   listedProjectPrevious,
                pendingCurrent,         pendingPrevious,
                sellingCurrent,         sellingPrevious,
                soldCurrent,            soldPrevious,
                rejectedCurrent,        rejectedPrevious,
                trashedCurrent,         trashedPrevious,
            ] = await Promise.all([
                Prisma.property.findMany({
                    where: { userId, archived: false },
                    select: { location: true, status: true, title: true },
                    orderBy: { createdAt: "desc" },
                }),
                Prisma.property.count({ where: { userId, archived: false } }),

                Prisma.rewardHistory.aggregate({ _sum: { points: true }, where: { userId, type: "CREDIT" } }),
                Prisma.rewardHistory.aggregate({ _sum: { points: true }, where: { userId, type: "DEBIT" } }),
                Prisma.rewardHistory.findMany({
                    where: { userId },
                    select: { id: true, points: true, type: true, reason: true, createdAt: true },
                    orderBy: { createdAt: "desc" },
                    take: 20,
                }),

                Prisma.property.count({ where: { userId, archived: false, is_Property_A_Project: false, createdAt: { gte: current.start, lte: current.end } } }),
                Prisma.property.count({ where: { userId, archived: false, is_Property_A_Project: false, createdAt: { gte: previous.start, lte: previous.end } } }),

                Prisma.property.count({ where: { userId, archived: false, is_Property_A_Project: true, createdAt: { gte: current.start, lte: current.end } } }),
                Prisma.property.count({ where: { userId, archived: false, is_Property_A_Project: true, createdAt: { gte: previous.start, lte: previous.end } } }),

                Prisma.property.count({ where: { userId, archived: false, status: "PENDING", createdAt: { gte: current.start, lte: current.end } } }),
                Prisma.property.count({ where: { userId, archived: false, status: "PENDING", createdAt: { gte: previous.start, lte: previous.end } } }),

                Prisma.property.count({ where: { userId, archived: false, status: "APPROVED", salesStatus: "SELLING", createdAt: { gte: current.start, lte: current.end } } }),
                Prisma.property.count({ where: { userId, archived: false, status: "APPROVED", salesStatus: "SELLING", createdAt: { gte: previous.start, lte: previous.end } } }),

                Prisma.property.count({ where: { userId, archived: false, status: "APPROVED", salesStatus: "SOLD", createdAt: { gte: current.start, lte: current.end } } }),
                Prisma.property.count({ where: { userId, archived: false, status: "APPROVED", salesStatus: "SOLD", createdAt: { gte: previous.start, lte: previous.end } } }),

                Prisma.property.count({ where: { userId, archived: false, status: "REJECTED", createdAt: { gte: current.start, lte: current.end } } }),
                Prisma.property.count({ where: { userId, archived: false, status: "REJECTED", createdAt: { gte: previous.start, lte: previous.end } } }),

                Prisma.property.count({ where: { userId, archived: true, createdAt: { gte: current.start, lte: current.end } } }),
                Prisma.property.count({ where: { userId, archived: true, createdAt: { gte: previous.start, lte: previous.end } } }),
            ]);

            const listedStats        = calculateTrend(listedPropertyCurrent, listedPropertyPrevious);
            const listedProjectStats = calculateTrend(listedProjectCurrent,  listedProjectPrevious);
            const pendingStats       = calculateTrend(pendingCurrent,         pendingPrevious);
            const sellingStats       = calculateTrend(sellingCurrent,         sellingPrevious);
            const soldStats          = calculateTrend(soldCurrent,            soldPrevious);
            const rejectedStats      = calculateTrend(rejectedCurrent,        rejectedPrevious);
            const trashedStats       = calculateTrend(trashedCurrent,         trashedPrevious);

            const totalEarning = {
                CREDIT: rewardCreditAgg._sum.points ?? 0,
                DEBIT:  rewardDebitAgg._sum.points  ?? 0,
            };
            const difference = totalEarning.CREDIT - totalEarning.DEBIT;
            const withdrawableEarning = difference >= 200 ? difference - 200 : 0;

            return {
                stats: {
                    listedProperty: {
                        count:      listedPropertyCurrent,
                        percentage: listedStats.percentage,
                        trend:      listedStats.trend,
                    },
                    listedProject: {
                        count:      listedProjectCurrent,
                        percentage: listedProjectStats.percentage,
                        trend:      listedProjectStats.trend,
                    },
                    pendingListingProperty: {
                        count:      pendingCurrent,
                        percentage: pendingStats.percentage,
                        trend:      pendingStats.trend,
                    },
                    sellingListedProperty: {
                        count:      sellingCurrent,
                        percentage: sellingStats.percentage,
                        trend:      sellingStats.trend,
                    },
                    soldListedProperty: {
                        count:      soldCurrent,
                        percentage: soldStats.percentage,
                        trend:      soldStats.trend,
                    },
                    rejectedListedProperty: {
                        count:      rejectedCurrent,
                        percentage: rejectedStats.percentage,
                        trend:      rejectedStats.trend,
                    },
                    trashedListed: {
                        count:      trashedCurrent,
                        percentage: trashedStats.percentage,
                        trend:      trashedStats.trend,
                    },
                },
                rewardData: {
                    totalEarning,
                    withdrawableEarning,
                    rewards,
                },
                propertyLocations: {
                    locations:     propertyLocationData,
                    totalProperty: totalPropertyLocationData,
                },
            };
        }, 3600);

        new CustomResponse(200, true, "Fetched successfully", res, result);
    } catch (error) {
        next(new InternalServerError("Internal server error", 500));
    }
};


export const getPropertiesStatsByUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { page = "1", limit = "10", filterTime = "this_year" } = req.query;

    const { current, previous } = getDateRange(filterTime.toString());
    const pageNumber = parseInt(page as string, 10);
    const pageSize = parseInt(limit as string, 10);

    const cacheKey = `getPropertiesStats:${userId}:${JSON.stringify(req.query)}`;

    const result = await swrCache(cacheKey, async () => {
      const baseWhere = { userId, archived: false };

      const [properties, total] = await Promise.all([
        Prisma.property.findMany({
          where: baseWhere,
          select: {
            id: true,
            title: true,
            status: true,
            createdAt: true,
            sharesCount: true,
            viewsCount: true,
            media: {
              select: {
                url: true,
                altText: true,
                type: true,
                photoType: true,
                sizeInKB: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.property.count({ where: baseWhere })
      ]);

      const propertyIds = properties.map(p => p.id);

      const [currentLikesGrouped, previousLikesGrouped] = await Promise.all([
        Prisma.userPropertyLike.groupBy({
          by: ["propertyId"],
          where: { propertyId: { in: propertyIds }, createdAt: { gte: current.start, lte: current.end } },
          _count: { propertyId: true },
        }),
        Prisma.userPropertyLike.groupBy({
          by: ["propertyId"],
          where: { propertyId: { in: propertyIds }, createdAt: { gte: previous.start, lte: previous.end } },
          _count: { propertyId: true },
        }),
      ]);

      const currentLikesMap  = new Map(currentLikesGrouped.map(g  => [g.propertyId, g._count.propertyId]));
      const previousLikesMap = new Map(previousLikesGrouped.map(g => [g.propertyId, g._count.propertyId]));

      const enrichedProperties = properties.map(property => {
        const currentLikes  = currentLikesMap.get(property.id)  ?? 0;
        const previousLikes = previousLikesMap.get(property.id) ?? 0;
        const { percentage, trend } = calculateTrend(currentLikes, previousLikes);
        return {
          slug: `#Arw-${property.id.slice(-3)}`,
          performance: { likes: { current: currentLikes, previous: previousLikes }, percentage, trend },
          ...property,
        };
      });

      const totalPages = Math.ceil(total / pageSize);

      return {
        data: enrichedProperties,
        pagination: {
          total,
          page: pageNumber,
          pageSize,
          totalPages,
          nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
          prevPage: pageNumber > 1 ? pageNumber - 1 : null,
          canGoNext: pageNumber < totalPages,
          canGoPrev: pageNumber > 1
        }
      };
    });

    new CustomResponse(200, true, "success", res, result);
  } catch (error) {
    console.error(error);
    next(new InternalServerError("Server Error", 500));
  }
};
