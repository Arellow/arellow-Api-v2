"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEarningHistory = exports.getEarningSummary = void 0;
const history_1 = require("../services/history");
const appError_1 = require("../../../lib/appError");
const earningHistoryService = new history_1.EarningHistoryService();
const getEarningSummary = async (req, res, next) => {
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
        const summary = await earningHistoryService.getEarningSummary(userId);
        res.status(200).json({ status: "success", data: summary });
        return;
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch earning summary."));
    }
};
exports.getEarningSummary = getEarningSummary;
const getEarningHistory = async (req, res, next) => {
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
        const filter = {
            date: req.query.date ? new Date(req.query.date) : undefined,
            country: req.query.country,
            state: req.query.propertyState,
            search: req.query.search,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
        };
        const history = await earningHistoryService.getEarningHistory(userId, filter);
        res.status(200).json({ status: "success", data: history });
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch earning history."));
    }
};
exports.getEarningHistory = getEarningHistory;
