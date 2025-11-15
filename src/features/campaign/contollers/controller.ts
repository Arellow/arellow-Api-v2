import { NextFunction, Request, Response } from "express";
import { InternalServerError } from "../../../lib/appError";
import { Prisma } from "../../../lib/prisma";
import CustomResponse from "../../../utils/helpers/response.util";
import { redis } from "../../../lib/redis";
import { swrCache } from "../../../lib/cache";
import { getDateRange } from "../../../utils/getDateRange";
import { calculateTrend } from "../../../utils/calculateTrend";
import { deleteImage, processImage } from "../../../utils/imagesprocess";
import { CampaignAddress, CampaignPlaceMent } from "@prisma/client";

import {  getMonth } from "date-fns";





export const AllActiveCampaigns = async (req: Request, res: Response, next: NextFunction) => {
  const campaignPlaceMent = req.query.campaignPlaceMent as CampaignPlaceMent || "LANDING";


  const today = new Date();


  try {


    const result = await Prisma.campaign.findMany({
      where: {
        campaignPlaceMent: { has: campaignPlaceMent },
        startDate: {
          lte: today,
        },
        endDate: {
          gte: today,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    new CustomResponse(200, true, "success", res, result);


  } catch (error) {
    next(new InternalServerError("Server Error", 500));
  }

};






export const AllCampaigns = async (req: Request, res: Response, next: NextFunction) => {


  const {

    page = "1",
    limit = "10"
  } = req.query;


  const pageNumber = parseInt(page as string, 10);
  const pageSize = parseInt(limit as string, 10);
  try {


    const cacheKey = `getAllCampaigns`;


    const result = await swrCache(cacheKey, async () => {
      const [properties, total] = await Promise.all([
        Prisma.campaign.findMany({

          orderBy: { createdAt: "desc" },
          skip: (pageNumber - 1) * pageSize,
          take: pageSize
        }),
        Prisma.campaign.count({ where: {} })
      ]);

      const totalPages = Math.ceil(total / pageSize);
      const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
      const prevPage = pageNumber > 1 ? pageNumber - 1 : null;

      return {
        data: properties,
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




export const campaignDashbroad = async (req: Request, res: Response, next: NextFunction) => {

  const limit = 10;
  const filterTime = req.query.filterTime || "this_year";

  const cacheKey = `campaignDashbroad:${limit}:${filterTime}`;

  const { current, previous } = getDateRange(filterTime.toString());



  try {


    const result = await swrCache(cacheKey, async () => {

      const [
        recentCampaignsData,

        campaigns,

        listedCurrentCampaigns,
        listedPreviousCampaigns,

        clicksCurrentCampaigns,
        clicksPreviousCampaigns,





      ] = await Promise.all([

        Prisma.campaign.findMany({
          where: {},
          orderBy: { createdAt: "desc" },
          take: 5

        }
        ),

        Prisma.campaign.findMany({
          select: {
            clicks: true,
            campaignPlaceMent: true
          }
        }),



        Prisma.campaign.count({
          where: {
            startDate: { gte: current.start },
            endDate: { lte: current.end }
          }
        }),
        Prisma.campaign.count({
          where: {
            startDate: { gte: previous.start },
            endDate: { lte: previous.end }
          }
        }),


        Prisma.campaign.findMany({
          where: {
            startDate: { gte: current.start },
            endDate: { lte: current.end }
          }
        }),
        Prisma.campaign.findMany({
          where: {
            startDate: { gte: current.start },
            endDate: { lte: current.end }
          }
        }),





      ]);





      // Initialize counters for all placements
      const placementClicks: Record<CampaignPlaceMent, number> = {
        LANDING: 0,
        BLOG: 0,
        PROPERTY: 0
      };

      // Sum clicks by placement
      for (const camp of campaigns) {
        for (const placement of camp.campaignPlaceMent) {
          placementClicks[placement] += camp.clicks;
        }
      }

      // Get total clicks
      const totalClicks = Object.values(placementClicks).reduce(
        (sum, v) => sum + v,
        0
      );

      // Percentage
      const placementPercentage = Object.fromEntries(
        Object.entries(placementClicks).map(([placement, clicks]) => {
          const percentage = totalClicks === 0 ? 0 : (clicks / totalClicks) * 100;
          return [placement, Number(percentage.toFixed(2))];
        })
      );


      const totalCurrentClicks = clicksCurrentCampaigns.reduce(
        (sum, v) => sum + v.clicks,
        0
      );
      const totalPreviousClicks = clicksPreviousCampaigns.reduce(
        (sum, v) => sum + v.clicks,
        0
      );





      const listedCampaignsStats = calculateTrend(listedCurrentCampaigns, listedPreviousCampaigns);
      const clicksCampaignsStats = calculateTrend(totalCurrentClicks, totalPreviousClicks);





      return {

        stats: {

          totalCampaigns: {
            count: listedCurrentCampaigns,
            percentage: listedCampaignsStats.percentage,
            trend: listedCampaignsStats.trend
          },
          totalClicksCampaigns: {
            count: totalCurrentClicks,
            percentage: clicksCampaignsStats.percentage,
            trend: clicksCampaignsStats.trend
          },


        },

        campaignsData: {
          placementClicks,
          totalClicks,
          placementPercentage
        },


        recentCampaignsData


      }
    })


    await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

    new CustomResponse(200, true, "Fetched successfully", res, result);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};


export const getCampaignStats = async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { filterTime = "this_year" } = req.query;

    const { current, previous } = getDateRange(filterTime.toString());

    const cacheKey = `getCampaignssStats`;

    const result = await swrCache(cacheKey, async () => {


      const [campaigns,] = await Promise.all([
        Prisma.campaign.findMany({
          where: {
            startDate: { gte: current.start },
            endDate: { lte: current.end }
          },
          select: {
            clicks: true,
            views: true,
            createdAt: true
          }
        }),



      ]);



      // const now = new Date();
      // const currentYear = getYear(now);

      // Initialize 12 months with 0 clicks
      const months = Array.from({ length: 12 }, (_, i) => ({
        month: i,
        clicks: 0,
        views: 0
      }));

      // Aggregate clicks
      for (const camp of campaigns) {
        // const year = getYear(camp.createdAt);
        // if (year === currentYear) {
          const monthIndex = getMonth(camp.createdAt); // 0 = Jan, 11 = Dec
          months[monthIndex].clicks += camp.clicks;
          months[monthIndex].views += camp.views;
        // }
      }

      // Convert month index to labels
      const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      const result = months.map((m) => ({
        month: monthLabels[m.month],
        clicks: m.clicks,
        viewa: m.views,
      }));




      return {
        data: result,

      };
    });

    new CustomResponse(200, true, "success", res, result);
  } catch (error) {
    console.error(error);
    next(new InternalServerError("Server Error", 500));
  }
};




export const createCampaign = async (req: Request, res: Response, next: NextFunction) => {
  const {
    campaignName,
    campaignPlaceMent,
    campaignAddress,
    endDate,
    startDate,
  } = req.body;


  const parsedCampaignPlaceMent: CampaignPlaceMent[] = typeof campaignPlaceMent === 'string' ? JSON.parse(campaignPlaceMent) : campaignPlaceMent;

  const parsedCampaignAddress: CampaignAddress = typeof campaignAddress === 'string' ? JSON.parse(campaignAddress) : campaignAddress;

  try {




    if (!req.file) {
      return next(new InternalServerError("Avatar not found", 404));
    }


    const website = campaignAddress.website?.toLowerCase();

    if (website && (website.includes('http://') || website.includes('https://'))) {
      return next(new InternalServerError("Website should not include 'http://' or 'https://'", 400));
    }



    const avatar = await processImage({
      folder: "campaign_container",
      image: req.file,
      photoType: "CAMPAIGN",
      type: "PHOTO"
    });



    if (!avatar) {
      return next(new InternalServerError("Avatar upload failed", 404));
    }


    const campaign = await Prisma.campaign.create({
      data: {
        campaignAddress: parsedCampaignAddress,
        campaignName,
        endDate: new Date(endDate),
        startDate: new Date(startDate),
        campaignPlaceMent: parsedCampaignPlaceMent,
        avatar: avatar || ""
      },
    });


    if (!campaign) {

      await deleteImage(avatar);

      return next(new InternalServerError("Failed to create campaign", 404));
    }



    return new CustomResponse(200, true, "Campaign created successfully", res);
  } catch (error) {
    next(error)
    // return next(new InternalServerError("Server Error", 500));
  }
};





export const clickCampaign = async (req: Request, res: Response, next: NextFunction) => {

  const { id } = req.params


  try {

    const campaign = await Prisma.campaign.findUnique({ where: { id } });

    if (campaign) {

      await Prisma.campaign.update({
        where: { id }, data: {
          clicks: {
            increment: 1
          }
        }
      })

    }


    return new CustomResponse(200, true, "Campaign created successfully", res);
  } catch (error) {
    return next(new InternalServerError("Server Error", 500));
  }
};


export const deleteCampaign = async (req: Request, res: Response, next: NextFunction) => {

  const { id } = req.params


  try {

    const campaign = await Prisma.campaign.findUnique({ where: { id } });

    if (campaign) {
      await deleteImage(campaign.avatar);

      await Prisma.campaign.delete({ where: { id } })

    }


    return new CustomResponse(200, true, "Campaign deleted successfully", res);
  } catch (error) {
    return next(new InternalServerError("Server Error", 500));
  }
};


export const updateCampaign = async (req: Request, res: Response, next: NextFunction) => {

  const { id } = req.params;


  const {
    campaignName,
    campaignPlaceMent,
    campaignAddress,
    endDate,
    startDate,
  } = req.body;

  const parsedCampaignPlaceMent: CampaignPlaceMent[] = typeof campaignPlaceMent === 'string' ? JSON.parse(campaignPlaceMent) : campaignPlaceMent;

  const parsedCampaignAddress: CampaignAddress = typeof campaignAddress === 'string' ? JSON.parse(campaignAddress) : campaignAddress;


  if (!req.file) {
    return next(new InternalServerError("Avatar not found", 404));
  }

  try {



    const website = campaignAddress.website?.toLowerCase();

    if (website && (website.includes('http://') || website.includes('https://'))) {
      return next(new InternalServerError("Website should not include 'http://' or 'https://'", 400));
    }



    const avatar = await processImage({
      folder: "campaign_container",
      image: req.file,
      photoType: "CAMPAIGN",
      type: "PHOTO"
    });



    if (!avatar) {
      return next(new InternalServerError("Avatar uploa failed", 404));
    }




    const campaign = await Prisma.campaign.findUnique({ where: { id } });

    if (campaign) {
      await deleteImage(campaign.avatar);




      const newcampaign = await Prisma.campaign.create({
        data: {
          campaignAddress: parsedCampaignAddress,
          campaignName,
          endDate,
          startDate,
          campaignPlaceMent: parsedCampaignPlaceMent,
          avatar: avatar || ""
        },
      });


      if (!newcampaign) {

        await deleteImage(avatar);

        return next(new InternalServerError("Failed to update campaign", 404));
      }

    }


    return new CustomResponse(200, true, "Campaign updated successfully", res);
  } catch (error) {
    return next(new InternalServerError("Server Error", 500));
  }
};
