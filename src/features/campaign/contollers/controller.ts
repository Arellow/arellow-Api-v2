import { Request, Response, NextFunction } from "express";
// import { CampaignService } from "../services/service";
import { BadRequestError, InternalServerError } from "../../../lib/appError";
import { CreateCampaignDto, UpdateCampaignDto, CampaignFilterDto } from "../dtos/campaign.dto";
import CustomResponse from "../../../utils/helpers/response.util";
import { singleupload, getDataUri } from "../../../middlewares/multer";
import { cloudinary } from "../../../configs/cloudinary";

// const campaignService = new CampaignService();

// export const createCampaign = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const userId = req.user?.id as string;
//   if (!userId) {
//     res.status(401).json({
//       status: "failed",
//       message: "Unauthorized access",
//       succeeded: false,
//     });
//     return;
//   }

//   try {
//     let imageUrl: string | null = null;
//     if (req.file) {
//       try {
//         const fileUri = getDataUri(req.file as any);
//         const uploadResult = await cloudinary.uploader.upload(fileUri.content, {
//           folder: "campaign_images",
//           resource_type: "image",
//           allowedFormats: ["jpg", "png", "jpeg"],
//           transformation: [{ width: 500, height: 500, crop: "limit" }],
//         });
//         imageUrl = uploadResult.secure_url;
//       } catch (uploadError) {
//         console.error("Cloudinary upload error:", uploadError);
//         throw new BadRequestError("Failed to upload image to Cloudinary");
//       }
//     }

//     const rawData = req.body;
//     if (!rawData.campaignType || !rawData.localMediaName || !rawData.promotionAd || !rawData.targetAudience || !rawData.features || !rawData.campaignDescription || !rawData.mediaPlatforms || !rawData.startDate || !rawData.endDate) {
//       throw new BadRequestError("All campaign fields are required");
//     }

//     const data: CreateCampaignDto = {
//       campaignType: rawData.campaignType as string,
//       localMediaName: rawData.localMediaName as string,
//       promotionAd: rawData.promotionAd as string,
//       targetAudience: rawData.targetAudience as string,
//       features: rawData.features as string,
//       campaignDescription: rawData.campaignDescription as string,
//       imageUrl,
//       mediaPlatforms: JSON.parse(rawData.mediaPlatforms as string) as string[],
//       startDate: new Date(rawData.startDate as string),
//       endDate: new Date(rawData.endDate as string),
//     };
//     const campaign = await campaignService.createCampaign(userId, data);
//     new CustomResponse(200, true, "Campaign created successfully", res, campaign);
//   } catch (error) {
//     console.error("Campaign creation error:", error);
//     if (error instanceof Error) {
//       next(new InternalServerError(error.message));
//     } else {
//       next(new InternalServerError("Failed to create campaign."));
//     }
//   }
// };

// export const getCampaigns = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {

//   try {
//     const filter: CampaignFilterDto = {
//       campaignType: req.query.campaignType as string,
//       page: req.query.page ? parseInt(req.query.page as string) : 1,
//       limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
//     };
//     const campaigns = await campaignService.getCampaigns(filter);
//     new CustomResponse(200, true, "Campaigns fetched successfully", res, campaigns);
//   } catch (error) {
//     next(new InternalServerError("Failed to fetch campaigns."));
//   }
// };

// export const getCampaign = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {

//   const id = req.params.id as string;
//   try {
//     const campaign = await campaignService.getCampaign(id);
//     new CustomResponse(200, true, "Campaign fetched successfully", res, campaign);
//   } catch (error) {
//     console.error("Campaign fetch error:", error);
//     next(new InternalServerError("Failed to fetch campaign."));
//   }
// };

// export const updateCampaign = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const userId = req.user?.id as string;
//   const id = req.params.id as string;

//   console.log("Entering updateCampaign, req.user:", req.user, "req.body:", req.body, "req.file:", req.file, "req.params.id:", id);

//   if (!userId || !id) {
//     res.status(400).json({
//       status: "failed",
//       message: "User ID and campaign ID are required",
//       succeeded: false,
//     });
//     return;
//   }

//   try {
//     let imageUrl: string | null = null;
//     if (req.file) {
//       try {
//         console.log("Processing file upload, req.file:", req.file);
//         const fileUri = getDataUri(req.file as any);
//         console.log("Generated Data URI (first 50 chars):", fileUri.content.substring(0, 50) + "...");
//         const uploadResult = await cloudinary.uploader.upload(fileUri.content, {
//           folder: "campaign_images",
//           resource_type: "image",
//           allowedFormats: ["jpg", "png", "jpeg"],
//           transformation: [{ width: 500, height: 500, crop: "limit" }],
//         });
//         imageUrl = uploadResult.secure_url;
//         console.log("Cloudinary upload successful, imageUrl:", imageUrl);
//       } catch (uploadError) {
//         console.error("Cloudinary upload error:", uploadError);
//         throw new Error("Failed to upload image to Cloudinary");
//       }
//     }

//     const data: Partial<UpdateCampaignDto> = {};
//     if (req.body.campaignType !== undefined) data.campaignType = req.body.campaignType;
//     if (req.body.localMediaName !== undefined) data.localMediaName = req.body.localMediaName;
//     if (req.body.promotionAd !== undefined) data.promotionAd = req.body.promotionAd;
//     if (req.body.targetAudience !== undefined) data.targetAudience = req.body.targetAudience;
//     if (req.body.features !== undefined) data.features = req.body.features;
//     if (req.body.campaignDescription !== undefined) data.campaignDescription = req.body.campaignDescription;
//     if (req.body.mediaPlatforms !== undefined) data.mediaPlatforms = JSON.parse(req.body.mediaPlatforms) as string[];
//     if (req.body.startDate !== undefined) data.startDate = new Date(req.body.startDate);
//     if (req.body.endDate !== undefined) data.endDate = new Date(req.body.endDate);
//     if (imageUrl !== undefined) data.imageUrl = imageUrl;

//     console.log("Constructed data for service:", data);

//     if (Object.keys(data).length === 0) {
//       res.status(400).json({
//         status: "failed",
//         message: "No fields provided for update",
//         succeeded: false,
//       });
//       return;
//     }

//     const campaign = await campaignService.updateCampaign(userId, id, data);
//     console.log("Service returned campaign:", campaign);
//     new CustomResponse(200, true, "Updated successfully", res, campaign);
//   } catch (error) {
//     console.error("Campaign update error:", error);
//     next(new InternalServerError("Failed to update campaign."));
//   }
// };

// export const deleteCampaign = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const userId = req.user?.id as string;
//   const id = req.params.id as string;

//   if (!userId || !id) {
//     res.status(400).json({
//       status: "failed",
//       message: "User ID and campaign ID are required",
//       succeeded: false,
//     });
//     return;
//   }

//   try {
//     await campaignService.deleteCampaign(id);
//     new CustomResponse(200, true, "Campaign deleted", res);
//   } catch (error) {
//     next(new InternalServerError("Failed to delete campaign."));
//   }
// };