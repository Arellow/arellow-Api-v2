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
exports.EarningHistoryService = void 0;
const appError_1 = require("../../../lib/appError");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class EarningHistoryService {
    constructor() {
        this.prisma = prisma;
    }
    getEarningSummary(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totalEarning = yield this.prisma.rewardHistory.aggregate({
                    _sum: { points: true },
                    where: { userId },
                });
                const withdrawableEarning = yield this.prisma.rewardHistory.aggregate({
                    _sum: { points: true },
                    where: { userId, reason: { contains: "upload", mode: "insensitive" } },
                });
                const withdrawnPoints = yield this.prisma.rewardHistory.aggregate({
                    _sum: { points: true },
                    where: { userId, reason: { contains: "withdraw", mode: "insensitive" } },
                });
                return {
                    total_earning: totalEarning._sum.points || 0,
                    withdrawable_earning: withdrawableEarning._sum.points || 0,
                    withdrawn_points: Math.abs(withdrawnPoints._sum.points || 0),
                };
            }
            catch (error) {
                console.error("[getEarningSummary] Prisma error:", error);
                throw new appError_1.InternalServerError("Failed to fetch earning summary.");
            }
        });
    }
    getEarningHistory(userId, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { date, propertyCategory, country, propertyState, search, page = 1, limit = 10 } = filter;
                const skip = (page - 1) * limit;
                const whereClause = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({ userId }, (date && { createdAt: { equals: date } })), (propertyCategory && { project: { category: { equals: propertyCategory, mode: "insensitive" } } })), (country && { project: { country: { equals: country, mode: "insensitive" } } })), (propertyState && { project: { region: { equals: propertyState, mode: "insensitive" } } })), (search && {
                    OR: [
                        { reason: { contains: search, mode: "insensitive" } },
                        { project: { title: { contains: search, mode: "insensitive" } } },
                    ],
                }));
                const history = yield this.prisma.rewardHistory.findMany({
                    where: whereClause,
                    take: limit,
                    skip,
                    orderBy: { createdAt: "desc" },
                    include: { project: { select: { id: true, title: true, banner: true } } },
                });
                const totalCount = yield this.prisma.rewardHistory.count({ where: whereClause });
                const data = history.map((h) => {
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
                return { data, totalCount };
            }
            catch (error) {
                console.error("[getEarningHistory] Prisma error:", error);
                throw new appError_1.InternalServerError("Failed to fetch earning history.");
            }
        });
    }
}
exports.EarningHistoryService = EarningHistoryService;
