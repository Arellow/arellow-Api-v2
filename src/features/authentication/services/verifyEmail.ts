
import { VerifyEmailDto } from "../dtos/registerUserDto";
import jwt from "jsonwebtoken";
import { Prisma } from "../../../lib/prisma";
import { BadRequestError, NotFoundError } from "../../../lib/appError";


interface DecodedToken {
  userId: string;
}

export class AuthService {
  static async verifyEmail({ token }: VerifyEmailDto): Promise<string> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;
      if (!decoded?.userId ) {
        throw new BadRequestError("Invalid or expired token.");
      }

      const user = await Prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new NotFoundError("User not found.");
      }

      if (user.is_verified) {
        return "Email already verified.";
      }

      await Prisma.user.update({
        where: { id: decoded.userId },
        data: { is_verified: true },
      });

      return "Email successfully verified.";
    } catch (err: any) {
      throw new BadRequestError(err.message || "Could not verify email.");
    }
  }
}
