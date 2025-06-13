import { Prisma } from "../../../lib/prisma";
import { ForgetPasswordDto } from "../dtos/forgetPasswordDto";
import bcrypt from "bcryptjs";
import {
  BadRequestError,
  InternalServerError,
  UnAuthorizedError,
} from "../../../lib/appError";
import { sendForgetPasswordMailOption } from "../../../utils/mailer";
import { nodeMailerController } from "../../../utils/nodemailer";

export class ForgetPasswordService {
  async forgetPassword(dto: ForgetPasswordDto) {
    const { email, isMobile } = dto;

    if (!email) {
      throw new BadRequestError("Enter your email");
    }

    const emailLowerCase = email.toLowerCase();
    const user = await Prisma.user.findUnique({
      where: { email: emailLowerCase },
    });

    if (!user) {
      throw new UnAuthorizedError("Invalid credentials, please register");
    }

    const generatePin = () =>
      Math.floor(1000 + Math.random() * 9000).toString();

    const resetCode = generatePin();
    const hashedResetCode = await bcrypt.hash(resetCode, 12);

    // Delete old reset entries for this user
    await Prisma.resetPassword.deleteMany({
      where: { userId: user.id },
    });

    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(now.getDate() + 1);

    const resetEntry = await Prisma.resetPassword.create({
      data: {
        userId: user.id,
        resetString: hashedResetCode,
        createdAt: Math.floor(now.getTime() / 1000),
        expiresAt: Math.floor(expiresAt.getTime() / 1000),
      },
    });

    if (!resetEntry) {
      throw new InternalServerError("Server error, please try again");
    }

    const mailOption = await sendForgetPasswordMailOption(user, resetCode);
    await nodeMailerController(mailOption);

    return {
      resetSent: true,
      ...(isMobile && { resetCode }),
    };
  }
}
