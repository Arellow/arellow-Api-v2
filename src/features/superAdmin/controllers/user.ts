
import { Request, Response, NextFunction } from "express";
import { getUsersService } from "../services/user";
import { UserQueryDTO } from "../dtos/user.dto";

export const getUsersController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query: UserQueryDTO = req.query;
    const result = await getUsersService(query);

    res.status(200).json({
      status: "success",
      data: result.users,
      total: result.total,
      page: result.page,
      pages: result.pages,
    });
  } catch (error: any) {
    console.error("User fetch failed", error);
    res.status(500).json({
      status: "failed",
      message: error.message || "Internal server error",
    });
  }
};


