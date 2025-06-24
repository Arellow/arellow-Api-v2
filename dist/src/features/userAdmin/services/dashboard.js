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
exports.DashboardService = void 0;
const appError_1 = require("../../../lib/appError");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class DashboardService {
    constructor() {
        this.prisma = prisma;
    }
    getMonthRange(date) {
        const start = new Date(date.getFullYear(), date.getMonth(), 1);
        const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        return [start, end];
    }
    percentChange(current, previous) {
        if (previous === 0)
            return current === 0 ? 0 : 100;
        return ((current - previous) / previous) * 100;
    }
    // Type-safe count helpers for specific models
    countProject(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.project.count(args);
        });
    }
    countPropertyRequest(args) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.propertyRequest.count(args);
        });
    }
    getAdminDashboardSummary(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const now = new Date(); // 10:50 AM WAT, June 12, 2025
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const [thisMonthStart, thisMonthEnd] = this.getMonthRange(now);
                const [lastMonthStart, lastMonthEnd] = this.getMonthRange(lastMonth);
                const [listedNow, listedPrev, pendingNow, pendingPrev, sellingNow, sellingPrev, soldNow, soldPrev, rejectedNow, rejectedPrev, reqNow, reqPrev,] = yield Promise.all([
                    this.countProject({ where: { userId, createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
                    this.countProject({ where: { userId, createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
                    this.countProject({ where: { userId, isapproved: "pending", createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
                    this.countProject({ where: { userId, isapproved: "pending", createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
                    this.countProject({ where: { userId, status: "selling", createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
                    this.countProject({ where: { userId, status: "selling", createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
                    this.countProject({ where: { userId, status: "sold", createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
                    this.countProject({ where: { userId, status: "sold", createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
                    this.countProject({ where: { userId, isapproved: "rejected", createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
                    this.countProject({ where: { userId, isapproved: "rejected", createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
                    this.countPropertyRequest({ where: { userId, createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
                    this.countPropertyRequest({ where: { userId, createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
                ]);
                return {
                    total_listed: { count: listedNow, percent: this.percentChange(listedNow, listedPrev) },
                    pending: { count: pendingNow, percent: this.percentChange(pendingNow, pendingPrev) },
                    selling: { count: sellingNow, percent: this.percentChange(sellingNow, sellingPrev) },
                    sold: { count: soldNow, percent: this.percentChange(soldNow, soldPrev) },
                    rejected: { count: rejectedNow, percent: this.percentChange(rejectedNow, rejectedPrev) },
                    request: { count: reqNow, percent: this.percentChange(reqNow, reqPrev) },
                };
            }
            catch (error) {
                console.error("[getAdminDashboardSummary] Prisma error:", error);
                throw new appError_1.InternalServerError("Failed to fetch dashboard summary.");
            }
        });
    }
    getAdminDashboardRewards(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totalEarning = yield this.prisma.rewardHistory.aggregate({
                    _sum: { points: true },
                    where: { userId },
                });
                const soldEarning = yield this.prisma.rewardHistory.aggregate({
                    _sum: { points: true },
                    where: { userId, reason: { contains: "sold", mode: "insensitive" } },
                });
                const uploadedEarning = yield this.prisma.rewardHistory.aggregate({
                    _sum: { points: true },
                    where: { userId, reason: { contains: "upload", mode: "insensitive" } },
                });
                return {
                    total_earning: totalEarning._sum.points || 0,
                    sold_earning: soldEarning._sum.points || 0,
                    uploaded_earning: uploadedEarning._sum.points || 0,
                };
            }
            catch (error) {
                console.error("[getAdminDashboardRewards] Prisma error:", error);
                throw new appError_1.InternalServerError("Failed to fetch dashboard rewards.");
            }
        });
    }
    getAdminDashboardProperties(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const properties = yield this.prisma.project.findMany({
                    where: { userId },
                    take: 10,
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        title: true,
                        views: true,
                        isapproved: true,
                        status: true,
                        createdAt: true,
                        outside_view_images: true,
                        living_room_images: true,
                        kitchen_room_images: true,
                        primary_room_images: true,
                        floor_plan_images: true,
                        tour_3d_images: true,
                        other_images: true,
                    },
                });
                return properties.map((p, i) => {
                    var _a, _b, _c, _d, _e, _f, _g;
                    const image = ((_a = p.outside_view_images) === null || _a === void 0 ? void 0 : _a[0]) ||
                        ((_b = p.living_room_images) === null || _b === void 0 ? void 0 : _b[0]) ||
                        ((_c = p.kitchen_room_images) === null || _c === void 0 ? void 0 : _c[0]) ||
                        ((_d = p.primary_room_images) === null || _d === void 0 ? void 0 : _d[0]) ||
                        ((_e = p.floor_plan_images) === null || _e === void 0 ? void 0 : _e[0]) ||
                        ((_f = p.tour_3d_images) === null || _f === void 0 ? void 0 : _f[0]) ||
                        ((_g = p.other_images) === null || _g === void 0 ? void 0 : _g[0]) ||
                        null;
                    return {
                        property: p.title || "-",
                        image,
                        views: p.views || 0,
                        status: p.isapproved,
                        performance: `+${Math.floor(Math.random() * 50)}% May ${10 + i}`,
                    };
                });
            }
            catch (error) {
                console.error("[getAdminDashboardProperties] Prisma error:", error);
                throw new appError_1.InternalServerError("Failed to fetch dashboard properties.");
            }
        });
    }
    getAdminDashboardEarningHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let history = yield this.prisma.rewardHistory.findMany({
                    where: { userId },
                    take: 20,
                    orderBy: { createdAt: "desc" },
                    include: { project: { select: { id: true, title: true, banner: true } } },
                });
                return history.map((h) => {
                    let uploadedPoint = 0;
                    let soldPoint = 0;
                    if (h.reason.toLowerCase().includes("upload"))
                        uploadedPoint = h.points;
                    if (h.reason.toLowerCase().includes("sold"))
                        soldPoint = h.points;
                    const isWithdraw = h.reason.toLowerCase().includes("withdraw");
                    const totalPoint = uploadedPoint + soldPoint;
                    const property = h.project
                        ? { title: h.project.title || "-", image: h.project.banner || null, id: h.project.id }
                        : null;
                    const status = isWithdraw ? "Withdraw" : "Earnings";
                    return {
                        uploadedPoint: uploadedPoint > 0 ? `+${uploadedPoint}` : "-",
                        soldPoint: soldPoint > 0 ? `+${soldPoint}` : "-",
                        totalPoint: totalPoint > 0 ? `+${totalPoint}` : "-",
                        property,
                        date: h.createdAt,
                        status,
                        action: status,
                    };
                });
            }
            catch (error) {
                console.error("[getAdminDashboardEarningHistory] Prisma error:", error);
                throw new appError_1.InternalServerError("Failed to fetch dashboard earning history.");
            }
        });
    }
    getListedProperties(userId, pagination) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page = 1, limit = 10 } = pagination;
                const skip = (page - 1) * limit;
                const properties = yield this.prisma.project.findMany({
                    where: { userId },
                    take: limit,
                    skip,
                    orderBy: { createdAt: "desc" },
                    select: {
                        id: true,
                        title: true,
                        property_type: true,
                        price: true,
                        property_location: true,
                        createdAt: true,
                        isapproved: true,
                        outside_view_images: true,
                    },
                });
                const totalCount = yield this.prisma.project.count({ where: { userId } });
                const data = properties.map((p) => {
                    var _a;
                    return ({
                        propertyName: p.title || null,
                        propertyType: p.property_type || null,
                        price: p.price || null,
                        location: p.property_location || null,
                        listingDate: p.createdAt,
                        status: p.isapproved,
                        image: ((_a = p.outside_view_images) === null || _a === void 0 ? void 0 : _a[0]) || null,
                    });
                });
                return { data, totalCount };
            }
            catch (error) {
                console.error("[getListedProperties] Prisma error:", error);
                throw new appError_1.InternalServerError("Failed to fetch listed properties.");
            }
        });
    }
}
exports.DashboardService = DashboardService;
