"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewardService = void 0;
const appError_1 = require("../../../lib/appError");
const prisma_1 = require("../../../lib/prisma");
const date_fns_1 = require("date-fns");
class RewardService {
    async withdrawReward(userId, pointToWithdraw, bankAccountName, bankAccountNumber, bankName) {
        // Validate required fields
        if (!pointToWithdraw ||
            !bankAccountName ||
            !bankAccountNumber ||
            !bankName) {
            throw new appError_1.BadRequestError("pointToWithdraw, bankAccountName, bankAccountNumber and bankName are all required.");
        }
        // Validate point amount
        if (isNaN(pointToWithdraw)) {
            throw new appError_1.BadRequestError("pointToWithdraw must be a valid number.");
        }
        if (pointToWithdraw < 100) {
            throw new appError_1.BadRequestError("Minimum withdrawal amount is 100 points.");
        }
        // Fetch user
        let user;
        try {
            user = await prisma_1.Prisma.user.findUnique({ where: { id: userId } });
        }
        catch (dbErr) {
            console.error("[withdrawReward] Prisma error on findUnique:", dbErr);
            throw new appError_1.BadRequestError("Database error when fetching user.");
        }
        if (!user) {
            throw new appError_1.BadRequestError("User not found.");
        }
        // Check balance
        const currentPoints = user.points || 0;
        if (currentPoints < pointToWithdraw) {
            throw new appError_1.BadRequestError("Insufficient reward points.");
        }
        // Decrement user points
        try {
            await prisma_1.Prisma.user.update({
                where: { id: userId },
                data: { points: { decrement: pointToWithdraw } },
            });
        }
        catch (updateErr) {
            console.error("[withdrawReward] Prisma error on update:", updateErr);
            throw new appError_1.BadRequestError("Database error when updating user points.");
        }
        // Log to rewardHistory
        try {
            await prisma_1.Prisma.rewardHistory.create({
                data: {
                    userId,
                    reason: "Withdrawal",
                    description: `Withdrew ${pointToWithdraw} points`,
                    points: -pointToWithdraw,
                    propertyId: "Unknown",
                },
            });
        }
        catch (histErr) {
            console.error("[withdrawReward] Prisma error on rewardHistory.create:", histErr);
            throw new appError_1.BadRequestError("Database error when logging withdrawal history.");
        }
        // Create withdrawal request record
        try {
            await prisma_1.Prisma.rewardWithdrawal.create({
                data: {
                    userId,
                    points: pointToWithdraw,
                    bankAccountName,
                    bankAccountNumber,
                    bankName,
                    status: "pending",
                },
            });
        }
        catch (wdErr) {
            console.error("[withdrawReward] Prisma error on rewardWithdrawal.create:", wdErr);
            throw new appError_1.BadRequestError("Database error when creating withdrawal request.");
        }
        return { message: "Withdrawal request submitted." };
    }
    async getUserEarnings(userId) {
        const NAIRA_PER_POINT = 50;
        // Fetch all reward history for the user
        const history = await prisma_1.Prisma.rewardHistory.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            select: { points: true, reason: true, createdAt: true },
        });
        let uploadedPoints = 0;
        let soldPoints = 0;
        const earningHistory = history.map((entry) => {
            const lowerReason = entry.reason.toLowerCase();
            let points = entry.points;
            let type;
            let description;
            if (lowerReason.includes("upload")) {
                uploadedPoints += points;
                type = "earned";
                description = "ArellowPoints Earned";
            }
            else if (lowerReason.includes("sold")) {
                soldPoints += points;
                type = "earned";
                description = "ArellowPoints Earned";
            }
            else if (lowerReason.includes("withdrawal") ||
                lowerReason.includes("used")) {
                points = -points; // Convert to negative for used points
                type = "used";
                description = "ArellowPoints Used";
            }
            else {
                type = "earned";
                description = "ArellowPoints Earned";
            }
            return {
                type,
                description,
                date: (0, date_fns_1.format)(entry.createdAt, "MMMM dd, yyyy, hh:mm a"),
                points,
                editable: history.length === 1,
            };
        });
        const totalPoints = uploadedPoints + soldPoints;
        const uploadedNaira = uploadedPoints * NAIRA_PER_POINT;
        const soldNaira = soldPoints * NAIRA_PER_POINT;
        const totalNaira = totalPoints * NAIRA_PER_POINT;
        return {
            points: {
                total: totalPoints,
                uploaded: uploadedPoints,
                sold: soldPoints,
            },
            naira: {
                total: totalNaira,
                uploaded: uploadedNaira,
                sold: soldNaira,
            },
            history: earningHistory,
        };
    }
}
exports.RewardService = RewardService;
