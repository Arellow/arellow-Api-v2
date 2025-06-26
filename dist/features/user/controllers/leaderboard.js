"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRealtorsLeaderboard = void 0;
const appError_1 = require("../../../lib/appError");
const leaderboard_1 = require("../services/leaderboard");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const getRealtorsLeaderboard = async (req, res, next) => {
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
        const leaderboard = await (0, leaderboard_1.getTopRealtorsLeaderboard)();
        new response_util_1.default(200, true, "Top 5 earning realtors leaderboard", res, leaderboard);
    }
    catch (error) {
        console.error("Leaderboard fetch error:", error);
        next(new appError_1.InternalServerError("Failed to fetch leaderboard."));
    }
};
exports.getRealtorsLeaderboard = getRealtorsLeaderboard;
