"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.performQuickAction = exports.getRecentListings = exports.getRewardOverview = exports.getTopRealtors = exports.getDashboardSummary = void 0;
const superAdminDashboard_1 = require("../services/superAdminDashboard");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const dashboardService = new superAdminDashboard_1.DashboardService();
const getDashboardSummary = async (req, res, next) => {
    try {
        const data = await dashboardService.getDashboardSummary();
        new response_util_1.default(200, true, "successfully fetched", res, data);
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardSummary = getDashboardSummary;
const getTopRealtors = async (req, res, next) => {
    try {
        const data = await dashboardService.getTopRealtors();
        new response_util_1.default(200, true, "success", res, data);
    }
    catch (error) {
        next(error);
    }
};
exports.getTopRealtors = getTopRealtors;
const getRewardOverview = async (req, res, next) => {
    try {
        const data = await dashboardService.getRewardOverview();
        new response_util_1.default(200, true, "success", res, data);
    }
    catch (error) {
        console.error("Reward overview error:", error);
        res.status(500).json({
            status: "error",
            message: "Error getting reward overview",
            error: error.message,
        });
    }
};
exports.getRewardOverview = getRewardOverview;
const getRecentListings = async (req, res, next) => {
    try {
        const data = await dashboardService.getRecentListings();
        new response_util_1.default(200, true, "success", res, data);
    }
    catch (error) {
        next(error);
    }
};
exports.getRecentListings = getRecentListings;
const performQuickAction = async (req, res, next) => {
    try {
        const { action, projectId } = req.body;
        const data = await dashboardService.performQuickAction(action, projectId);
        new response_util_1.default(200, true, "success", res, data);
    }
    catch (error) {
        next(error);
    }
};
exports.performQuickAction = performQuickAction;
