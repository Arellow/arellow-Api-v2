import { Router } from "express";
// import {
//   createCampaign,
//   getCampaigns,
//   getCampaign,
//   updateCampaign,
//   deleteCampaign,
// } from "../contollers/controller";

import { singleupload } from "../../../middlewares/multer";
import authenticate, { isAdmin } from "../../../middlewares/auth.middleware";
import { getAnalytics } from "../contollers/campaign.dashboard";

const campaignRoutes = Router();

// campaignRoutes.post("/create", authenticate, isAdmin,singleupload, createCampaign);
// campaignRoutes.get("/dashboard", authenticate, isAdmin, getAnalytics);
// campaignRoutes.get("/all", getCampaigns);
// campaignRoutes.get("/:id", getCampaign);
// campaignRoutes.patch("/:id", authenticate, isAdmin, singleupload, updateCampaign);
// campaignRoutes.delete("/:id", authenticate, isAdmin, deleteCampaign);

export default campaignRoutes;