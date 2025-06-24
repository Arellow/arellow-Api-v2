import { Request, Response, NextFunction } from "express";
import { RewardsService } from "../services/rewardDashboard";

const rewardsService = new RewardsService();

// export const getRewardsOverview = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const data = await rewardsService.getRewardsOverview();
//     res.status(200).json({
//       status: "success",
//       data,
//     });
//   } catch (error) {
//     console.error("[getRewardsOverview] error:", error);
//     next(error);
//   }
// };


// export const getRewardDetails = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const userId = req.params.userId 

//   try {
//     const data = await rewardsService.getRewardDetails(userId);
//     res.status(200).json({
//       status: "success",
//       data,
//     });
//   } catch (error) {
//     console.error("[getRewardDetails] error:", error);
//     next(error);
//   }
// };