import { Request, Response, NextFunction } from "express";
import { ChangePasswordService } from "../services/changePassword";
import CustomResponse from "../../../utils/helpers/response.util";
import { ChangePasswordDto } from "../dtos/changePasswordDto";

export class UserController {
  private authService = new ChangePasswordService();

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user?.id as string; 
    const dto: ChangePasswordDto = req.body;
    try {
      await this.authService.changePassword(userId, dto);
       new CustomResponse(200, true, "Password changed successfully", res);
       return;
    } catch (error) {
      next(error);
    }
  };
}
