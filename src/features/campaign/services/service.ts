import { Prisma, PrismaClient } from "@prisma/client";
import { InternalServerError } from "../../../lib/appError";
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignFilterDto,
  CampaignPost,
  CampaignResponse,
} from "../dtos/campaign.dto";

const prisma = new PrismaClient();

// export class CampaignService {
//   private prisma: PrismaClient = prisma;

//   async createCampaign(userId: string, data: CreateCampaignDto): Promise<CampaignPost> {
//     try {
//       const campaign = await this.prisma.campaign.create({
//         data: {
//           userId,
//           campaignType: data.campaignType,
//           localMediaName: data.localMediaName,
//           promotionAd: data.promotionAd,
//           targetAudience: data.targetAudience,
//           features: data.features,
//           campaignDescription: data.campaignDescription,
//           imageUrl: data.imageUrl || null,
//           mediaPlatforms: data.mediaPlatforms,
//           startDate: data.startDate,
//           endDate: data.endDate,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         },
//       });
//       return {
//         id: campaign.id,
//         campaignType: campaign.campaignType,
//         localMediaName: campaign.localMediaName,
//         promotionAd: campaign.promotionAd,
//         targetAudience: campaign.targetAudience,
//         features: campaign.features,
//         campaignDescription: campaign.campaignDescription,
//         imageUrl: campaign.imageUrl,
//         mediaPlatforms: campaign.mediaPlatforms,
//         startDate: campaign.startDate,
//         endDate: campaign.endDate,
//         createdAt: campaign.createdAt,
//         updatedAt: campaign.updatedAt,
//       };
//     } catch (error) {
//       console.error("[createCampaign] Prisma error:", error);
//       throw new InternalServerError("Failed to create campaign.");
//     }
//   }

//   async getCampaigns(filter: CampaignFilterDto): Promise<CampaignResponse> {
//     try {
//       const { campaignType, page = 1, limit = 10 } = filter;
//       const skip = (page - 1) * limit;

//       const whereClause: Prisma.CampaignWhereInput = {
//         ...(campaignType && { campaignType: { equals: campaignType, mode: "insensitive" } }),
//       };

//       const campaigns = await this.prisma.campaign.findMany({
//         where: whereClause,
//         take: limit,
//         skip,
//         orderBy: { createdAt: "desc" },
//         select: {
//           id: true,
//           campaignType: true,
//           localMediaName: true,
//           promotionAd: true,
//           targetAudience: true,
//           features: true,
//           campaignDescription: true,
//           imageUrl: true,
//           mediaPlatforms: true,
//           startDate: true,
//           endDate: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       });

//       const totalCount = await this.prisma.campaign.count({ where: whereClause });

//       const data: CampaignPost[] = campaigns.map((c) => ({
//         id: c.id,
//         campaignType: c.campaignType,
//         localMediaName: c.localMediaName,
//         promotionAd: c.promotionAd,
//         targetAudience: c.targetAudience,
//         features: c.features,
//         campaignDescription: c.campaignDescription,
//         imageUrl: c.imageUrl,
//         mediaPlatforms: c.mediaPlatforms,
//         startDate: c.startDate,
//         endDate: c.endDate,
//         createdAt: c.createdAt,
//         updatedAt: c.updatedAt,
//       }));

//       return { data, totalCount };
//     } catch (error) {
//       console.error("[getCampaigns] Prisma error:", error);
//       throw new InternalServerError("Failed to fetch campaigns.");
//     }
//   }

//   async getCampaign(id: string): Promise<CampaignPost> {
//     try {
//       const campaign = await this.prisma.campaign.findUnique({
//         where: { id },
//         select: {
//           id: true,
//           campaignType: true,
//           localMediaName: true,
//           promotionAd: true,
//           targetAudience: true,
//           features: true,
//           campaignDescription: true,
//           imageUrl: true,
//           mediaPlatforms: true,
//           startDate: true,
//           endDate: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       });

//       if (!campaign) {
//         throw new InternalServerError("Campaign not found.");
//       }

//       return {
//         id: campaign.id,
//         campaignType: campaign.campaignType,
//         localMediaName: campaign.localMediaName,
//         promotionAd: campaign.promotionAd,
//         targetAudience: campaign.targetAudience,
//         features: campaign.features,
//         campaignDescription: campaign.campaignDescription,
//         imageUrl: campaign.imageUrl,
//         mediaPlatforms: campaign.mediaPlatforms,
//         startDate: campaign.startDate,
//         endDate: campaign.endDate,
//         createdAt: campaign.createdAt,
//         updatedAt: campaign.updatedAt,
//       };
//     } catch (error) {
//       console.error("[getCampaign] Prisma error:", error);
//       throw new InternalServerError("Failed to fetch campaign.");
//     }
//   }

//   async updateCampaign(userId: string, id: string, data: Partial<UpdateCampaignDto>): Promise<CampaignPost> {
//     console.log("Entering updateCampaign service, userId:", userId, "id:", id, "data:", data);
//     try {
//       const campaign = await this.prisma.campaign.update({
//         where: { id },
//         data: {
//           userId,
//           ...data,
//           updatedAt: new Date(),
//         },
//       });
//       return {
//         id: campaign.id,
//         campaignType: campaign.campaignType,
//         localMediaName: campaign.localMediaName,
//         promotionAd: campaign.promotionAd,
//         targetAudience: campaign.targetAudience,
//         features: campaign.features,
//         campaignDescription: campaign.campaignDescription,
//         imageUrl: campaign.imageUrl,
//         mediaPlatforms: campaign.mediaPlatforms,
//         startDate: campaign.startDate,
//         endDate: campaign.endDate,
//         createdAt: campaign.createdAt,
//         updatedAt: campaign.updatedAt,
//       };
//     } catch (error) {
//       console.error("[updateCampaign] Prisma error:", error);
//       throw new InternalServerError("Failed to update campaign.");
//     }
//   }

//   async deleteCampaign(id: string): Promise<void> {
//     try {
//       await this.prisma.campaign.delete({
//         where: { id },
//       });
//     } catch (error) {
//       console.error("[deleteCampaign] Prisma error:", error);
//       throw new InternalServerError("Failed to delete campaign.");
//     }
//   }
// }