import { Request, Response, NextFunction } from "express";
import { ConfirmForgotPasswordDto } from "../dtos/forgetPasswordDto";
import { ConfirmPasswordService } from "../services/confirmPassword";
import CustomResponse from "../../../utils/helpers/response.util";
import { BadRequestError, UnAuthorizedError } from "../../../lib/appError";

export class ConfirmPasswordController {
  private comfirmPasswordService = new ConfirmPasswordService();

  confirmForgotPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const dto: ConfirmForgotPasswordDto = req.body;

    try {
      const result = await this.comfirmPasswordService.confirmForgotPassword(dto);
      new CustomResponse(
        200,
        true,
        "Password has been reset successfully.",
        res,
        { user: result.user, token: result.token }
      );
    } catch (error: any) {
      if (error.message.includes("expired")) {
        next(new BadRequestError("Reset code has expired"));
      } else if (error.message.includes("not match") || error.message.includes("required")) {
        next(new BadRequestError(error.message));
      } else {
        next(error);
      }
    }
  };
}
