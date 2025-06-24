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
exports.getTopRealtorsLeaderboard = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../../lib/appError");
const prisma = new client_1.PrismaClient();
const getTopRealtorsLeaderboard = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            include: {
                projects: true,
            },
        });
        // Define date variables at the top level
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        // Helper function to determine trend
        const getTrend = (current, previous) => {
            if (current > previous)
                return "Rising";
            if (current < previous)
                return "Falling";
            return "Steady";
        };
        // Calculate stats for each user
        const realtorStats = yield Promise.all(users.map((user) => __awaiter(void 0, void 0, void 0, function* () {
            // Deals closed = sold projects
            const soldProjects = user.projects.filter((p) => p.status === "sold");
            const dealsClosed = soldProjects.length;
            // Earnings = sum of sold project prices
            const earnings = soldProjects.reduce((sum, p) => sum + (p.price || 0), 0);
            // Average rating
            const rating = user.rating || 0;
            // Previous and current month deals (using createdAt)
            const prevMonthDeals = soldProjects.filter((p) => {
                const soldDate = new Date(p.createdAt);
                return soldDate >= lastMonth && soldDate < thisMonth;
            }).length;
            const currMonthDeals = soldProjects.filter((p) => {
                const soldDate = new Date(p.createdAt);
                return soldDate >= thisMonth;
            }).length;
            const trend = getTrend(currMonthDeals, prevMonthDeals);
            return {
                id: user.id,
                fullname: user.fullname,
                avatar: user.avatar,
                rating,
                earnings,
                dealsClosed,
                trend,
                role: user.role,
            };
        })));
        // Sort by earnings descending, take top 5
        const topRealtors = realtorStats
            .filter((r) => r.dealsClosed > 0)
            .sort((a, b) => b.earnings - a.earnings)
            .slice(0, 5);
        // Top performer this month (highest earnings this month)
        const topPerformer = topRealtors.reduce((best, realtor) => {
            const user = users.find((u) => u.id === realtor.id);
            if (!user)
                return best;
            const monthEarnings = user.projects
                .filter((p) => p.status === "sold" && new Date(p.createdAt) >= thisMonth)
                .reduce((sum, p) => sum + (p.price || 0), 0);
            if (!best || monthEarnings > (best.monthEarnings || 0)) {
                const performer = Object.assign(Object.assign({}, realtor), { monthEarnings });
                return performer;
            }
            return best;
        }, null);
        return {
            topPerformer: topPerformer ? Object.assign({}, topPerformer) : null,
            leaderboard: topRealtors,
        };
    }
    catch (error) {
        console.error("[getTopRealtorsLeaderboard] Error:", error);
        throw new appError_1.InternalServerError("Failed to fetch leaderboard.");
    }
});
exports.getTopRealtorsLeaderboard = getTopRealtorsLeaderboard;
