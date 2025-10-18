import { Router } from "express";

import { singleupload } from "../../../middlewares/multer";
import { AllActiveCampaigns, AllCampaigns, clickCampaign, createCampaign, deleteCampaign, updateCampaign } from "../contollers/controller";
import authenticate, { adminRequireRole, isSuspended, requireRole } from "../../../middlewares/auth.middleware";
import { UserRole } from "@prisma/client";
import { createCampaignSchema } from "./campaign.validate";
import { validateSchema } from "../../../middlewares/propertyParsingAndValidation";

const campaignRoutes = Router();

campaignRoutes.get("/active", AllActiveCampaigns);
campaignRoutes.get("/", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("CAMPAIGN"), AllCampaigns);
campaignRoutes.post("/", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("CAMPAIGN"),  singleupload, validateSchema(createCampaignSchema), createCampaign);
campaignRoutes.patch("/update/:id", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("CAMPAIGN"),  singleupload,  validateSchema(createCampaignSchema), updateCampaign);
campaignRoutes.patch("/:id", clickCampaign);
campaignRoutes.delete("/:id", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("CAMPAIGN"),  deleteCampaign);


export default campaignRoutes;