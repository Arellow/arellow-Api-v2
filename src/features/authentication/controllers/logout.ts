import { Request, Response, NextFunction } from "express";
import CustomResponse from "../../../utils/helpers/response.util";

export class LogoutController {
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Clear the login cookie
      res.clearCookie("login", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: true,
      });

      new CustomResponse(
        200,
        true,
        "Logged out successfully",
        res,
        {}
      );

    } catch (error) {
      next(error);
    }
  }
}
