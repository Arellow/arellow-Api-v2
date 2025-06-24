"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userManagement_1 = require("../controllers/userManagement");
const auth_middleware_1 = __importDefault(require("../../../middlewares/auth.middleware"));
const dashboard_1 = require("../controllers/dashboard");
const history_1 = require("../controllers/history");
const router = (0, express_1.Router)();
router.get("/myListings", auth_middleware_1.default, userManagement_1.getUserListings);
router.get("/myListing/:id", auth_middleware_1.default, userManagement_1.getPropertyDetails);
router.get("/myListing/:id", auth_middleware_1.default, userManagement_1.deleteProperty);
//dashboard routes
router.get("/dashboard/summary", auth_middleware_1.default, dashboard_1.getAdminDashboardSummary);
router.get("/dashboard/rewards", auth_middleware_1.default, dashboard_1.getAdminDashboardRewards);
router.get("/dashboard/properties", auth_middleware_1.default, dashboard_1.getAdminDashboardProperties);
router.get("/dashboard/earnings", auth_middleware_1.default, dashboard_1.getAdminDashboardEarningHistory);
router.get("/dashboard/userListing", auth_middleware_1.default, dashboard_1.getListedProperties);
router.get("/dashboard/historySummary", auth_middleware_1.default, history_1.getEarningSummary);
router.get("/dashboard/history", auth_middleware_1.default, history_1.getEarningHistory);
exports.default = router;
