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
  const userId = req.user?.id!;

  const limit = 10;
  const filterTime = req.query.filterTime || "this_year";

  const cacheKey = `campaignDashbroad:${limit}:${filterTime}`;

  const { current, previous } = getDateRange(filterTime.toString());



  try {


    const result = await swrCache(cacheKey, async () => {

      const [
        //property locations
        propertyLocationData, totalPropertyLocationData,

        //rewards
        rewards,

        // property
        listedCurrent,
        listedPrevious,

        pendingCurrent,
        pendingPrevious,

        sellingCurrent,
        sellingPrevious,

        soldCurrent,
        soldPrevious,

        rejectedCurrent,
        rejectedPrevious,


        buyAbilityCurrent,
        buyAbilityPrevious,

        propertyRequestCurrent,
        propertyRequestPrevious,



      ] = await Promise.all([

        Prisma.property.findMany({
          where: { userId, archived: false },
          select: { location: true, status: true, title: true },
          orderBy: { createdAt: "desc" },
        }
        ),
        Prisma.property.count({ where: { userId, archived: false, } }),



        Prisma.rewardHistory.findMany({
          where: { userId },
          select: {
            id: true,
            points: true,
            type: true,
            reason: true,
            createdAt: true
          }
        }),


        //   PROPERTIES
        Prisma.property.count({ where: { userId, archived: false, createdAt: { gte: current.start, lte: current.end } } }),
        Prisma.property.count({ where: { userId, archived: false, createdAt: { gte: previous.start, lte: previous.end } } }),

        Prisma.property.count({ where: { userId, archived: false, status: "PENDING", createdAt: { gte: current.start, lte: current.end } } }),
        Prisma.property.count({ where: { userId, archived: false, status: "PENDING", createdAt: { gte: previous.start, lte: previous.end } } }),

        Prisma.property.count({ where: { userId, archived: false, status: "APPROVED", salesStatus: "SELLING", createdAt: { gte: current.start, lte: current.end } } }),
        Prisma.property.count({ where: { userId, archived: false, status: "APPROVED", salesStatus: "SELLING", createdAt: { gte: previous.start, lte: previous.end } } }),

        Prisma.property.count({ where: { userId, archived: false, status: "APPROVED", salesStatus: "SOLD", createdAt: { gte: current.start, lte: current.end } } }),
        Prisma.property.count({ where: { userId, archived: false, status: "APPROVED", salesStatus: "SOLD", createdAt: { gte: previous.start, lte: previous.end } } }),

        Prisma.property.count({ where: { userId, archived: false, status: "REJECTED", createdAt: { gte: current.start, lte: current.end } } }),
        Prisma.property.count({ where: { userId, archived: false, status: "REJECTED", createdAt: { gte: previous.start, lte: previous.end } } }),


        // buy ability
        Prisma.propertyRequest.count({ where: { createdById: userId, createdAt: { gte: current.start, lte: current.end } } }),
        Prisma.propertyRequest.count({ where: { createdById: userId, createdAt: { gte: previous.start, lte: previous.end } } }),


        // property request
        Prisma.propertyRequest.count({ where: { createdById: userId, createdAt: { gte: current.start, lte: current.end } } }),
        Prisma.propertyRequest.count({ where: { createdById: userId, createdAt: { gte: previous.start, lte: previous.end } } }),



      ]);


      const listedStats = calculateTrend(listedCurrent, listedPrevious);
      const pendingStats = calculateTrend(pendingCurrent, pendingPrevious);
      const sellingStats = calculateTrend(sellingCurrent, sellingPrevious);
      const soldStats = calculateTrend(soldCurrent, soldPrevious);
      const rejectedStats = calculateTrend(rejectedCurrent, rejectedPrevious);

      const buyAbilityStats = calculateTrend(buyAbilityCurrent, buyAbilityPrevious);
      const propertyRequestStats = calculateTrend(propertyRequestCurrent, propertyRequestPrevious);


      const totalEarning = rewards.reduce((v, c) => {

        if (c.type == "CREDIT") {
          v.CREDIT += c.points;
        }

        if (c.type == "DEBIT") {
          v.DEBIT += c.points;
        }

        return v;
      }, { CREDIT: 0, DEBIT: 0 });

      let withdrawableEarning = 0;
      const difference = totalEarning.CREDIT - totalEarning.DEBIT;

      if (totalEarning.DEBIT > totalEarning.CREDIT) {
        withdrawableEarning = 0;
      } else if (difference >= 200) {
        withdrawableEarning = difference - 200;
      } else {
        withdrawableEarning = 0;
      }

      return {

        stats: {

          listedProperty: {
            count: listedCurrent,
            percentage: listedStats.percentage,
            trend: listedStats.trend
          },
          pendingListingProperty: {
            count: pendingCurrent,
            percentage: pendingStats.percentage,
            trend: pendingStats.trend
          },
          sellingListedProperty: {
            count: sellingCurrent,
            percentage: sellingStats.percentage,
            trend: sellingStats.trend
          },
          soldListedProperty: {
            count: soldCurrent,
            percentage: soldStats.percentage,
            trend: soldStats.trend
          },
          rejectedListedProperty: {
            count: rejectedCurrent,
            percentage: rejectedStats.percentage,
            trend: rejectedStats.trend
          },
          buyPropertyAbility: {
            count: buyAbilityCurrent,
            percentage: buyAbilityStats.percentage,
            trend: buyAbilityStats.trend
          },
          propertyRequest: {
            count: propertyRequestCurrent,
            percentage: propertyRequestStats.percentage,
            trend: propertyRequestStats.trend
          },

        },
        rewardData: {
          totalEarning,
          withdrawableEarning,
          rewards
        },
        propertyLocations: {
          locations: propertyLocationData,
          totalProperty: totalPropertyLocationData

        }


      }
    })


    await redis.set(cacheKey, JSON.stringify(result), "EX", 3600);

    new CustomResponse(200, true, "Fetched successfully", res, result);
  } catch (error) {
    next(new InternalServerError("Internal server error", 500));
  }
};


