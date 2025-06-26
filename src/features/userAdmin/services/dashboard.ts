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
import { Prisma, PrismaClient, PropertyStatus } from "@prisma/client";
const prisma = new PrismaClient();

type ValidPrismaModel = "property" | "propertyRequest" | "rewardHistory";

export class DashboardService {
  private prisma = prisma;

  private getMonthRange(date: Date): [Date, Date] {
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return [start, end];
  }

  private percentChange(current: number, previous: number): number {
    if (previous === 0) return current === 0 ? 0 : 100;
    return ((current - previous) / previous) * 100;
  }

  private async countProperty(args: Prisma.PropertyCountArgs) {
    return this.prisma.property.count(args);
  }

  private async countPropertyRequest(args: Prisma.PropertyRequestCountArgs) {
    return this.prisma.propertyRequest.count(args);
  }

  async getAdminDashboardSummary(userId: string): Promise<DashboardSummaryResponse> {
    try {
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const [thisMonthStart, thisMonthEnd] = this.getMonthRange(now);
      const [lastMonthStart, lastMonthEnd] = this.getMonthRange(lastMonth);

      const [
        listedNow, listedPrev,
        pendingNow, pendingPrev,
        sellingNow, sellingPrev,
        soldNow, soldPrev,
        rejectedNow, rejectedPrev,
        reqNow, reqPrev,
      ] = await Promise.all([
        this.countProperty({ where: { userId, createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
        this.countProperty({ where: { userId, createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
        this.countProperty({ where: { userId, status: PropertyStatus.PENDING, createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
        this.countProperty({ where: { userId, status: PropertyStatus.PENDING, createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
        this.countProperty({ where: { userId, salesStatus: "SELLING", createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
        this.countProperty({ where: { userId, salesStatus: "SELLING", createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
        this.countProperty({ where: { userId, salesStatus: "SOLD", createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
        this.countProperty({ where: { userId, salesStatus: "SOLD", createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
        this.countProperty({ where: { userId, status: PropertyStatus.REJECTED, createdAt: { gte: thisMonthStart, lt: thisMonthEnd } } }),
        this.countProperty({ where: { userId, status: PropertyStatus.REJECTED, createdAt: { gte: lastMonthStart, lt: lastMonthEnd } } }),
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
    } catch (error) {
      console.error("[getAdminDashboardSummary] Prisma error:", error);
      throw new InternalServerError("Failed to fetch dashboard summary.");
    }
  }

  async getAdminDashboardRewards(userId: string): Promise<DashboardRewardsResponse> {
    try {
      const totalEarning = await this.prisma.rewardHistory.aggregate({
        _sum: { points: true },
        where: { userId },
      });
      const soldEarning = await this.prisma.rewardHistory.aggregate({
        _sum: { points: true },
        where: { userId, reason: { contains: "sold", mode: "insensitive" } },
      });
      const uploadedEarning = await this.prisma.rewardHistory.aggregate({
        _sum: { points: true },
        where: { userId, reason: { contains: "upload", mode: "insensitive" } },
      });

      return {
        total_earning: totalEarning._sum.points || 0,
        sold_earning: soldEarning._sum.points || 0,
        uploaded_earning: uploadedEarning._sum.points || 0,
      };
    } catch (error) {
      console.error("[getAdminDashboardRewards] Prisma error:", error);
      throw new InternalServerError("Failed to fetch dashboard rewards.");
    }
  }

  async getAdminDashboardProperties(userId: string): Promise<DashboardPropertyResponse[]> {
    try {
      const properties = await this.prisma.property.findMany({
        where: { userId },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { media: true }, 
      });

      return properties.map((p) => {
        const image = p.media.find(m => m.photoType === "FRONT_VIEW")?.url || null;
        return {
          property: p.title || "-",
          image,
          views: p.likesCount || 0,
          status: p.status,
        };
      });
    } catch (error) {
      console.error("[getAdminDashboardProperties] Prisma error:", error);
      throw new InternalServerError("Failed to fetch dashboard properties.");
    }
  }

  async getAdminDashboardEarningHistory(userId: string): Promise<DashboardEarningHistoryResponse[]> {
    try {
      const history = await this.prisma.rewardHistory.findMany({
        where: { userId },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { property: true },
      });

      return history.map((h) => ({
        points: h.points,
        reason: h.reason,
        property: h.property ? { title: h.property.title || "-", id: h.property.id } : null,
        date: h.createdAt,
      }));
    } catch (error) {
      console.error("[getAdminDashboardEarningHistory] Prisma error:", error);
      throw new InternalServerError("Failed to fetch dashboard earning history.");
    }
  }

  async getListedProperties(userId: string, pagination: ListedPropertiesPaginationDto): Promise<ListedPropertiesResponse> {
    try {
      const { page = 1, limit = 10 } = pagination;
      const skip = (page - 1) * limit;

      const properties = await this.prisma.property.findMany({
        where: { userId },
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: { media: true }, 
      });

      const totalCount = await this.prisma.property.count({ where: { userId } });

      const data: ListedPropertyItem[] = properties.map((p) => ({
        propertyName: p.title || null,
        price: p.price || null,
        location: [p.country, p.state, p.city, p.neighborhood].filter(Boolean).join(", ") || null,
        listingDate: p.createdAt,
        status: p.status,
        image: p.media.find(m => m.photoType === "FRONT_VIEW")?.url || null,
      }));

      return { data, totalCount };
    } catch (error) {
      console.error("[getListedProperties] Prisma error:", error);
      throw new InternalServerError("Failed to fetch listed properties.");
    }
  }
}