import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/superAdminDashboard";

const dashboardService = new DashboardService();

export const getDashboardSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await dashboardService.getDashboardSummary();
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getTopRealtors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await dashboardService.getTopRealtors();
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    next(error);
  }
};



export const getRewardOverview = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = await dashboardService.getRewardOverview();
    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error : any) {
    console.error("Reward overview error:", error);
    res.status(500).json({
      status: "error",
      message: "Error getting reward overview",
      error: error.message,
    });
  }
};