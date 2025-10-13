import { Router } from "express";

import { singleupload } from "../../../middlewares/multer";
import { AllCampaigns, clickCampaign, createCampaign } from "../contollers/controller";
import authenticate, { adminRequireRole, isSuspended, requireRole } from "../../../middlewares/auth.middleware";
import { UserRole } from "@prisma/client";

const campaignRoutes = Router();

campaignRoutes.get("/", AllCampaigns);
campaignRoutes.post("/", singleupload, authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("CAMPAIGN"), createCampaign);
campaignRoutes.patch("/:id", clickCampaign);


export default campaignRoutes;