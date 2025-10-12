import { Router } from "express";

import { singleupload } from "../../../middlewares/multer";
import authenticate, { isAdmin } from "../../../middlewares/auth.middleware";
import { AllCampaigns } from "../contollers/controller";

const campaignRoutes = Router();

campaignRoutes.get("/", AllCampaigns)


export default campaignRoutes;