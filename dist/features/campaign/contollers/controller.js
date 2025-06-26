"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCampaign = exports.updateCampaign = exports.getCampaign = exports.getCampaigns = exports.createCampaign = void 0;
const service_1 = require("../services/service");
const appError_1 = require("../../../lib/appError");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const multer_1 = require("../../../middlewares/multer");
const cloudinary_1 = require("../../../configs/cloudinary");
const campaignService = new service_1.CampaignService();
const createCampaign = async (req, res, next) => {
    const userId = req.user?.id;
    if (!userId) {
        res.status(401).json({
            status: "failed",
            message: "Unauthorized access",
            succeeded: false,
        });
        return;
    }
    try {
        let imageUrl = null;
        if (req.file) {
            try {
                const fileUri = (0, multer_1.getDataUri)(req.file);
                const uploadResult = await cloudinary_1.cloudinary.uploader.upload(fileUri.content, {
                    folder: "campaign_images",
                    resource_type: "image",
                    allowedFormats: ["jpg", "png", "jpeg"],
                    transformation: [{ width: 500, height: 500, crop: "limit" }],
                });
                imageUrl = uploadResult.secure_url;
            }
            catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                throw new appError_1.BadRequestError("Failed to upload image to Cloudinary");
            }
        }
        const rawData = req.body;
        if (!rawData.campaignType || !rawData.localMediaName || !rawData.promotionAd || !rawData.targetAudience || !rawData.features || !rawData.campaignDescription || !rawData.mediaPlatforms || !rawData.startDate || !rawData.endDate) {
            throw new appError_1.BadRequestError("All campaign fields are required");
        }
        const data = {
            campaignType: rawData.campaignType,
            localMediaName: rawData.localMediaName,
            promotionAd: rawData.promotionAd,
            targetAudience: rawData.targetAudience,
            features: rawData.features,
            campaignDescription: rawData.campaignDescription,
            imageUrl,
            mediaPlatforms: JSON.parse(rawData.mediaPlatforms),
            startDate: new Date(rawData.startDate),
            endDate: new Date(rawData.endDate),
        };
        const campaign = await campaignService.createCampaign(userId, data);
        new response_util_1.default(200, true, "Campaign created successfully", res, campaign);
    }
    catch (error) {
        console.error("Campaign creation error:", error);
        if (error instanceof Error) {
            next(new appError_1.InternalServerError(error.message));
        }
        else {
            next(new appError_1.InternalServerError("Failed to create campaign."));
        }
    }
};
exports.createCampaign = createCampaign;
const getCampaigns = async (req, res, next) => {
    try {
        const filter = {
            campaignType: req.query.campaignType,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
        };
        const campaigns = await campaignService.getCampaigns(filter);
        new response_util_1.default(200, true, "Campaigns fetched successfully", res, campaigns);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch campaigns."));
    }
};
exports.getCampaigns = getCampaigns;
const getCampaign = async (req, res, next) => {
    const id = req.params.id;
    try {
        const campaign = await campaignService.getCampaign(id);
        new response_util_1.default(200, true, "Campaign fetched successfully", res, campaign);
    }
    catch (error) {
        console.error("Campaign fetch error:", error);
        next(new appError_1.InternalServerError("Failed to fetch campaign."));
    }
};
exports.getCampaign = getCampaign;
const updateCampaign = async (req, res, next) => {
    const userId = req.user?.id;
    const id = req.params.id;
    console.log("Entering updateCampaign, req.user:", req.user, "req.body:", req.body, "req.file:", req.file, "req.params.id:", id);
    if (!userId || !id) {
        res.status(400).json({
            status: "failed",
            message: "User ID and campaign ID are required",
            succeeded: false,
        });
        return;
    }
    try {
        let imageUrl = null;
        if (req.file) {
            try {
                console.log("Processing file upload, req.file:", req.file);
                const fileUri = (0, multer_1.getDataUri)(req.file);
                console.log("Generated Data URI (first 50 chars):", fileUri.content.substring(0, 50) + "...");
                const uploadResult = await cloudinary_1.cloudinary.uploader.upload(fileUri.content, {
                    folder: "campaign_images",
                    resource_type: "image",
                    allowedFormats: ["jpg", "png", "jpeg"],
                    transformation: [{ width: 500, height: 500, crop: "limit" }],
                });
                imageUrl = uploadResult.secure_url;
                console.log("Cloudinary upload successful, imageUrl:", imageUrl);
            }
            catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                throw new Error("Failed to upload image to Cloudinary");
            }
        }
        const data = {};
        if (req.body.campaignType !== undefined)
            data.campaignType = req.body.campaignType;
        if (req.body.localMediaName !== undefined)
            data.localMediaName = req.body.localMediaName;
        if (req.body.promotionAd !== undefined)
            data.promotionAd = req.body.promotionAd;
        if (req.body.targetAudience !== undefined)
            data.targetAudience = req.body.targetAudience;
        if (req.body.features !== undefined)
            data.features = req.body.features;
        if (req.body.campaignDescription !== undefined)
            data.campaignDescription = req.body.campaignDescription;
        if (req.body.mediaPlatforms !== undefined)
            data.mediaPlatforms = JSON.parse(req.body.mediaPlatforms);
        if (req.body.startDate !== undefined)
            data.startDate = new Date(req.body.startDate);
        if (req.body.endDate !== undefined)
            data.endDate = new Date(req.body.endDate);
        if (imageUrl !== undefined)
            data.imageUrl = imageUrl;
        console.log("Constructed data for service:", data);
        if (Object.keys(data).length === 0) {
            res.status(400).json({
                status: "failed",
                message: "No fields provided for update",
                succeeded: false,
            });
            return;
        }
        const campaign = await campaignService.updateCampaign(userId, id, data);
        console.log("Service returned campaign:", campaign);
        new response_util_1.default(200, true, "Updated successfully", res, campaign);
    }
    catch (error) {
        console.error("Campaign update error:", error);
        next(new appError_1.InternalServerError("Failed to update campaign."));
    }
};
exports.updateCampaign = updateCampaign;
const deleteCampaign = async (req, res, next) => {
    const userId = req.user?.id;
    const id = req.params.id;
    if (!userId || !id) {
        res.status(400).json({
            status: "failed",
            message: "User ID and campaign ID are required",
            succeeded: false,
        });
        return;
    }
    try {
        await campaignService.deleteCampaign(id);
        new response_util_1.default(200, true, "Campaign deleted", res);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to delete campaign."));
    }
};
exports.deleteCampaign = deleteCampaign;
