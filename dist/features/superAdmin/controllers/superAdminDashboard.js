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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRewardOverview = exports.getTopRealtors = exports.getDashboardSummary = void 0;
const superAdminDashboard_1 = require("../services/superAdminDashboard");
const dashboardService = new superAdminDashboard_1.DashboardService();
const getDashboardSummary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield dashboardService.getDashboardSummary();
        res.status(200).json({
            status: "success",
            data,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getDashboardSummary = getDashboardSummary;
const getTopRealtors = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield dashboardService.getTopRealtors();
        res.status(200).json({
            status: "success",
            data,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getTopRealtors = getTopRealtors;
const getRewardOverview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield dashboardService.getRewardOverview();
        res.status(200).json({
            status: "success",
            data,
        });
    }
    catch (error) {
        console.error("Reward overview error:", error);
        res.status(500).json({
            status: "error",
            message: "Error getting reward overview",
            error: error.message,
        });
    }
});
exports.getRewardOverview = getRewardOverview;
