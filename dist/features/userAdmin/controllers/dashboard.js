"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListedProperties = exports.getAdminDashboardEarningHistory = exports.getAdminDashboardProperties = exports.getAdminDashboardRewards = exports.getAdminDashboardSummary = void 0;
const dashboard_1 = require("../services/dashboard");
const appError_1 = require("../../../lib/appError");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const dashboardService = new dashboard_1.DashboardService();
const getAdminDashboardSummary = async (req, res, next) => {
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
        const summary = await dashboardService.getAdminDashboardSummary(userId);
        new response_util_1.default(200, true, "Dashboard summary fetched successfully", res, summary);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch dashboard summary."));
    }
};
exports.getAdminDashboardSummary = getAdminDashboardSummary;
const getAdminDashboardRewards = async (req, res, next) => {
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
        const rewards = await dashboardService.getAdminDashboardRewards(userId);
        new response_util_1.default(200, true, "Dashboard rewards fetched successfully", res, rewards);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch dashboard rewards."));
    }
};
exports.getAdminDashboardRewards = getAdminDashboardRewards;
const getAdminDashboardProperties = async (req, res, next) => {
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
        const properties = await dashboardService.getAdminDashboardProperties(userId);
        new response_util_1.default(200, true, "Dashboard properties fetched successfully", res, properties);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch dashboard properties."));
    }
};
exports.getAdminDashboardProperties = getAdminDashboardProperties;
const getAdminDashboardEarningHistory = async (req, res, next) => {
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
        const history = await dashboardService.getAdminDashboardEarningHistory(userId);
        new response_util_1.default(200, true, "Dashboard earning history fetched successfully", res, history);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch dashboard earning history."));
    }
};
exports.getAdminDashboardEarningHistory = getAdminDashboardEarningHistory;
const getListedProperties = async (req, res, next) => {
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
        const pagination = {
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
        };
        const properties = await dashboardService.getListedProperties(userId, pagination);
        res.status(200).json({ status: "success", data: properties });
        return;
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch listed properties."));
    }
};
exports.getListedProperties = getListedProperties;
