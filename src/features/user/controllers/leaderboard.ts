
import { Request, Response, NextFunction } from "express";
import { InternalServerError } from "../../../lib/appError";
import { getTopRealtorsLeaderboard } from "../services/leaderboard";
import CustomResponse from "../../../utils/helpers/response.util";

export const getRealtorsLeaderboard= async (
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
    const leaderboard = await getTopRealtorsLeaderboard();
    new CustomResponse(200, true, "Top 5 earning realtors leaderboard", res, leaderboard);
  } catch (error) {
    console.error("Leaderboard fetch error:", error);
    next(new InternalServerError("Failed to fetch leaderboard."));
  }
};