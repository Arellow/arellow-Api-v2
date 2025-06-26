"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserEarnings = exports.withdrawReward = void 0;
const reward_1 = require("../services/reward");
const rewardService = new reward_1.RewardService();
const withdrawReward = async (req, res, next) => {
    const { pointToWithdraw, bankAccountName, bankAccountNumber, bankName } = req.body;
    const userId = req.user?.id;
    try {
        const data = await rewardService.withdrawReward(userId, Number(pointToWithdraw), bankAccountName, bankAccountNumber, bankName);
        res.status(200).json({
            status: "success",
            data,
        });
    }
    catch (error) {
        console.error("[withdrawReward] Unexpected error:", error);
        next(error);
    }
};
exports.withdrawReward = withdrawReward;
const getUserEarnings = async (req, res, next) => {
    const userId = req.user?.id;
    try {
        const data = await rewardService.getUserEarnings(userId);
        res.status(200).json({
            status: "success",
            data,
        });
    }
    catch (error) {
        console.error("[getUserEarnings] error:", error);
        next(error);
    }
};
exports.getUserEarnings = getUserEarnings;
