import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/verifyEmail";
import { VerifyEmailDto } from "../dtos/registerUserDto";
import CustomResponse from "../../../utils/helpers/response.util";
import { BadRequestError } from "../../../lib/appError";

export class VerifyController {
  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.query;

      if (!token || typeof token !== "string") {
        throw new BadRequestError("Verification token is required.");
      }

      const dto: VerifyEmailDto = { token };
      const message = await AuthService.verifyEmail(dto);

      new CustomResponse(200, true, message, res);
    } catch (error) {
      next(error);
    }
  }
}
