import { Request, Response, NextFunction } from "express";
import { CampaignAnalyticsService } from "../services/campaignDashboard";
import { InternalServerError } from "../../../lib/appError";
import CustomResponse from "../../../utils/helpers/response.util";

const campaignAnalyticsService = new CampaignAnalyticsService();

export const getAnalytics = async (
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
    const analytics = await campaignAnalyticsService.getAnalytics();
    new CustomResponse(200, true, "Analytics fetched successfully", res, analytics);
  } catch (error) {
    console.error("Analytics fetch error:", error);
    next(new InternalServerError("Failed to fetch campaign analytics."));
  }
};