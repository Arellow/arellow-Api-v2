"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignService = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../../lib/appError");
const prisma = new client_1.PrismaClient();
class CampaignService {
    constructor() {
        this.prisma = prisma;
    }
    createCampaign(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const campaign = yield this.prisma.campaign.create({
                    data: {
                        userId,
                        campaignType: data.campaignType,
                        localMediaName: data.localMediaName,
                        promotionAd: data.promotionAd,
                        targetAudience: data.targetAudience,
                        features: data.features,
                        campaignDescription: data.campaignDescription,
                        imageUrl: data.imageUrl || null,
                        mediaPlatforms: data.mediaPlatforms,
                        startDate: data.startDate,
                        endDate: data.endDate,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                });
                return {
                    id: campaign.id,
                    campaignType: campaign.campaignType,
                    localMediaName: campaign.localMediaName,
                    promotionAd: campaign.promotionAd,
                    targetAudience: campaign.targetAudience,
                    features: campaign.features,
                    campaignDescription: campaign.campaignDescription,
                    imageUrl: campaign.imageUrl,
                    mediaPlatforms: campaign.mediaPlatforms,
                    startDate: campaign.startDate,
                    endDate: campaign.endDate,
                    createdAt: campaign.createdAt,
                    updatedAt: campaign.updatedAt,
                };
            }
            catch (error) {
                console.error("[createCampaign] Prisma error:", error);
                throw new appError_1.InternalServerError("Failed to create campaign.");
            }
        });
    }
    getCampaigns(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { campaignType, page = 1, limit = 10 } = filter;
                const skip = (page - 1) * limit;
                const whereClause = Object.assign({}, (campaignType && { campaignType: { equals: campaignType, mode: "insensitive" } }));
                const campaigns = yield this.prisma.campaign.findMany({
                    where: whereClause,
                    take: limit,
                    skip,
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        campaignType: true,
                        localMediaName: true,
                        promotionAd: true,
                        targetAudience: true,
                        features: true,
                        campaignDescription: true,
                        imageUrl: true,
                        mediaPlatforms: true,
                        startDate: true,
                        endDate: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                });
                const totalCount = yield this.prisma.campaign.count({ where: whereClause });
                const data = campaigns.map((c) => ({
                    id: c.id,
                    campaignType: c.campaignType,
                    localMediaName: c.localMediaName,
                    promotionAd: c.promotionAd,
                    targetAudience: c.targetAudience,
                    features: c.features,
                    campaignDescription: c.campaignDescription,
                    imageUrl: c.imageUrl,
                    mediaPlatforms: c.mediaPlatforms,
                    startDate: c.startDate,
                    endDate: c.endDate,
                    createdAt: c.createdAt,
                    updatedAt: c.updatedAt,
                }));
                return { data, totalCount };
            }
            catch (error) {
                console.error("[getCampaigns] Prisma error:", error);
                throw new appError_1.InternalServerError("Failed to fetch campaigns.");
            }
        });
    }
    getCampaign(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const campaign = yield this.prisma.campaign.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        campaignType: true,
                        localMediaName: true,
                        promotionAd: true,
                        targetAudience: true,
                        features: true,
                        campaignDescription: true,
                        imageUrl: true,
                        mediaPlatforms: true,
                        startDate: true,
                        endDate: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                });
                if (!campaign) {
                    throw new appError_1.InternalServerError("Campaign not found.");
                }
                return {
                    id: campaign.id,
                    campaignType: campaign.campaignType,
                    localMediaName: campaign.localMediaName,
                    promotionAd: campaign.promotionAd,
                    targetAudience: campaign.targetAudience,
                    features: campaign.features,
                    campaignDescription: campaign.campaignDescription,
                    imageUrl: campaign.imageUrl,
                    mediaPlatforms: campaign.mediaPlatforms,
                    startDate: campaign.startDate,
                    endDate: campaign.endDate,
                    createdAt: campaign.createdAt,
                    updatedAt: campaign.updatedAt,
                };
            }
            catch (error) {
                console.error("[getCampaign] Prisma error:", error);
                throw new appError_1.InternalServerError("Failed to fetch campaign.");
            }
        });
    }
    updateCampaign(userId, id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Entering updateCampaign service, userId:", userId, "id:", id, "data:", data);
            try {
                const campaign = yield this.prisma.campaign.update({
                    where: { id },
                    data: Object.assign(Object.assign({ userId }, data), { updatedAt: new Date() }),
                });
                return {
                    id: campaign.id,
                    campaignType: campaign.campaignType,
                    localMediaName: campaign.localMediaName,
                    promotionAd: campaign.promotionAd,
                    targetAudience: campaign.targetAudience,
                    features: campaign.features,
                    campaignDescription: campaign.campaignDescription,
                    imageUrl: campaign.imageUrl,
                    mediaPlatforms: campaign.mediaPlatforms,
                    startDate: campaign.startDate,
                    endDate: campaign.endDate,
                    createdAt: campaign.createdAt,
                    updatedAt: campaign.updatedAt,
                };
            }
            catch (error) {
                console.error("[updateCampaign] Prisma error:", error);
                throw new appError_1.InternalServerError("Failed to update campaign.");
            }
        });
    }
    deleteCampaign(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.campaign.delete({
                    where: { id },
                });
            }
            catch (error) {
                console.error("[deleteCampaign] Prisma error:", error);
                throw new appError_1.InternalServerError("Failed to delete campaign.");
            }
        });
    }
}
exports.CampaignService = CampaignService;
