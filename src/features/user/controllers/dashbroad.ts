import { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../../../lib/appError";
import { Prisma } from "../../../lib/prisma";
import CustomResponse from "../../../utils/helpers/response.util";
import { swrCache } from "../../../lib/cache";
import { getDateRange } from "../../../utils/getDateRange";
import { calculateTrend } from "../../../utils/calculateTrend";


export const userDashbroad = async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id!;
    const filterTime = req.query.filterTime as string | undefined;
    const cacheKey = `userdashbroad:${userId}:${filterTime ?? "all"}`;

    try {
        // When no filterTime: count all-time, no trend comparison
        const dateRange = filterTime ? getDateRange(filterTime) : null;

        const curr = (extra: object) => ({
            userId, ...extra,
            ...(dateRange ? { createdAt: { gte: dateRange.current.start,  lte: dateRange.current.end  } } : {}),
        });
        const prevCount = (extra: object) =>
            dateRange
                ? Prisma.property.count({ where: { userId, ...extra, createdAt: { gte: dateRange.previous.start, lte: dateRange.previous.end } } })
                : Promise.resolve(0);



        const trend = (cur: number, prv: number) =>
            dateRange ? calculateTrend(cur, prv) : { percentage: 0, trend: "equal" as const };

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
                propertyRequestCurrent, propertyRequestPrevious,
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

                Prisma.property.count({ where: curr({ archived: false, is_Property_A_Project: false }) }),
                prevCount({ archived: false, is_Property_A_Project: false }),

                Prisma.property.count({ where: curr({ archived: false, is_Property_A_Project: true }) }),
                prevCount({ archived: false, is_Property_A_Project: true }),

                Prisma.property.count({ where: curr({ archived: false, status: "PENDING" }) }),
                prevCount({ archived: false, status: "PENDING" }),

                Prisma.property.count({ where: curr({ archived: false, status: "APPROVED", salesStatus: "SELLING" }) }),
                prevCount({ archived: false, status: "APPROVED", salesStatus: "SELLING" }),

                Prisma.property.count({ where: curr({ archived: false, status: "APPROVED", salesStatus: "SOLD" }) }),
                prevCount({ archived: false, status: "APPROVED", salesStatus: "SOLD" }),

                Prisma.property.count({ where: curr({ archived: false, status: "REJECTED" }) }),
                prevCount({ archived: false, status: "REJECTED" }),

                Prisma.property.count({ where: curr({ archived: true }) }),
                prevCount({ archived: true }),

                Prisma.propertyRequest.count({ where: {createdById: userId,  ...(dateRange ? { createdAt: { gte: dateRange.current.start,  lte: dateRange.current.end  } } : {}) } }),
                Prisma.propertyRequest.count({ where: { createdById: userId ,  ...(dateRange ? { createdAt: { gte: dateRange.previous.start,  lte: dateRange.previous.end  } } : {})} }),
            ]);

            const listedStats        = trend(listedPropertyCurrent, listedPropertyPrevious);
            const listedProjectStats = trend(listedProjectCurrent,  listedProjectPrevious);
            const pendingStats       = trend(pendingCurrent,         pendingPrevious);
            const sellingStats       = trend(sellingCurrent,         sellingPrevious);
            const soldStats          = trend(soldCurrent,            soldPrevious);
            const rejectedStats      = trend(rejectedCurrent,        rejectedPrevious);
            const trashedStats       = trend(trashedCurrent,         trashedPrevious);
            const requestStats       = trend(propertyRequestCurrent, propertyRequestPrevious);

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
                    propertyRequest: { 
                      count: propertyRequestCurrent,  
                      percentage: requestStats.percentage,  
                      trend: requestStats.trend 
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
