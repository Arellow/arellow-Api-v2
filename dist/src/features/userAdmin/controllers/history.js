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
exports.getEarningHistory = exports.getEarningSummary = void 0;
const history_1 = require("../services/history");
const appError_1 = require("../../../lib/appError");
const earningHistoryService = new history_1.EarningHistoryService();
const getEarningSummary = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const summary = yield earningHistoryService.getEarningSummary(userId);
        res.status(200).json({ status: "success", data: summary });
        return;
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch earning summary."));
    }
});
exports.getEarningSummary = getEarningSummary;
const getEarningHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        const filter = {
            date: req.query.date ? new Date(req.query.date) : undefined,
            propertyCategory: req.query.propertyCategory,
            country: req.query.country,
            propertyState: req.query.propertyState,
            search: req.query.search,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
        };
        const history = yield earningHistoryService.getEarningHistory(userId, filter);
        res.status(200).json({ status: "success", data: history });
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch earning history."));
    }
});
exports.getEarningHistory = getEarningHistory;
