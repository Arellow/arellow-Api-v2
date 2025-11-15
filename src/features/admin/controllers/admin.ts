
import { Request, Response, NextFunction } from "express";
import { Prisma } from "../../../lib/prisma";
import { swrCache } from "../../../lib/cache";
import { CampaignPlaceMent, } from "@prisma/client";
import { redis } from "../../../lib/redis";
import CustomResponse from "../../../utils/helpers/response.util";
import { InternalServerError } from "../../../lib/appError";

import { getDateRange } from "../../../utils/getDateRange";

import { getMonth } from "date-fns";
import { calculateTrend } from "../../../utils/calculateTrend";


type IRewards = {
  CREDIT: number,
  DEBIT: number,
  PENDING: number
};


export const adminDashbroad = async (req: Request, res: Response, next: NextFunction) => {

  const limit = 10;
  const filterTime = req.query.filterTime || "this_year";

  const cacheKey = `adminDashbroad:${limit}:${filterTime}`;

  const { current, previous } = getDateRange("this_month");

  const { current: currentFilter, previous: previousFilter } = getDateRange(filterTime as string);



  try {


    const result = await swrCache(cacheKey, async () => {

      const [
        recentPropertiesData,


        // property
        listedPropertiesCurrent,
        listedPropertiesPrevious,

        listedProjectCurrent,
        listedProjectPrevious,

        pendingCurrent,
        pendingPrevious,

        sellingCurrent,
        sellingPrevious,

        soldCurrent,
        soldPrevious,

        rejectedCurrent,
        rejectedPrevious,


        trashedCurrent,
        trashedPrevious,


        rewards,
        rewardRequest,
        users,
        activitiesProperties,
        activitiesRewards,
        kyc,



      ] = await Promise.all([

        Prisma.property.findMany({
          where: { archived: false },
          select: {
            id: true,
            createdAt: true,
            status: true,
            price: true,
            state: true,
            title: true,
            media: true,
            user: {
              select: { fullname: true },
            }

          },
          orderBy: { createdAt: "desc" },
          take: limit

        }
        ),



        //   PROPERTIES
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




        // // buy ability
        // Prisma.propertyRequest.count({ where: { createdAt: { gte: current.start, lte: current.end } } }),
        // Prisma.propertyRequest.count({ where: { createdAt: { gte: previous.start, lte: previous.end } } }),


        // // property request
        // Prisma.propertyRequest.count({ where: { createdAt: { gte: current.start, lte: current.end } } }),
        // Prisma.propertyRequest.count({ where: { createdAt: { gte: previous.start, lte: previous.end } } }),



        // rewards
        Prisma.rewardHistory.findMany({ where: {} }),
        Prisma.rewardRequest.findMany({ where: { status: "PENDING" } }),


        // activities
        Prisma.user.count({ where: { createdAt: { gte: currentFilter.start, lte: currentFilter.end } } }),
        Prisma.property.findMany({ where: { is_Property_A_Project: false, archived: false, createdAt: { gte: currentFilter.start, lte: currentFilter.end } } }),
        Prisma.rewardHistory.findMany({ where: { type: "CREDIT", createdAt: { gte: currentFilter.start, lte: currentFilter.end } } }),
        Prisma.kyc.count({ where: { createdAt: { gte: currentFilter.start, lte: currentFilter.end } } }),







      ]);





      // // Initialize counters for all placements
      // const rewardsData: Record<IRewards, number> = {
      //   CREDIT: 0,
      //   DEBIT: 0,
      //   PENDING: 0
      // };

      // // // Sum clicks by placement
      // for (const reward of rewards) {

      //   // for (const placement of reward.) {
      //   //   placementClicks[placement] += camp.clicks;
      //   // }
      // }

      // // Get total clicks
      // const totalClicks = Object.values(placementClicks).reduce(
      //   (sum, v) => sum + v,
      //   0
      // );

      // // Percentage
      // const placementPercentage = Object.fromEntries(
      //   Object.entries(placementClicks).map(([placement, clicks]) => {
      //     const percentage = totalClicks === 0 ? 0 : (clicks / totalClicks) * 100;
      //     return [placement, Number(percentage.toFixed(2))];
      //   })
      // );



      // const totalCurrentClicks = clicksCurrentCampaigns.reduce(
      //   (sum, v) => sum + v.clicks,
      //   0
      // );
      // const totalPreviousClicks = clicksPreviousCampaigns.reduce(
      //   (sum, v) => sum + v.clicks,
      //   0
      // );




      const listedPropertiesStats = calculateTrend(listedPropertiesCurrent, listedPropertiesPrevious);
      const listedProjectsStats = calculateTrend(listedProjectCurrent, listedProjectPrevious);
      const pendingStats = calculateTrend(pendingCurrent, pendingPrevious);
      const sellingStats = calculateTrend(sellingCurrent, sellingPrevious);
      const soldStats = calculateTrend(soldCurrent, soldPrevious);
      const rejectedStats = calculateTrend(rejectedCurrent, rejectedPrevious);
      const trashedStats = calculateTrend(trashedCurrent, trashedPrevious);


      // activities




      const totalEarning = rewards.reduce((v, c) => {

        if (c.type == "CREDIT") {
          v.CREDIT += c.points;
        }

        if (c.type == "DEBIT") {
          v.DEBIT += c.points;
        }

        return v;
      }, { CREDIT: 0, DEBIT: 0, });

      const totalEarningActivites = activitiesRewards.reduce((v, c) => {

        v += c.points;
        return v;
      }, 0);


      const propertyViews = activitiesProperties.reduce((v, c) => {

        v += c.viewsCount;

        return v;

      }, 0);




      // Percentage
      // const placementPercentage = Object.fromEntries(
      //   Object.entries(placementClicks).map(([placement, clicks]) => {
      //     const percentage = totalClicks === 0 ? 0 : (clicks / totalClicks) * 100;
      //     return [placement, Number(percentage.toFixed(2))];
      //   })
      // );


      // const pendingRewardPercentage = rewardRequest. === 0 ? 0 : (clicks / totalClicks) * 100;




      // recentPropertiesData
      const properties = recentPropertiesData.map(property => ({
        slug: `#Arw-${property.id.slice(-3)}`,
        ...property

      }));

      return {

        stats: {

          listedProperties: {
            count: listedPropertiesCurrent,
            percentage: listedPropertiesStats.percentage,
            trend: listedPropertiesStats.trend
          },
          listedProjects: {
            count: listedProjectCurrent,
            percentage: listedProjectsStats.percentage,
            trend: listedProjectsStats.trend
          },
          pendingListingProperties: {
            count: pendingCurrent,
            percentage: pendingStats.percentage,
            trend: pendingStats.trend
          },
          sellingListedProperties: {
            count: sellingCurrent,
            percentage: sellingStats.percentage,
            trend: sellingStats.trend
          },
          soldListedProperties: {
            count: soldCurrent,
            percentage: soldStats.percentage,
            trend: soldStats.trend
          },
          rejectedListedProperties: {
            count: rejectedCurrent,
            percentage: rejectedStats.percentage,
            trend: rejectedStats.trend
          },
          trashedProperties: {
            count: trashedCurrent,
            percentage: trashedStats.percentage,
            trend: trashedStats.trend
          },

        },
        recentProperties: properties,

        activities: {
          numberOfUsers: users,
          propertyViews,
          totalRewardsEarns: totalEarningActivites,
          kycSubmitted: kyc,
          totalPerformingProperties: 0

        },
        rewardsData: {
          // pendingReward:{
          //   count: rewardRequest,
          //   percentage: 
          // }
        }
      }
    })


    await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

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



      // Initialize 12 months with 0 clicks
      const months = Array.from({ length: 12 }, (_, i) => ({
        month: i,
        count: 0,
        price: 0
      }));

      // Aggregate clicks
      for (const property of properties) {

        const monthIndex = getMonth(property.createdAt);
        months[monthIndex].count++;
        months[monthIndex].price += property.price.amount;
      }

      // Convert month index to labels
      const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      const result = months.map((m) => ({
        month: monthLabels[m.month],
        count: m.count,
        price: m.price,
      }));



      const propertiesStats = calculateTrend(CurrentProperties, PreviousProperties);


      return {
        data: {

          result,

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
