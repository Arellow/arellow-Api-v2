import { Router } from "express";
import { getPropertyDetails, getUserListings } from "../controllers/userManagement";
import authenticate from "../../../middlewares/auth.middleware";
import { getAdminDashboardEarningHistory, getAdminDashboardProperties, getAdminDashboardRewards, getAdminDashboardSummary, getListedProperties } from "../controllers/dashboard";
import { getEarningHistory, getEarningSummary } from "../controllers/history";

const router = Router();

router.get("/myListings",authenticate, getUserListings);
router.get("/myListing/:id",authenticate,getPropertyDetails);
//dashboard routes
router.get("/dashboard/summary",authenticate, getAdminDashboardSummary);
router.get("/dashboard/rewards",authenticate, getAdminDashboardRewards);
router.get("/dashboard/properties",authenticate, getAdminDashboardProperties);
router.get("/dashboard/earnings",authenticate, getAdminDashboardEarningHistory);
router.get("/dashboard/userListing",authenticate, getListedProperties);
router.get("/dashboard/historySummary",authenticate, getEarningSummary);
router.get("/dashboard/history",authenticate, getEarningHistory);

export default router;