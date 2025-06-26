"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRewardDetails = exports.getRewardsOverview = void 0;
const rewardDashboard_1 = require("../services/rewardDashboard");
const rewardsService = new rewardDashboard_1.RewardsService();
const getRewardsOverview = async (req, res, next) => {
    try {
        const data = await rewardsService.getRewardsOverview();
        res.status(200).json({
            status: "success",
            data,
        });
    }
    catch (error) {
        console.error("[getRewardsOverview] error:", error);
        next(error);
    }
};
exports.getRewardsOverview = getRewardsOverview;
const getRewardDetails = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const data = await rewardsService.getRewardDetails(userId);
        res.status(200).json({
            status: "success",
            data,
        });
    }
    catch (error) {
        console.error("[getRewardDetails] error:", error);
        next(error);
    }
};
exports.getRewardDetails = getRewardDetails;
