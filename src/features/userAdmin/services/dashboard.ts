import { InternalServerError } from "../../../lib/appError";
import {
  DashboardSummaryResponse,
  DashboardRewardsResponse,
  DashboardPropertyResponse,
  DashboardEarningHistoryResponse,
  PropertyDetail,
  ListedPropertiesResponse,
  ListedPropertiesPaginationDto,
  ListedPropertyItem,
} from "../dtos/dashboard.dto";
import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type ValidPrismaModel = "project" | "propertyRequest" | "rewardHistory";

// export class DashboardService {
//   private prisma = prisma;

//   private getMonthRange(date: Date): [Date, Date] {
//     const start = new Date(date.getFullYear(), date.getMonth(), 1);
//     const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
//     return [start, end];
//   }

//   private percentChange(current: number, previous: number): number {
//     if (previous === 0) return current === 0 ? 0 : 100;
//     return ((current - previous) / previous) * 100;
//   }

//   // Type-safe count helpers for specific models
//   private async countProject(args: Prisma.ProjectCountArgs) {
//     return this.prisma.project.count(args);
//   }

//   private async countPropertyRequest(args: Prisma.PropertyRequestCountArgs) {
//     return this.prisma.propertyRequest.count(args);
//   }

//   async getAdminDashboardSummary(userId: string): Promise<DashboardSummaryResponse> {
//     try {
//       const now = new Date(); // 10:50 AM WAT, June 12, 2025
//       const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//       const [thisMonthStart, thisMonthEnd] = this.getMonthRange(now);
//       const [lastMonthStart, lastMonthEnd] = this.getMonthRange(lastMonth);

//       const [
//         listedNow, listedPrev,
//         pendingNow, pendingPrev,
//         sellingNow, sellingPrev,
//         soldNow, soldPrev,
//         rejectedNow, rejectedPrev,
//         reqNow, reqPrev,
//       ] = await Promise.all([
//         this.countProject({ where: { userId, createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
//         this.countProject({ where: { userId, createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
//         this.countProject({ where: { userId, isapproved: "pending", createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
//         this.countProject({ where: { userId, isapproved: "pending", createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
//         this.countProject({ where: { userId, status: "selling", createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
//         this.countProject({ where: { userId, status: "selling", createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
//         this.countProject({ where: { userId, status: "sold", createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
//         this.countProject({ where: { userId, status: "sold", createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
//         this.countProject({ where: { userId, isapproved: "rejected", createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
//         this.countProject({ where: { userId, isapproved: "rejected", createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
//         this.countPropertyRequest({ where: { userId, createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
//         this.countPropertyRequest({ where: { userId, createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
//       ]);

//       return {
//         total_listed: { count: listedNow, percent: this.percentChange(listedNow, listedPrev) },
//         pending: { count: pendingNow, percent: this.percentChange(pendingNow, pendingPrev) },
//         selling: { count: sellingNow, percent: this.percentChange(sellingNow, sellingPrev) },
//         sold: { count: soldNow, percent: this.percentChange(soldNow, soldPrev) },
//         rejected: { count: rejectedNow, percent: this.percentChange(rejectedNow, rejectedPrev) },
//         request: { count: reqNow, percent: this.percentChange(reqNow, reqPrev) },
//       };
//     } catch (error) {
//       console.error("[getAdminDashboardSummary] Prisma error:", error);
//       throw new InternalServerError("Failed to fetch dashboard summary.");
//     }
//   }

//   async getAdminDashboardRewards(userId: string): Promise<DashboardRewardsResponse> {
//     try {
//       const totalEarning = await this.prisma.rewardHistory.aggregate({
//         _sum: { points: true },
//         where: { userId },
//       });
//       const soldEarning = await this.prisma.rewardHistory.aggregate({
//         _sum: { points: true },
//         where: { userId, reason: { contains: "sold", mode: "insensitive" } },
//       });
//       const uploadedEarning = await this.prisma.rewardHistory.aggregate({
//         _sum: { points: true },
//         where: { userId, reason: { contains: "upload", mode: "insensitive" } },
//       });

//       return {
//         total_earning: totalEarning._sum.points || 0,
//         sold_earning: soldEarning._sum.points || 0,
//         uploaded_earning: uploadedEarning._sum.points || 0,
//       };
//     } catch (error) {
//       console.error("[getAdminDashboardRewards] Prisma error:", error);
//       throw new InternalServerError("Failed to fetch dashboard rewards.");
//     }
//   }

