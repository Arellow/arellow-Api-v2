"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopRealtorsLeaderboard = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../../lib/appError");
const prisma = new client_1.PrismaClient();
const getTopRealtorsLeaderboard = async () => {
    try {
        const users = await prisma.user.findMany({
            include: {
                properties: true,
            },
        });
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const getTrend = (current, previous) => {
            if (current > previous)
                return "Rising";
            if (current < previous)
                return "Falling";
            return "Steady";
        };
        const realtorStats = await Promise.all(users.map(async (user) => {
            const soldProperties = user.properties.filter((p) => p.salesStatus === client_1.SalesStatus.SOLD);
            const dealsClosed = soldProperties.length;
            const earnings = soldProperties.reduce((sum, p) => sum + (p.price || 0), 0);
            const prevMonthDeals = soldProperties.filter((p) => {
                const soldDate = new Date(p.createdAt);
                return soldDate >= lastMonth && soldDate < thisMonth;
            }).length;
            const currMonthDeals = soldProperties.filter((p) => {
                const soldDate = new Date(p.createdAt);
                return soldDate >= thisMonth;
            }).length;
            const trend = getTrend(currMonthDeals, prevMonthDeals);
            return {
                id: user.id,
                fullname: user.fullname,
                avatar: user.avatar,
                earnings,
                dealsClosed,
                trend,
                role: user.role,
            };
        }));
        const topRealtors = realtorStats
            .filter((r) => r.dealsClosed > 0)
            .sort((a, b) => b.earnings - a.earnings)
            .slice(0, 5);
        const topPerformer = topRealtors.reduce((best, realtor) => {
            const user = users.find((u) => u.id === realtor.id);
            if (!user)
                return best;
            const monthEarnings = user.properties
                .filter((p) => p.salesStatus === client_1.SalesStatus.SOLD && new Date(p.createdAt) >= thisMonth)
                .reduce((sum, p) => sum + (p.price || 0), 0);
            if (!best || monthEarnings > (best.earnings || 0)) {
                return { ...realtor, earnings: monthEarnings };
            }
            return best;
        }, null);
        return {
            topPerformer,
            leaderboard: topRealtors,
        };
    }
    catch (error) {
        console.error("[getTopRealtorsLeaderboard] Error:", error);
        throw new appError_1.InternalServerError("Failed to fetch leaderboard.");
    }
};
exports.getTopRealtorsLeaderboard = getTopRealtorsLeaderboard;
