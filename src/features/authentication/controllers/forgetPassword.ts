import { Request, Response, NextFunction } from "express";
import CustomResponse from "../../../utils/helpers/response.util";
import { ForgetPasswordDto } from "../dtos/forgetPasswordDto";
import { ForgetPasswordService } from "../services/forgetPassword";

export class ForgetPasswordController {
  private forgetPasswordService = new ForgetPasswordService();

  forgetPassword = async (req: Request, res: Response, next: NextFunction) => {
  
    try {
      const dto: ForgetPasswordDto = req.body;
      const result = await this.forgetPasswordService.forgetPassword(dto);
      new CustomResponse(
        200,
        true,
        "Password reset code sent successfully",
        res,
        result
      );
    } catch (error) {
      next(error);
    }
  };
}
