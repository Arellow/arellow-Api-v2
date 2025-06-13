import { formatDistanceToNow ,format} from "date-fns";
import { Prisma } from "../../../lib/prisma";
import { ActivityHistoryDto, RewardDetailsDto, RewardDetailsResponseDto, RewardsResponseDto, RewardsSummaryDto, WithdrawalRequestDto } from "../dtos/reward.dto";
import {  NotFoundError } from "../../../lib/appError";

export class RewardsService {
  async getRewardsOverview(): Promise<RewardsResponseDto> {
    
    const totalRewards = await Prisma.rewardHistory.aggregate({
      _sum: { points: true },
      where: { points: { gt: 0 } },
    }).then((sum) => sum._sum.points || 0);

    // Fetch count of withdrawal requests
    const withdrawalRequests = await Prisma.rewardWithdrawal.count({
      where: { status: "pending" },
    });

    // Fetch earnings (sum of points by reason)
    const earnings = await Prisma.rewardHistory.groupBy({
      by: ["reason"],
      _sum: { points: true },
      where: { points: { gt: 0 }, reason: { in: ["upload", "sold"] } },
    }).then((results) => {
      const data = results.reduce(
        (acc, { reason, _sum }) => {
          if (reason === "upload") acc.uploaded = _sum.points || 0;
          if (reason === "sold") acc.sold = _sum.points || 0;
          return acc;
        },
        { total: 0, uploaded: 0, sold: 0 }
      );
      data.total = data.uploaded + data.sold;
      return data;
    });

    // Fetch withdrawal requests
    const rawRequests = await Prisma.rewardWithdrawal.findMany({
      where: { status: "pending" },
      include: { user: { select: { fullname: true } } },
    });

    const withdrawalRequestsList: WithdrawalRequestDto[] = rawRequests.map((req) => ({
      userName: req.user?.fullname || "Unknown",
      points: req.points,
      bankAccountName: req.bankAccountName,
      bankName: req.bankName,
      bankAccountNumber: req.bankAccountNumber,
      status: req.status,
     
    }));

    const summary: RewardsSummaryDto = {
      totalRewards,
      withdrawalRequests,
      earnings,
    };

    return { summary, withdrawalRequests: withdrawalRequestsList };
  }


 async getRewardDetails(userId: string): Promise<RewardDetailsResponseDto> {
    // Fetch total points earned (sum of positive points)
    const totalPointsEarned = await Prisma.rewardHistory.aggregate({
      _sum: { points: true },
      where: { userId, points: { gt: 0 }},
    }).then((sum) => sum._sum.points || 0);

    // Fetch withdrawn points (sum of negative points or points marked as withdrawal)
    const withdrawnPoints = await Prisma.rewardHistory.aggregate({
      _sum: { points: true },
      where: { userId, reason: { equals: "Withdrawal" } },
    }).then((sum) => Math.abs(sum._sum.points || 0)); // Absolute value since points are negative

    // Fetch user details
    const user = await Prisma.user.findUnique({
      where: { id: userId },
      select: {
        fullname: true,
        email: true,
        phone_number: true,
        is_verified: true,
        last_login: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const rewardDetails: RewardDetailsDto = {
      userName: user.fullname || "Unknown",
      email: user.email || "",
      phone: user.phone_number || "",
      is_verified: user.is_verified || false,
      lastLogin: user.last_login ? formatDistanceToNow(user.last_login, { addSuffix: true }) : "Never",
    };

    // Fetch activity history from rewardHistory
    const history = await Prisma.rewardHistory.findMany({
      where: { userId },
      select: {
        points: true,
        reason: true,
        createdAt: true,
        project: {
          select: { title: true }, 
        },
      },
    });

    const activityHistory: ActivityHistoryDto[] = history.map((entry) => {
      const uploadPoints = entry.reason.toLowerCase().includes("upload") ? entry.points : 0;
      const soldPoints = entry.reason.toLowerCase().includes("sold") ? entry.points : 0;
      const totalPoints = uploadPoints + soldPoints;
      const property = entry.project?.title || "N/A";
      const date = format(entry.createdAt, "MMM dd, yyyy, hh:mm a");

      return {
        uploadPoints,
        soldPoints,
        totalPoints,
        property,
        date,
      };
    });

    return {
      totalPointsEarned,
      withdrawnPoints,
      rewardDetails,
      activityHistory,
    };
  }

}