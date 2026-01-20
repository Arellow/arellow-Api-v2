import { Prisma } from "../../../lib/prisma";
import { BadRequestError, UnAuthorizedError } from "../../../lib/appError";
import { emailVerificationMailOption } from "../../../utils/mailer";
import { mailController } from "../../../utils/nodemailer";
import { generateToken } from "../../../utils/jwt";

export class ResendVerificationService {

  async resendVerification(email: string) {
    const user = await Prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        is_verified: true,
      },
    });

    if (!user) {
      throw new UnAuthorizedError("User not found");
    }

    if (user.is_verified) {
      throw new BadRequestError("Email is already verified");
    }


    const verificationToken = generateToken(user.id, user.email);

  const verificationUrl = `https://arellow.com/authentication/verify-email/${verificationToken}`;
    const mailOptions = await emailVerificationMailOption(
      user.email,
      verificationUrl
    );
   
     mailController({from: "noreply@arellow.com", ...mailOptions})
    
    // Update last verification sent timestamp
    await Prisma.user.update({
      where: { id: user.id },
      data: { createdAt: new Date() },
    });

    return {
      message: "Verification email sent",
      email: user.email,
      expires_in: "24 hours",
    };
  }
}
