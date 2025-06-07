import { Request, Response, NextFunction } from "express";
import { ResendVerificationService } from "../services/resendVerification";
import CustomResponse from "../../../utils/helpers/response.util";
import { BadRequestError } from "../../../lib/appError";

export class ResendVerificationController {
  private resendVerificationService = new ResendVerificationService();

  resendVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.email) {
        throw new BadRequestError("User email not found");
      }

      const result = await this.resendVerificationService.resendVerification(req.user.email);
      new CustomResponse(
        200,
        true,
        "Verification email sent successfully",
        res,
        result
      );
    } catch (error) {
      next(error);
    }
  };
}
