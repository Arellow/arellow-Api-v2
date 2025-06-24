
import { Request, Response, NextFunction } from "express";
import { AgentService } from "../services/userDetails";
import { BadRequestError } from "../../../lib/appError";
import CustomResponse from "../../../utils/helpers/response.util";

const agentService = new AgentService();

export const userDetail = async (
  req: Request<{ userId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.userId 
  if (!userId) {
    throw new BadRequestError("User not authenticated");
  }

  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || 3);

  try {
    // const data = await agentService.getAgentDetail(userId, page, limit);
    //  new CustomResponse(
    //   200,
    //   true,
    //    "Agent details fetched successfully",
    //   res,
    //   data,
    // );
  } catch (error) {
    next(error);
  }
};