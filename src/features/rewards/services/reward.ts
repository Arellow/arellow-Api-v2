import { BadRequestError, InternalServerError } from "../../../lib/appError";
import { Prisma } from "../../../lib/prisma";
// import {
//   WithdrawRewardResponseDto,
//   UserEarningsDto,
//   EarningHistoryEntry,
// } from "../dtos/reward.dto";
// import { format } from "date-fns";

// export class RewardService {
//   async withdrawReward(
//     userId: string,
//     pointToWithdraw: number,
//     bankAccountName: string,
//     bankAccountNumber: string,
//     bankName: string
//   ): Promise<WithdrawRewardResponseDto> {
//     // Validate required fields
//     if (
//       !pointToWithdraw ||
//       !bankAccountName ||
//       !bankAccountNumber ||
//       !bankName
//     ) {
//       throw new BadRequestError(
//         "pointToWithdraw, bankAccountName, bankAccountNumber and bankName are all required."
//       );
//     }

//     // Validate point amount
//     if (isNaN(pointToWithdraw)) {
//       throw new BadRequestError("pointToWithdraw must be a valid number.");
//     }
//     if (pointToWithdraw < 100) {
//       throw new BadRequestError("Minimum withdrawal amount is 100 points.");
//     }

//     // Fetch user
//     let user;
//     try {
//       user = await Prisma.user.findUnique({ where: { id: userId } });
//     } catch (dbErr) {
//       console.error("[withdrawReward] Prisma error on findUnique:", dbErr);
//       throw new BadRequestError("Database error when fetching user.");
//     }
//     if (!user) {
//       throw new BadRequestError("User not found.");
//     }

//     // Check balance
//     const currentPoints = user.points || 0;
//     if (currentPoints < pointToWithdraw) {
//       throw new BadRequestError("Insufficient reward points.");
//     }

//     // Decrement user points
//     try {
//       await Prisma.user.update({
//         where: { id: userId },
//         data: { points: { decrement: pointToWithdraw } },
//       });
//     } catch (updateErr) {
//       console.error("[withdrawReward] Prisma error on update:", updateErr);
//       throw new BadRequestError("Database error when updating user points.");
//     }

//     // Log to rewardHistory
//     try {
//       await Prisma.rewardHistory.create({
//         data: {
//           userId,
//           reason: "Withdrawal",
//           description: `Withdrew ${pointToWithdraw} points`,
//           points: -pointToWithdraw,
//           propertyId: "Unknown",
//         },
//       });
//     } catch (histErr) {
//       console.error(
//         "[withdrawReward] Prisma error on rewardHistory.create:",
//         histErr
//       );
//       throw new BadRequestError(
//         "Database error when logging withdrawal history."
//       );
//     }

//     // Create withdrawal request record
//     try {
//       await Prisma.rewardWithdrawal.create({
//         data: {
//           userId,
//           points: pointToWithdraw,
//           bankAccountName,
//           bankAccountNumber,
//           bankName,
//           status: "pending",
//         },
//       });
//     } catch (wdErr) {
//       console.error(
//         "[withdrawReward] Prisma error on rewardWithdrawal.create:",
//         wdErr
//       );
//       throw new BadRequestError(
//         "Database error when creating withdrawal request."
//       );
//     }

//     return { message: "Withdrawal request submitted." };
//   }

//   async getUserEarnings(userId: string): Promise<UserEarningsDto> {
//     const NAIRA_PER_POINT = 50;

//     // Fetch all reward history for the user
//     const history = await Prisma.rewardHistory.findMany({
//       where: { userId },
//       orderBy: { createdAt: "desc" },
//       select: { points: true, reason: true, createdAt: true },
//     });

//     let uploadedPoints = 0;
//     let soldPoints = 0;

//     const earningHistory: EarningHistoryEntry[] = history.map((entry) => {
//       const lowerReason = entry.reason.toLowerCase();
//       let points = entry.points;
//       let type: "earned" | "used";
//       let description: string;

//       if (lowerReason.includes("upload")) {
//         uploadedPoints += points;
//         type = "earned";
//         description = "ArellowPoints Earned";
//       } else if (lowerReason.includes("sold")) {
//         soldPoints += points;
//         type = "earned";
//         description = "ArellowPoints Earned";
//       } else if (
//         lowerReason.includes("withdrawal") ||
//         lowerReason.includes("used")
//       ) {
//         points = -points; // Convert to negative for used points
//         type = "used";
//         description = "ArellowPoints Used";
//       } else {
//         type = "earned";
//         description = "ArellowPoints Earned";
//       }

//       return {
//         type,
//         description,
//         date: format(entry.createdAt, "MMMM dd, yyyy, hh:mm a"),
//         points,
//         editable: history.length === 1,
//       };
//     });

//     const totalPoints = uploadedPoints + soldPoints;

//     const uploadedNaira = uploadedPoints * NAIRA_PER_POINT;
//     const soldNaira = soldPoints * NAIRA_PER_POINT;
//     const totalNaira = totalPoints * NAIRA_PER_POINT;

//     return {
//       points: {
//         total: totalPoints,
//         uploaded: uploadedPoints,
//         sold: soldPoints,
//       },
//       naira: {
//         total: totalNaira,
//         uploaded: uploadedNaira,
//         sold: soldNaira,
//       },
//       history: earningHistory,
//     };
//   }
// }
