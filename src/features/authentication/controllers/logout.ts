import { Request, Response, NextFunction } from "express";
import CustomResponse from "../../../utils/helpers/response.util";
import { Prisma } from "../../../lib/prisma";

export class LogoutController {
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await Prisma.user.update({
        where: { id: req.user!.id },
        data: { refreshToken: null },
      });

      new CustomResponse(200, true, "Logged out successfully", res, {});
    } catch (error) {
      next(error);
    }
  }
}
