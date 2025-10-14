import { Router } from "express";

import { singleupload } from "../../../middlewares/multer";
import { AllActiveCampaigns, AllCampaigns, clickCampaign, createCampaign, deleteCampaign } from "../contollers/controller";
import authenticate, { adminRequireRole, isSuspended, requireRole } from "../../../middlewares/auth.middleware";
import { UserRole } from "@prisma/client";

const campaignRoutes = Router();

campaignRoutes.get("/active", AllActiveCampaigns);
campaignRoutes.get("/", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("CAMPAIGN"), AllCampaigns);
campaignRoutes.post("/", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("CAMPAIGN"),  singleupload, createCampaign);
campaignRoutes.patch("/:id", clickCampaign);
campaignRoutes.delete("/:id", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("CAMPAIGN"),  deleteCampaign);


export default campaignRoutes;