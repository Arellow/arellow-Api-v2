import { Prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ConfirmForgotPasswordDto } from "../dtos/forgetPasswordDto";
import { BadRequestError, InternalServerError, UnAuthorizedError } from "../../../lib/appError";
import { generateToken } from "../../../utils/jwt";

export class ConfirmPasswordService {
  async confirmForgotPassword(dto: ConfirmForgotPasswordDto) {
    const { resetCode, newpassword, confirmPassword } = dto;

    if (!resetCode || !newpassword || !confirmPassword) {
      throw new BadRequestError("Reset code, new password, and confirmation are required");
    }

    if (newpassword.trim() !== confirmPassword.trim()) {
      throw new BadRequestError("New password and confirm password do not match");
    }

    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    // if (!passwordRegex.test(newpassword.trim())) {
    //   throw new BadRequestError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character");
    // }

    const resetPasswordEntries = await Prisma.resetPassword.findMany();

    const resetPassword = await Promise.all(
      resetPasswordEntries.map(async (entry :any) => {
        const match = await bcrypt.compare(resetCode.trim(), entry.resetString);
        return match ? entry : null;
      })
    ).then((results) => results.find((entry :any) => entry !== null));

    if (!resetPassword) {
      throw new UnAuthorizedError("Invalid or expired reset code");
    }

    if (resetPassword.expiresAt < Math.floor(Date.now() / 1000)) {
      await Prisma.resetPassword.deleteMany({ where: { userId: resetPassword.userId } });
      throw new UnAuthorizedError("Reset code expired. Please request a new one.");
    }

    const user = await Prisma.user.findUnique({
      where: { id: resetPassword.userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const hashedPassword = await bcrypt.hash(newpassword.trim(), 10);

    const updatedUser = await Prisma.$transaction(async (prisma:any) => {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      });

      await prisma.resetPassword.deleteMany({
        where: { userId: user.id },
      });

      return prisma.user.findUnique({ where: { id: user.id } });
    });

    if (!updatedUser) {
      throw new InternalServerError("Failed to update password");
    }

   const token= generateToken(updatedUser.id, updatedUser.email);

    const {
      password,
      banner,
      biography,
      role,
      kyc_status,
      nin_status,
      nin_number,
      nin_slip_url,
      cac_status,
      cac_number,
      cac_doc_url,
      face_status,
      face_image_url,
      kyc_verified_at,
      conversationsIds,
      isMessageReadedCounter,
      ...userData
    } = updatedUser;

    return {
      user: userData,
      token,
    };
  }
}
