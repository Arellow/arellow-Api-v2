"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalytics = void 0;
const campaignDashboard_1 = require("../services/campaignDashboard");
const appError_1 = require("../../../lib/appError");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const campaignAnalyticsService = new campaignDashboard_1.CampaignAnalyticsService();
const getAnalytics = async (req, res, next) => {
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
        const analytics = await campaignAnalyticsService.getAnalytics();
        new response_util_1.default(200, true, "Analytics fetched successfully", res, analytics);
    }
    catch (error) {
        console.error("Analytics fetch error:", error);
        next(new appError_1.InternalServerError("Failed to fetch campaign analytics."));
    }
};
exports.getAnalytics = getAnalytics;