// export const getPropertiesStatsByUser = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const userId = req.user?.id;
//     const { page = "1", limit = "10", filterTime = "this_year" } = req.query;

//     const { current, previous } = getDateRange(filterTime.toString());
//     const pageNumber = parseInt(page as string, 10);
//     const pageSize = parseInt(limit as string, 10);

//     const cacheKey = `getPropertiesStats:${userId}:${JSON.stringify(req.query)}`;

//     const result = await swrCache(cacheKey, async () => {
//       const baseWhere = { userId, archived: false };

//       const [properties, total] = await Promise.all([
//         Prisma.property.findMany({
//           where: baseWhere,
//           select: {
//             id: true,
//             title: true,
//             status: true,
//             createdAt: true,
//             sharesCount: true,
//             viewsCount: true,
//             media: {
//               select: {
//                 url: true,
//                 altText: true,
//                 type: true,
//                 photoType: true,
//                 sizeInKB: true
//               }
//             }
//           },
//           orderBy: { createdAt: "desc" },
//           skip: (pageNumber - 1) * pageSize,
//           take: pageSize
//         }),
//         Prisma.property.count({ where: baseWhere })
//       ]);

//       // For each property, calculate like-based performance
//       const enrichedProperties = await Promise.all(
//         properties.map(async (property) => {
//           const propertyId = property.id;

//           const [currentLikes, previousLikes] = await Promise.all([
//             Prisma.userPropertyLike.count({
//               where: {
//                 propertyId,
//                 createdAt: { gte: current.start, lte: current.end }
//               }
//             }),
//             Prisma.userPropertyLike.count({
//               where: {
//                 propertyId,
//                 createdAt: { gte: previous.start, lte: previous.end }
//               }
//             })
//           ]);

//           const { percentage, trend } = calculateTrend(currentLikes, previousLikes);

//           return {
//             slug: `#Arw-${propertyId.slice(-3)}`,
//             performance: {
//               likes: {
//                 current: currentLikes,
//                 previous: previousLikes,
//               },
//               percentage,
//               trend
//             },
//             ...property
//           };
//         })
//       );

//       const totalPages = Math.ceil(total / pageSize);

//       return {
//         data: enrichedProperties,
//         pagination: {
//           total,
//           page: pageNumber,
//           pageSize,
//           totalPages,
//           nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
//           prevPage: pageNumber > 1 ? pageNumber - 1 : null,
//           canGoNext: pageNumber < totalPages,
//           canGoPrev: pageNumber > 1
//         }
//       };
//     });

//     new CustomResponse(200, true, "success", res, result);
//   } catch (error) {
//     console.error(error);
//     next(new InternalServerError("Server Error", 500));
//   }
// };




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
      return next(new InternalServerError("Avatar uploa failed", 404));
    }





    const campaign = await Prisma.campaign.create({
      data: {
        campaignAddress: parsedCampaignAddress,
        campaignName,
        endDate,
        startDate,
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
