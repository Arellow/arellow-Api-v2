import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard"
import { InternalServerError } from "../../../lib/appError";
import { ListedPropertiesPaginationDto } from "../dtos/dashboard.dto";
import CustomResponse from "../../../utils/helpers/response.util";
const dashboardService = new DashboardService();

export const getAdminDashboardSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id as string;

  if (!userId) {
     res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return
  }

  try {
    const summary = await dashboardService.getAdminDashboardSummary(userId);
    new CustomResponse(200, true, "Dashboard summary fetched successfully", res, summary);
  } catch (error) {
    next(new InternalServerError("Failed to fetch dashboard summary."));
  }
};

export const getAdminDashboardRewards = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id as string;

  if (!userId) {
     res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return
  }

  try {
    const rewards = await dashboardService.getAdminDashboardRewards(userId);
    new CustomResponse(200, true, "Dashboard rewards fetched successfully", res, rewards);
  } catch (error) {
    next(new InternalServerError("Failed to fetch dashboard rewards."));
  }
};

export const getAdminDashboardProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id as string;

  if (!userId) {
     res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return;
  }

  try {
    const properties = await dashboardService.getAdminDashboardProperties(userId);
    new CustomResponse(200, true, "Dashboard properties fetched successfully", res, properties);
  } catch (error) {
    next(new InternalServerError("Failed to fetch dashboard properties."));
  }
};

export const getAdminDashboardEarningHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id as string;

  if (!userId) {
     res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return
  }

  try {
    const history = await dashboardService.getAdminDashboardEarningHistory(userId);
 new CustomResponse(200, true, "Dashboard earning history fetched successfully", res, history);
} catch (error) {
    next(new InternalServerError("Failed to fetch dashboard earning history."));
  }
};



export const getListedProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
):Promise<void> => {
  const userId = req.user?.id as string;

  if (!userId) {
     res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return;
  }

  try {
    const pagination: ListedPropertiesPaginationDto = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    };
    const properties = await dashboardService.getListedProperties(userId, pagination);
    res.status(200).json({ status: "success", data: properties });
    return;
  } catch (error) {
    next(new InternalServerError("Failed to fetch listed properties."));
  }
};