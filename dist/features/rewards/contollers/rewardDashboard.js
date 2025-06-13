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
exports.getRewardDetails = exports.getRewardsOverview = void 0;
const rewardDashboard_1 = require("../services/rewardDashboard");
const rewardsService = new rewardDashboard_1.RewardsService();
const getRewardsOverview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield rewardsService.getRewardsOverview();
        res.status(200).json({
            status: "success",
            data,
        });
    }
    catch (error) {
        console.error("[getRewardsOverview] error:", error);
        next(error);
    }
});
exports.getRewardsOverview = getRewardsOverview;
const getRewardDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    try {
        const data = yield rewardsService.getRewardDetails(userId);
        res.status(200).json({
            status: "success",
            data,
        });
    }
    catch (error) {
        console.error("[getRewardDetails] error:", error);
        next(error);
    }
});
exports.getRewardDetails = getRewardDetails;
