import { Router } from "express";

import { singleupload } from "../../../middlewares/multer";
import { AllActiveCampaigns, AllCampaigns, AllCampaignsRequest, campaignDashbroad, clickCampaign, createCampaign, deleteCampaign, getCampaignStats, requestCampaign, updateCampaign } from "../contollers/controller";
import authenticate, { adminRequireRole, isSuspended, requireRole } from "../../../middlewares/auth.middleware";
import { createCampaignRequestSchema, createCampaignSchema } from "./campaign.validate";
import { validateSchema } from "../../../middlewares/propertyParsingAndValidation";
import { CampaignPlaceMent, UserRole } from "../../../../generated/prisma/enums";
import { CampaignAddress } from "../../../../generated/prisma/client";

const campaignRoutes = Router();

campaignRoutes.get("/dashboard", campaignDashbroad);
campaignRoutes.get("/dashboardcharts", getCampaignStats);
campaignRoutes.post("/requestcampaign", validateSchema(createCampaignRequestSchema), requestCampaign);
campaignRoutes.get("/requestcampaign", AllCampaignsRequest);
campaignRoutes.get("/active", AllActiveCampaigns);
campaignRoutes.get("/", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("CAMPAIGN"), AllCampaigns);
campaignRoutes.post("/", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("CAMPAIGN"),  singleupload, (req, res, next) => {

      const parsedCampaignPlaceMent: CampaignPlaceMent[] = typeof req.body.campaignPlaceMent === 'string' ? JSON.parse(req.body.campaignPlaceMent) : req.body.campaignPlaceMent;
    
      const parsedCampaignAddress: CampaignAddress = typeof req.body.campaignAddress === 'string' ? JSON.parse(req.body.campaignAddress) : req.body.campaignAddress;


      const {campaignAddress, campaignPlaceMent ,...rest} = req.body;

        const body = {
        ...rest,
       campaignAddress: parsedCampaignAddress,
        campaignPlaceMent: parsedCampaignPlaceMent,
    };

    req.body = body;
    
    next()
},

validateSchema(createCampaignSchema), createCampaign);

campaignRoutes.patch("/update/:id", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("CAMPAIGN"),  singleupload,(req, res, next) => {

      const parsedCampaignPlaceMent: CampaignPlaceMent[] = typeof req.body.campaignPlaceMent === 'string' ? JSON.parse(req.body.campaignPlaceMent) : req.body.campaignPlaceMent;
    
      const parsedCampaignAddress: CampaignAddress = typeof req.body.campaignAddress === 'string' ? JSON.parse(req.body.campaignAddress) : req.body.campaignAddress;

        const body = {
        ...req.body,
       campaignAddress: parsedCampaignAddress,
        campaignPlaceMent: parsedCampaignPlaceMent,
    };
    req.body = body;
    next()
},

validateSchema(createCampaignSchema), updateCampaign);
campaignRoutes.patch("/:id", clickCampaign);
campaignRoutes.delete("/:id", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("CAMPAIGN"),  deleteCampaign);


export default campaignRoutes;