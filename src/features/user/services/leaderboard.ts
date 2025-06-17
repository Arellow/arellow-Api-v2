
import { PrismaClient, Prisma } from "@prisma/client";
import { InternalServerError } from "../../../lib/appError";
import { LeaderboardResponse, RealtorStats } from "../dtos/user.dto";

// Extend Prisma types to include project relations
type UserWithProjects = Prisma.UserGetPayload<{
  include: { projects: true };
}>;

const prisma = new PrismaClient();

export const getTopRealtorsLeaderboard = async (): Promise<LeaderboardResponse> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        projects: true,
      },
    }) as UserWithProjects[];

    // Define date variables at the top level
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Helper function to determine trend
    const getTrend = (current: number, previous: number): "Rising" | "Falling" | "Steady" => {
      if (current > previous) return "Rising";
      if (current < previous) return "Falling";
      return "Steady";
    };

    // Calculate stats for each user
    const realtorStats = await Promise.all(
      users.map(async (user) => {
        // Deals closed = sold projects
        const soldProjects = user.projects.filter((p: typeof user.projects[number]) => p.status === "sold");
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
        } as RealtorStats;
      })
    );

    // Sort by earnings descending, take top 5
    const topRealtors = realtorStats
      .filter((r) => r.dealsClosed > 0)
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);

    // Top performer this month (highest earnings this month)
    const topPerformer = topRealtors.reduce((best, realtor) => {
      const user = users.find((u) => u.id === realtor.id);
      if (!user) return best;

      const monthEarnings = user.projects
        .filter((p: typeof user.projects[number]) => p.status === "sold" && new Date(p.createdAt) >= thisMonth)
        .reduce((sum, p) => sum + (p.price || 0), 0);
      if (!best || monthEarnings > (best.monthEarnings || 0)) {
        const performer = { ...realtor, monthEarnings } as RealtorStats & { monthEarnings: number };
        return performer;
      }
      return best;
    }, null as (RealtorStats & { monthEarnings: number }) | null);

    return {
      topPerformer: topPerformer ? { ...topPerformer } : null,
      leaderboard: topRealtors,
    };
  } catch (error) {
    console.error("[getTopRealtorsLeaderboard] Error:", error);
    throw new InternalServerError("Failed to fetch leaderboard.");
  }
};