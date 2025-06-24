import { Request, Response, NextFunction } from "express";
import { RewardService } from "../services/reward";

const rewardService = new RewardService();

// export const withdrawReward = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const { pointToWithdraw, bankAccountName, bankAccountNumber, bankName } = req.body;
//   const userId = req.user?.id as string; 

//   try {
//     const data = await rewardService.withdrawReward(
//       userId,
//       Number(pointToWithdraw),
//       bankAccountName,
//       bankAccountNumber,
//       bankName
//     );
//     res.status(200).json({
//       status: "success",
//       data,
//     });
//   } catch (error) {
//     console.error("[withdrawReward] Unexpected error:", error);
//     next(error);
//   }
// };

// export const getUserEarnings = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const userId = req.user?.id as string; 

//   try {
//     const data = await rewardService.getUserEarnings(userId);
//     res.status(200).json({
//       status: "success",
//       data,
//     });
//   } catch (error) {
//     console.error("[getUserEarnings] error:", error);
//     next(error);
//   }
// };