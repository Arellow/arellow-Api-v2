import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/superAdminDashboard";
import CustomResponse from "../../../utils/helpers/response.util"
const dashboardService = new DashboardService();

// export const getDashboardSummary = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const data = await dashboardService.getDashboardSummary();
//     new CustomResponse(200, true, "successfully fetched", res,data)
//   } catch (error) {
//     next(error);
//   }
// };

// export const getTopRealtors = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const data = await dashboardService.getTopRealtors();
//     new CustomResponse(200, true, "success",res, data)
//   } catch (error) {
//     next(error);
//   }
// };

// export const getRewardOverview = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const data = await dashboardService.getRewardOverview();
//     new CustomResponse(200, true, "success", res, data)
//   } catch (error: any) {
//     console.error("Reward overview error:", error);
//     res.status(500).json({
//       status: "error",
//       message: "Error getting reward overview",
//       error: error.message,
//     });
//   }
// };

// export const getRecentListings = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const data = await dashboardService.getRecentListings();
//     new CustomResponse(200, true, "success",res, data)
//   } catch (error) {
//     next(error);
//   }
// };

// export const performQuickAction = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { action, projectId } = req.body;
//     const data = await dashboardService.performQuickAction(action, projectId);
//     new CustomResponse(200, true, "success",res, data)
//   } catch (error) {
//     next(error);
//   }
// };