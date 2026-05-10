
import { Request, Response, NextFunction } from "express";
import { Prisma } from "../../../lib/prisma";
import { swrCache } from "../../../lib/cache";
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError } from "../../../lib/appError";
import { getDateRange } from "../../../utils/getDateRange";
import { calculateTrend } from "../../../utils/calculateTrend";
import { getMonth } from "date-fns";


export const adminDashbroad = async (req: Request, res: Response, next: NextFunction) => {
  const limit = 10;
  const filterTime = (req.query.filterTime as string) || "this_year";
  const cacheKey = `adminDashbroad:${limit}:${filterTime}`;

  const { current, previous } = getDateRange("this_month");
  const { current: currentFilter } = getDateRange(filterTime);

  try {
    const result = await swrCache(cacheKey, async () => {
      const realtorMap = new Map<string, { name: string; propertiesSold: number; totalSoldAmount: number; currency: string }>();

      const [
        leaderBroadPropertiesData,
        recentPropertiesData,

        listedPropertiesCurrent, listedPropertiesPrevious,
        listedProjectCurrent,   listedProjectPrevious,
        pendingCurrent,         pendingPrevious,
        sellingCurrent,         sellingPrevious,
        soldCurrent,            soldPrevious,
        rejectedCurrent,        rejectedPrevious,
        trashedCurrent,         trashedPrevious,

        rewardCreditAgg,
        rewardDebitAgg,
        rewardRequestCount,

        users,
        propertyViewsAgg,
        activityRewardAgg,
        kyc,
      ] = await Promise.all([
        Prisma.property.findMany({
          where: {
            archived: false, status: "APPROVED", salesStatus: "SOLD",
            user: { role: { notIn: ["ADMIN", "SUPER_ADMIN"] } },
          },
          select: {
            userId: true,
            price: { select: { amount: true, currency: true } },
            user: { select: { fullname: true } },
          },
        }),

        Prisma.property.findMany({
          where: { archived: false },
          select: {
            id: true, createdAt: true, status: true, price: true,
            state: true, title: true, media: true,
            user: { select: { id: true, fullname: true } },
          },
          orderBy: { createdAt: "desc" },
          take: limit,
        }),

        Prisma.property.count({ where: { is_Property_A_Project: false, status: "APPROVED", archived: false, createdAt: { gte: current.start, lte: current.end } } }),
        Prisma.property.count({ where: { is_Property_A_Project: false, status: "APPROVED", archived: false, createdAt: { gte: previous.start, lte: previous.end } } }),

        Prisma.property.count({ where: { is_Property_A_Project: true, status: "APPROVED", archived: false, createdAt: { gte: current.start, lte: current.end } } }),
        Prisma.property.count({ where: { is_Property_A_Project: true, status: "APPROVED", archived: false, createdAt: { gte: previous.start, lte: previous.end } } }),

        Prisma.property.count({ where: { is_Property_A_Project: false, archived: false, status: "PENDING", createdAt: { gte: current.start, lte: current.end } } }),
        Prisma.property.count({ where: { is_Property_A_Project: false, archived: false, status: "PENDING", createdAt: { gte: previous.start, lte: previous.end } } }),

        Prisma.property.count({ where: { is_Property_A_Project: false, archived: false, status: "APPROVED", salesStatus: "SELLING", createdAt: { gte: current.start, lte: current.end } } }),
        Prisma.property.count({ where: { is_Property_A_Project: false, archived: false, status: "APPROVED", salesStatus: "SELLING", createdAt: { gte: previous.start, lte: previous.end } } }),

        Prisma.property.count({ where: { is_Property_A_Project: false, archived: false, status: "APPROVED", salesStatus: "SOLD", createdAt: { gte: current.start, lte: current.end } } }),
        Prisma.property.count({ where: { is_Property_A_Project: false, archived: false, status: "APPROVED", salesStatus: "SOLD", createdAt: { gte: previous.start, lte: previous.end } } }),

        Prisma.property.count({ where: { is_Property_A_Project: false, archived: false, status: "REJECTED", createdAt: { gte: current.start, lte: current.end } } }),
        Prisma.property.count({ where: { is_Property_A_Project: false, archived: false, status: "REJECTED", createdAt: { gte: previous.start, lte: previous.end } } }),

        Prisma.property.count({ where: { is_Property_A_Project: false, archived: false, status: "TRASHED", createdAt: { gte: current.start, lte: current.end } } }),
        Prisma.property.count({ where: { is_Property_A_Project: false, archived: false, status: "TRASHED", createdAt: { gte: previous.start, lte: previous.end } } }),

        Prisma.rewardHistory.aggregate({ _sum: { points: true }, where: { type: "CREDIT" } }),
        Prisma.rewardHistory.aggregate({ _sum: { points: true }, where: { type: "DEBIT" } }),
        Prisma.rewardRequest.count({ where: { status: "PENDING" } }),

        Prisma.user.count({ where: { createdAt: { gte: currentFilter.start, lte: currentFilter.end } } }),
        Prisma.property.aggregate({ _sum: { viewsCount: true }, where: { is_Property_A_Project: false, archived: false, createdAt: { gte: currentFilter.start, lte: currentFilter.end } } }),
        Prisma.rewardHistory.aggregate({ _sum: { points: true }, where: { type: "CREDIT", createdAt: { gte: currentFilter.start, lte: currentFilter.end } } }),
        Prisma.kyc.count({ where: { createdAt: { gte: currentFilter.start, lte: currentFilter.end } } }),
      ]);

      const listedPropertiesStats = calculateTrend(listedPropertiesCurrent, listedPropertiesPrevious);
      const listedProjectsStats   = calculateTrend(listedProjectCurrent,    listedProjectPrevious);
      const pendingStats          = calculateTrend(pendingCurrent,           pendingPrevious);
      const sellingStats          = calculateTrend(sellingCurrent,           sellingPrevious);
      const soldStats             = calculateTrend(soldCurrent,              soldPrevious);
      const rejectedStats         = calculateTrend(rejectedCurrent,          rejectedPrevious);
      const trashedStats          = calculateTrend(trashedCurrent,           trashedPrevious);

      const totalEarning = {
        CREDIT: rewardCreditAgg._sum.points ?? 0,
        DEBIT:  rewardDebitAgg._sum.points  ?? 0,
      };
      const totalEarningActivites = activityRewardAgg._sum.points   ?? 0;
      const propertyViews         = propertyViewsAgg._sum.viewsCount ?? 0;

      const properties = recentPropertiesData.map(property => ({
        slug: `#Arw-${property.id.slice(-3)}`,
        ...property,
      }));

      for (const property of leaderBroadPropertiesData) {
        const realtorId = property.userId;
        if (!realtorMap.has(realtorId)) {
          realtorMap.set(realtorId, {
            name: property.user.fullname,
            propertiesSold: 0,
            totalSoldAmount: 0,
            currency: property.price.currency,
          });
        }
        const realtor = realtorMap.get(realtorId)!;
        realtor.propertiesSold  += 1;
        realtor.totalSoldAmount += property.price.amount;
      }

      const topRealtors = [...realtorMap.values()]
        .sort((a, b) => b.propertiesSold - a.propertiesSold)
        .slice(0, 3);

      const totalPropertiesSold  = topRealtors.reduce((sum, r) => sum + r.propertiesSold, 0);
      const grandTotalSoldAmount = topRealtors.reduce((sum, r) => sum + r.totalSoldAmount, 0);
      const leaderboard = topRealtors.map((r) => ({
        ...r,
        percentage: Number(((r.propertiesSold / totalPropertiesSold) * 100).toFixed(2)),
      }));

      return {
        stats: {
          listedProperties:        { count: listedPropertiesCurrent, percentage: listedPropertiesStats.percentage, trend: listedPropertiesStats.trend },
          listedProjects:          { count: listedProjectCurrent,    percentage: listedProjectsStats.percentage,   trend: listedProjectsStats.trend },
          pendingListingProperties:{ count: pendingCurrent,          percentage: pendingStats.percentage,          trend: pendingStats.trend },
          sellingListedProperties: { count: sellingCurrent,          percentage: sellingStats.percentage,          trend: sellingStats.trend },
          soldListedProperties:    { count: soldCurrent,             percentage: soldStats.percentage,             trend: soldStats.trend },
          rejectedListedProperties:{ count: rejectedCurrent,         percentage: rejectedStats.percentage,         trend: rejectedStats.trend },
          trashedProperties:       { count: trashedCurrent,          percentage: trashedStats.percentage,          trend: trashedStats.trend },
        },
        recentProperties: properties,
        activities: {
          numberOfUsers: users,
          propertyViews,
          totalRewardsEarns: totalEarningActivites,
          kycSubmitted: kyc,
          totalPerformingProperties: 0,
        },
        rewardsData: {
          totalEarning,
          pendingRequests: rewardRequestCount,
        },
        leaderboardData: { leaderboard, grandTotalSoldAmount },
      };
    }, 3600);

    new CustomResponse(200, true, "Fetched successfully", res, result);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};


export const getDashbroadChart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { filterTime = "this_year" } = req.query;

    const { current, previous } = getDateRange(filterTime.toString());

    const cacheKey = `getAdminDashBroadChart`;

    const result = await swrCache(cacheKey, async () => {
      const [properties, totalProperties, CurrentProperties, PreviousProperties] = await Promise.all([
        Prisma.property.findMany({
          where: {
            status: "APPROVED",
            createdAt: { gte: current.start, lte: current.end }
          },
        }),

        Prisma.property.count({
          where: {
            status: "APPROVED",
          },
        }),

        Prisma.property.count({
          where: {
            status: "APPROVED",
            createdAt: { gte: current.start, lte: current.end }
          },
        }),
        Prisma.property.count({
          where: {
            status: "APPROVED",
            createdAt: { gte: previous.start, lte: previous.end }
          },
        }),
      ]);

      const months = Array.from({ length: 12 }, (_, i) => ({
        month: i,
        count: 0,
        price: 0
      }));

      for (const property of properties) {
        const monthIndex = getMonth(property.createdAt);
        months[monthIndex].count++;
        months[monthIndex].price += property.price.amount;
      }

      const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      const chartData = months.map((m) => ({
        month: monthLabels[m.month],
        count: m.count,
        price: m.price,
      }));

      const propertiesStats = calculateTrend(CurrentProperties, PreviousProperties);

      return {
        data: {
          result: chartData,
          stats: {
            totalProperties: {
              count: totalProperties,
              percentage: propertiesStats.percentage,
              trend: propertiesStats.trend
            },
          },
        }
      };
    });

    new CustomResponse(200, true, "success", res, result);
  } catch (error) {
    console.error(error);
    next(new InternalServerError("Server Error", 500));
  }
};
