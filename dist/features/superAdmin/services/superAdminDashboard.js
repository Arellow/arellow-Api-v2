"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../../lib/appError");
const prisma = new client_1.PrismaClient();
class DashboardService {
    async getDashboardSummary() {
        const today = new Date();
        const lastWeek = new Date(today);
        lastWeek.setDate(today.getDate() - 7);
        const weekBeforeLast = new Date(today);
        weekBeforeLast.setDate(today.getDate() - 14);
        const [totalListings, totalSelling, totalSold, numberOfRealtors, pendingProperties, listingsThisWeek, listingsLastWeek, sellingThisWeek, sellingLastWeek, soldThisWeek, soldLastWeek, realtorsThisWeek, realtorsLastWeek, pendingThisWeek, pendingLastWeek,] = await Promise.all([
            // Totals
            prisma.property.count(),
            prisma.property.count({ where: { salesStatus: client_1.SalesStatus.SELLING } }),
            prisma.property.count({ where: { salesStatus: client_1.SalesStatus.SOLD } }),
            prisma.user.count({ where: { role: client_1.UserRole.REALTOR } }),
            prisma.property.count({ where: { status: client_1.PropertyStatus.PENDING } }),
            // Weekly comparisons
            prisma.property.count({ where: { createdAt: { gte: lastWeek } } }),
            prisma.property.count({ where: { createdAt: { gte: weekBeforeLast, lt: lastWeek } } }),
            prisma.property.count({
                where: { createdAt: { gte: lastWeek }, salesStatus: client_1.SalesStatus.SELLING },
            }),
            prisma.property.count({
                where: { createdAt: { gte: weekBeforeLast, lt: lastWeek }, salesStatus: client_1.SalesStatus.SELLING },
            }),
            prisma.property.count({
                where: { createdAt: { gte: lastWeek }, salesStatus: client_1.SalesStatus.SOLD },
            }),
            prisma.property.count({
                where: { createdAt: { gte: weekBeforeLast, lt: lastWeek }, salesStatus: client_1.SalesStatus.SOLD },
            }),
            prisma.user.count({
                where: { createdAt: { gte: lastWeek }, role: client_1.UserRole.REALTOR },
            }),
            prisma.user.count({
                where: { createdAt: { gte: weekBeforeLast, lt: lastWeek }, role: client_1.UserRole.REALTOR },
            }),
            prisma.property.count({
                where: { createdAt: { gte: lastWeek }, status: client_1.PropertyStatus.PENDING },
            }),
            prisma.property.count({
                where: { createdAt: { gte: weekBeforeLast, lt: lastWeek }, status: client_1.PropertyStatus.PENDING },
            }),
        ]);
        const getPercentageChange = (current, previous) => {
            if (previous === 0 && current === 0)
                return 0;
            if (previous === 0)
                return 100;
            return ((current - previous) / previous) * 100;
        };
        const percentages = {
            listings: getPercentageChange(listingsThisWeek, listingsLastWeek),
            selling: getPercentageChange(sellingThisWeek, sellingLastWeek),
            sold: getPercentageChange(soldThisWeek, soldLastWeek),
            realtors: getPercentageChange(realtorsThisWeek, realtorsLastWeek),
            pendingProperties: getPercentageChange(pendingThisWeek, pendingLastWeek),
        };
        return {
            totalListings,
            totalSelling,
            totalSold,
            numberOfRealtors,
            pendingProperties,
            percentages,
        };
    }
    async getTopRealtors() {
        const soldProjects = await prisma.property.findMany({
            where: { salesStatus: client_1.SalesStatus.SOLD },
            select: { userId: true },
        });
        const totalSold = soldProjects.length;
        if (totalSold === 0) {
            return { topRealtors: [] };
        }
        const countMap = {};
        soldProjects.forEach((p) => {
            if (p.userId) {
                countMap[p.userId] = (countMap[p.userId] || 0) + 1;
            }
        });
        const sorted = Object.entries(countMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3);
        const topUserIds = sorted.map(([id]) => id);
        const users = await prisma.user.findMany({
            where: { id: { in: topUserIds } },
            select: { id: true, fullname: true, avatar: true },
        });
        const topRealtors = sorted.map(([userId, soldCount]) => {
            const user = users.find((u) => u.id === userId);
            return {
                id: userId,
                fullname: user?.fullname || "Unknown",
                avatar: user?.avatar || null,
                soldCount,
                percentage: parseFloat(((soldCount / totalSold) * 100).toFixed(1)),
            };
        });
        return { topRealtors };
    }
    async getRewardSumByType(reason) {
        const whereClause = reason ? { reason: { equals: reason, mode: "insensitive" } } : {};
        const sum = await prisma.rewardHistory.aggregate({
            _sum: { points: true },
            where: whereClause,
        });
        return sum._sum.points || 0;
    }
    async getRewardOverview() {
        const [totalRewardEarned, propertyUploadEarnings, propertySoldEarnings] = await Promise.all([
            this.getRewardSumByType(null),
            this.getRewardSumByType("upload"),
            this.getRewardSumByType("sold"),
        ]);
        return {
            totalRewardEarned,
            propertyUploadEarnings,
            propertySoldEarnings,
        };
    }
    async getRecentListings() {
        const recentListings = await prisma.property.findMany({
            where: { createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } },
            include: { user: { select: { fullname: true, avatar: true } }, media: true },
            orderBy: { createdAt: "desc" },
            take: 5,
        });
        return recentListings.map((listing) => ({
            id: listing.id,
            title: listing.title,
            image: listing.media.find((m) => m.photoType === "FRONT_VIEW")?.url || null,
            location: [listing.country, listing.state, listing.city, listing.neighborhood].filter(Boolean).join(", ") || null,
            price: listing.price,
            listingDate: listing.createdAt,
            status: listing.status,
            realtor: listing.user?.fullname || "Unknown",
        }));
    }
    async performQuickAction(action, projectId) {
        switch (action) {
            case "approve-listing":
                await prisma.property.update({
                    where: { id: projectId },
                    data: { status: client_1.PropertyStatus.APPROVED },
                });
                return { message: "Listing approved successfully" };
            case "reject-listing":
                await prisma.property.update({
                    where: { id: projectId },
                    data: { status: client_1.PropertyStatus.REJECTED },
                });
                return { message: "Listing rejected successfully" };
            default:
                throw new appError_1.BadRequestError("Invalid action");
        }
    }
}
exports.DashboardService = DashboardService;
