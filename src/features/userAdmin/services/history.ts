import { InternalServerError } from "../../../lib/appError";
import { EarningSummaryResponse, EarningHistoryFilterDto, EarningHistoryResponse, EarningHistoryItem } from "../dtos/history.dto";
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
      const withdrawnPoints = await this.prisma.rewardWithdrawal.aggregate({
        _sum: { points: true },
        where: { userId, status: "pending" },
      }) || { _sum: { points: 0 } }; // Default to 0 if no withdrawals

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
      const { date, country, state, search, page = 1, limit = 10 } = filter;
      const skip = (page - 1) * limit;

      const whereClause: Prisma.RewardHistoryWhereInput = {
        userId,
        ...(date && { createdAt: { equals: date } }),
        ...(country && { property: { country: { equals: country, mode: "insensitive" } } }),
        ...(state && { property: { state: { equals: state, mode: "insensitive" } } }),
        ...(search && {
          OR: [
            { reason: { contains: search, mode: "insensitive" } },
            { property: { title: { contains: search, mode: "insensitive" } } },
          ],
        }),
      };

      const history = await this.prisma.rewardHistory.findMany({
        where: whereClause,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        include: { property: { include: { media: true } } }, // Include media to derive banner
      });

      const totalCount = await this.prisma.rewardHistory.count({ where: whereClause });

      const data: EarningHistoryItem[] = history.map((h) => {
        const banner = h.property?.media.find(m => m.photoType === "FRONT_VIEW")?.url || null;
        return {
          points: h.points,
          reason: h.reason,
          property: h.property ? { id: h.property.id, title: h.property.title || "-", banner } : null,
          date: h.createdAt,
        };
      });

      return { data, totalCount };
    } catch (error) {
      console.error("[getEarningHistory] Prisma error:", error);
      throw new InternalServerError("Failed to fetch earning history.");
    }
  }
}