//   async getAdminDashboardProperties(userId: string): Promise<DashboardPropertyResponse[]> {
//     try {
//       const properties = await this.prisma.project.findMany({
//         where: { userId },
//         take: 10,
//         orderBy: { createdAt: "desc" },
//         select: {
//           id: true,
//           title: true,
//           views: true,
//           isapproved: true,
//           status: true,
//           createdAt: true,
//           outside_view_images: true,
//           living_room_images: true,
//           kitchen_room_images: true,
//           primary_room_images: true,
//           floor_plan_images: true,
//           tour_3d_images: true,
//           other_images: true,
//         },
//       });

//       return properties.map((p, i) => {
//         const image =
//           p.outside_view_images?.[0] ||
//           p.living_room_images?.[0] ||
//           p.kitchen_room_images?.[0] ||
//           p.primary_room_images?.[0] ||
//           p.floor_plan_images?.[0] ||
//           p.tour_3d_images?.[0] ||
//           p.other_images?.[0] ||
//           null;

//         return {
//           property: p.title || "-",
//           image,
//           views: p.views || 0,
//           status: p.isapproved as "approved" | "pending" | "rejected",
//           performance: `+${Math.floor(Math.random() * 50)}% May ${10 + i}`,
//         };
//       });
//     } catch (error) {
//       console.error("[getAdminDashboardProperties] Prisma error:", error);
//       throw new InternalServerError("Failed to fetch dashboard properties.");
//     }
//   }

//  async getAdminDashboardEarningHistory(userId: string): Promise<DashboardEarningHistoryResponse[]> {
//   try {
//     let history = await this.prisma.rewardHistory.findMany({
//       where: { userId },
//       take: 20,
//       orderBy: { createdAt: "desc" },
//       include: { project: { select: { id: true, title: true, banner: true } } },
//     });



//     return history.map((h) => {
//       let uploadedPoint = 0;
//       let soldPoint = 0;
//       if (h.reason.toLowerCase().includes("upload")) uploadedPoint = h.points;
//       if (h.reason.toLowerCase().includes("sold")) soldPoint = h.points;
//       const isWithdraw = h.reason.toLowerCase().includes("withdraw");
//       const totalPoint = uploadedPoint + soldPoint;

//       const property: PropertyDetail | null = h.project
//         ? { title: h.project.title || "-", image: h.project.banner || null, id: h.project.id }
//         : null;

//       const status: "Earnings" | "Withdraw" = isWithdraw ? "Withdraw" : "Earnings";

//       return {
//         uploadedPoint: uploadedPoint > 0 ? `+${uploadedPoint}` : "-",
//         soldPoint: soldPoint > 0 ? `+${soldPoint}` : "-",
//         totalPoint: totalPoint > 0 ? `+${totalPoint}` : "-",
//         property,
//         date: h.createdAt,
//         status,
//         action: status,
//       };
//     });
//   } catch (error) {
//     console.error("[getAdminDashboardEarningHistory] Prisma error:", error);
//     throw new InternalServerError("Failed to fetch dashboard earning history.");
//   }
// }


//   async getListedProperties(userId: string, pagination: ListedPropertiesPaginationDto): Promise<ListedPropertiesResponse> {
//     try {
//       const { page = 1, limit = 10 } = pagination;
//       const skip = (page - 1) * limit;

//       const properties = await this.prisma.project.findMany({
//         where: { userId },
//         take: limit,
//         skip,
//         orderBy: { createdAt: "desc" },
//         select: {
//           id: true,
//           title: true,
//           property_type: true,
//           price: true,
//           property_location: true,
//           createdAt: true,
//           isapproved: true,
//           outside_view_images: true,
//         },
//       });

//       const totalCount = await this.prisma.project.count({ where: { userId } });

//       const data: ListedPropertyItem[] = properties.map((p) => ({
//         propertyName: p.title || null,
//         propertyType: p.property_type || null,
//         price: p.price || null,
//         location: p.property_location || null,
//         listingDate: p.createdAt,
//         status: p.isapproved as "approved" | "pending" | "rejected",
//         image: p.outside_view_images?.[0] || null,
//       }));

//       return { data, totalCount };
//     } catch (error) {
//       console.error("[getListedProperties] Prisma error:", error);
//       throw new InternalServerError("Failed to fetch listed properties.");
//     }
//   }
// }

