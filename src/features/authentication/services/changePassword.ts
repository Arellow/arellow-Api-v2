import { Prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import { ChangePasswordDto } from "../dtos/changePasswordDto";
import {
  BadRequestError,
  UnAuthorizedError,
  NotFoundError,
} from "../../../lib/appError";

export class ChangePasswordService {
  async changePassword(userId: string, dto: ChangePasswordDto) {
    const {  oldPassword, newPassword, confirmPassword } = dto;

    if ( !oldPassword || !newPassword || !confirmPassword) {
      throw new BadRequestError("Please provide all required fields");
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestError("New password and confirm password do not match");
    }

    if (oldPassword === newPassword) {
      throw new BadRequestError("New password must be different from the old password");
    }

    

    const user = await Prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");  
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new UnAuthorizedError("The old password entered is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return true;
  }
}
