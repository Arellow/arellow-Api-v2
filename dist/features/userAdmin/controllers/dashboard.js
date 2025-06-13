"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListedProperties = exports.getAdminDashboardEarningHistory = exports.getAdminDashboardProperties = exports.getAdminDashboardRewards = exports.getAdminDashboardSummary = void 0;
const dashboard_1 = require("../services/dashboard");
const appError_1 = require("../../../lib/appError");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const dashboardService = new dashboard_1.DashboardService();
const getAdminDashboardSummary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401).json({
            status: "failed",
            message: "Unauthorized access",
            succeeded: false,
        });
        return;
    }
    try {
        const summary = yield dashboardService.getAdminDashboardSummary(userId);
        new response_util_1.default(200, true, "Dashboard summary fetched successfully", res, summary);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch dashboard summary."));
    }
});
exports.getAdminDashboardSummary = getAdminDashboardSummary;
const getAdminDashboardRewards = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401).json({
            status: "failed",
            message: "Unauthorized access",
            succeeded: false,
        });
        return;
    }
    try {
        const rewards = yield dashboardService.getAdminDashboardRewards(userId);
        new response_util_1.default(200, true, "Dashboard rewards fetched successfully", res, rewards);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch dashboard rewards."));
    }
});
exports.getAdminDashboardRewards = getAdminDashboardRewards;
const getAdminDashboardProperties = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401).json({
            status: "failed",
            message: "Unauthorized access",
            succeeded: false,
        });
        return;
    }
    try {
        const properties = yield dashboardService.getAdminDashboardProperties(userId);
        new response_util_1.default(200, true, "Dashboard properties fetched successfully", res, properties);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch dashboard properties."));
    }
});
exports.getAdminDashboardProperties = getAdminDashboardProperties;
const getAdminDashboardEarningHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401).json({
            status: "failed",
            message: "Unauthorized access",
            succeeded: false,
        });
        return;
    }
    try {
        const history = yield dashboardService.getAdminDashboardEarningHistory(userId);
        new response_util_1.default(200, true, "Dashboard earning history fetched successfully", res, history);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch dashboard earning history."));
    }
});
exports.getAdminDashboardEarningHistory = getAdminDashboardEarningHistory;
const getListedProperties = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        const properties = yield dashboardService.getListedProperties(userId, pagination);
        res.status(200).json({ status: "success", data: properties });
        return;
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch listed properties."));
    }
});
exports.getListedProperties = getListedProperties;
