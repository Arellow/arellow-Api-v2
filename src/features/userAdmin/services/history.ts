
import { InternalServerError } from "../../../lib/appError";
import {
  EarningSummaryResponse,
  EarningHistoryFilterDto,
  EarningHistoryResponse,
  EarningHistoryItem,
} from "../dtos/history.dto";
import { Prisma, PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export class EarningHistoryService {
  private prisma = prisma;

  async getEarningSummary(userId: string): Promise<EarningSummaryResponse> {
    try {
      const totalEarning = await this.prisma.rewardHistory.aggregate({
        _sum: { points: true },
        where: { userId },
      });
      const withdrawableEarning = await this.prisma.rewardHistory.aggregate({
        _sum: { points: true },
        where: { userId, reason: { contains: "upload", mode: "insensitive" } },
      });
      const withdrawnPoints = await this.prisma.rewardHistory.aggregate({
        _sum: { points: true },
        where: { userId, reason: { contains: "withdraw", mode: "insensitive" } },
      });

      return {
        total_earning: totalEarning._sum.points || 0,
        withdrawable_earning: withdrawableEarning._sum.points || 0,
        withdrawn_points: Math.abs(withdrawnPoints._sum.points || 0),
      };
    } catch (error) {
      console.error("[getEarningSummary] Prisma error:", error);
      throw new InternalServerError("Failed to fetch earning summary.");
    }
  }

  async getEarningHistory(userId: string, filter: EarningHistoryFilterDto): Promise<EarningHistoryResponse> {
    try {
      const { date, propertyCategory, country, propertyState, search, page = 1, limit = 10 } = filter;
      const skip = (page - 1) * limit;

      const whereClause: Prisma.RewardHistoryWhereInput = {
        userId,
        ...(date && { createdAt: { equals: date } }),
        ...(propertyCategory && { project: { category: { equals: propertyCategory, mode: "insensitive" } } }),
        ...(country && { project: { country: { equals: country, mode: "insensitive" } } }),
        ...(propertyState && { project: { region: { equals: propertyState, mode: "insensitive" } } }),
        ...(search && {
          OR: [
            { reason: { contains: search, mode: "insensitive" } },
            { project: { title: { contains: search, mode: "insensitive" } } },
          ],
        }),
      };

      const history = await this.prisma.rewardHistory.findMany({
        where: whereClause,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: { project: { select: { id: true, title: true, banner: true } } },
      });

      const totalCount = await this.prisma.rewardHistory.count({ where: whereClause });

      const data: EarningHistoryItem[] = history.map((h) => {
        let uploadedPoint = 0;
        let soldPoint = 0;
        if (h.reason.toLowerCase().includes("upload")) uploadedPoint = h.points;
        if (h.reason.toLowerCase().includes("sold")) soldPoint = h.points;
        const isWithdraw = h.reason.toLowerCase().includes("withdraw");
        const totalPoint = uploadedPoint + soldPoint;

        const property = h.project
          ? { title: h.project.title || "-", image: h.project.banner || null, id: h.project.id }
          : null;

        const status: "Earnings" | "Withdraw" = isWithdraw ? "Withdraw" : "Earnings";

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
    } catch (error) {
      console.error("[getEarningHistory] Prisma error:", error);
      throw new InternalServerError("Failed to fetch earning history.");
    }
  }
}