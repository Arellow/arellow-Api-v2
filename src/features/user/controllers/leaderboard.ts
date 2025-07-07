
import { Request, Response, NextFunction } from "express";
import { InternalServerError } from "../../../lib/appError";
import { getTopRealtorsLeaderboard } from "../services/leaderboard";
import CustomResponse from "../../../utils/helpers/response.util";

export const getRealtorsLeaderboard= async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  try {
    const leaderboard = await getTopRealtorsLeaderboard();
    new CustomResponse(200, true, "Top 5 earning realtors leaderboard", res, leaderboard);
  } catch (error) {
    next(new InternalServerError("Failed to fetch leaderboard."));
  }
};