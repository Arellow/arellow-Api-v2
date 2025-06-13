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
exports.RewardsService = void 0;
const date_fns_1 = require("date-fns");
const prisma_1 = require("../../../lib/prisma");
const appError_1 = require("../../../lib/appError");
class RewardsService {
    getRewardsOverview() {
        return __awaiter(this, void 0, void 0, function* () {
            const totalRewards = yield prisma_1.Prisma.rewardHistory.aggregate({
                _sum: { points: true },
                where: { points: { gt: 0 } },
            }).then((sum) => sum._sum.points || 0);
            // Fetch count of withdrawal requests
            const withdrawalRequests = yield prisma_1.Prisma.rewardWithdrawal.count({
                where: { status: "pending" },
            });
            // Fetch earnings (sum of points by reason)
            const earnings = yield prisma_1.Prisma.rewardHistory.groupBy({
                by: ["reason"],
                _sum: { points: true },
                where: { points: { gt: 0 }, reason: { in: ["upload", "sold"] } },
            }).then((results) => {
                const data = results.reduce((acc, { reason, _sum }) => {
                    if (reason === "upload")
                        acc.uploaded = _sum.points || 0;
                    if (reason === "sold")
                        acc.sold = _sum.points || 0;
                    return acc;
                }, { total: 0, uploaded: 0, sold: 0 });
                data.total = data.uploaded + data.sold;
                return data;
            });
            // Fetch withdrawal requests
            const rawRequests = yield prisma_1.Prisma.rewardWithdrawal.findMany({
                where: { status: "pending" },
                include: { user: { select: { fullname: true } } },
            });
            const withdrawalRequestsList = rawRequests.map((req) => {
                var _a;
                return ({
                    userName: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.fullname) || "Unknown",
                    points: req.points,
                    bankAccountName: req.bankAccountName,
                    bankName: req.bankName,
                    bankAccountNumber: req.bankAccountNumber,
                    status: req.status,
                });
            });
            const summary = {
                totalRewards,
                withdrawalRequests,
                earnings,
            };
            return { summary, withdrawalRequests: withdrawalRequestsList };
        });
    }
    getRewardDetails(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch total points earned (sum of positive points)
            const totalPointsEarned = yield prisma_1.Prisma.rewardHistory.aggregate({
                _sum: { points: true },
                where: { userId, points: { gt: 0 } },
            }).then((sum) => sum._sum.points || 0);
            // Fetch withdrawn points (sum of negative points or points marked as withdrawal)
            const withdrawnPoints = yield prisma_1.Prisma.rewardHistory.aggregate({
                _sum: { points: true },
                where: { userId, reason: { equals: "Withdrawal" } },
            }).then((sum) => Math.abs(sum._sum.points || 0)); // Absolute value since points are negative
            // Fetch user details
            const user = yield prisma_1.Prisma.user.findUnique({
                where: { id: userId },
                select: {
                    fullname: true,
                    email: true,
                    phone_number: true,
                    is_verified: true,
                    last_login: true,
                },
            });
            if (!user) {
                throw new appError_1.NotFoundError("User not found");
            }
            const rewardDetails = {
                userName: user.fullname || "Unknown",
                email: user.email || "",
                phone: user.phone_number || "",
                is_verified: user.is_verified || false,
                lastLogin: user.last_login ? (0, date_fns_1.formatDistanceToNow)(user.last_login, { addSuffix: true }) : "Never",
            };
            // Fetch activity history from rewardHistory
            const history = yield prisma_1.Prisma.rewardHistory.findMany({
                where: { userId },
                select: {
                    points: true,
                    reason: true,
                    createdAt: true,
                    project: {
                        select: { title: true },
                    },
                },
            });
            const activityHistory = history.map((entry) => {
                var _a;
                const uploadPoints = entry.reason.toLowerCase().includes("upload") ? entry.points : 0;
                const soldPoints = entry.reason.toLowerCase().includes("sold") ? entry.points : 0;
                const totalPoints = uploadPoints + soldPoints;
                const property = ((_a = entry.project) === null || _a === void 0 ? void 0 : _a.title) || "N/A";
                const date = (0, date_fns_1.format)(entry.createdAt, "MMM dd, yyyy, hh:mm a");
                return {
                    uploadPoints,
                    soldPoints,
                    totalPoints,
                    property,
                    date,
                };
            });
            return {
                totalPointsEarned,
                withdrawnPoints,
                rewardDetails,
                activityHistory,
            };
        });
    }
}
exports.RewardsService = RewardsService;
