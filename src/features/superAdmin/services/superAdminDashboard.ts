import { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
import { DashboardSummaryDto, RewardOverviewDto } from "../dtos/superAdminDashboard";
import { TopRealtorsResponseDto } from "../dtos/superAdminDashboard";
const prisma = new PrismaClient();
export class DashboardService {
  async getDashboardSummary(): Promise<DashboardSummaryDto> {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const weekBeforeLast = new Date(today);
    weekBeforeLast.setDate(today.getDate() - 14);

    const [
      totalListings,
      totalSelling,
      totalSold,
      numberOfRealtors,
      pendingProperties,
      listingsThisWeek,
      listingsLastWeek,
      sellingThisWeek,
      sellingLastWeek,
      soldThisWeek,
      soldLastWeek,
      realtorsThisWeek,
      realtorsLastWeek,
      pendingThisWeek,
      pendingLastWeek,
    ] = await Promise.all([
      // Totals
      prisma.project.count(),
      prisma.project.count({ where: { status: "selling" } }),
      prisma.project.count({ where: { status: "sold" } }),
      prisma.user.count({ where: { role: "realtor" } }),
      prisma.project.count({ where: { isapproved: "pending" } }),

      // Weekly comparisons
      prisma.project.count({ where: { createdAt: { gte: lastWeek } } }),
      prisma.project.count({ where: { createdAt: { gte: weekBeforeLast, lt: lastWeek } } }),

      prisma.project.count({
        where: { createdAt: { gte: lastWeek }, status: "selling" },
      }),
      prisma.project.count({
        where: { createdAt: { gte: weekBeforeLast, lt: lastWeek }, status: "selling" },
      }),

      prisma.project.count({
        where: { createdAt: { gte: lastWeek }, status: "sold" },
      }),
      prisma.project.count({
        where: { createdAt: { gte: weekBeforeLast, lt: lastWeek }, status: "sold" },
      }),

      prisma.user.count({
        where: { createdAt: { gte: lastWeek }, role: "realtor" },
      }),
      prisma.user.count({
        where: { createdAt: { gte: weekBeforeLast, lt: lastWeek }, role: "realtor" },
      }),

      prisma.project.count({
        where: { createdAt: { gte: lastWeek }, isapproved: "pending" },
      }),
      prisma.project.count({
        where: { createdAt: { gte: weekBeforeLast, lt: lastWeek }, isapproved: "pending" },
      }),
    ]);

    const getPercentageChange = (current: number, previous: number): number => {
      if (previous === 0 && current === 0) return 0;
      if (previous === 0) return 100;
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

   async getTopRealtors(): Promise<TopRealtorsResponseDto> {
    // Fetch all sold projects to count per user
    const soldProjects = await prisma.project.findMany({
      where: { status: "sold" },
      select: { userId: true },
    });

    const totalSold = soldProjects.length;
    if (totalSold === 0) {
      return { topRealtors: [] };
    }

    // Count sold projects per realtor
    const countMap: Record<string, number> = {};
    soldProjects.forEach((p) => {
      if (p.userId) {
        countMap[p.userId] = (countMap[p.userId] || 0) + 1;
      }
    });

    // Sort by sold count descending and take top 3
    const sorted = Object.entries(countMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    const topUserIds = sorted.map(([id]) => id);

    // Fetch top users
    const users = await prisma.user.findMany({
      where: { id: { in: topUserIds } },
      select: { id: true, fullname: true, avatar: true },
    });

    // Build response
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


private async getRewardSumByType(reason: string | null): Promise<number> {
    const whereClause: Prisma.RewardHistoryWhereInput = reason ? { reason: { equals: reason } } : {};
    const sum = await prisma.rewardHistory.aggregate({
      _sum: { points: true }, 
      where: whereClause,
    });
    return sum._sum.points || 0; 
  }

  async getRewardOverview(): Promise<RewardOverviewDto> {
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

}



