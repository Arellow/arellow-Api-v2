
import { LoginDto } from "../dtos/loginUserDto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma } from "../../../lib/prisma";
import { BadRequestError, UnAuthorizedError } from "../../../lib/appError";
import { generateRefreshToken, generateToken } from "../../../utils/jwt";

export class AuthService {
  static async login({ email, password }: LoginDto) {
    if (!email || !password) {
      throw new BadRequestError("Email and password are required.");
    }

    const user = await Prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) throw new UnAuthorizedError("Invalid credentials.");
    if (!user.is_verified) {
      throw new UnAuthorizedError("Please verify your email before logging in.");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnAuthorizedError("Invalid credentials.");
    }

    await Prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    const maxAge = 1000 * 60 * 60 * 24 * 7;
    const {
      password: _,
      role,
      banner,
      biography,
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
      ...sanitizedUser
    } = user;

    return {
      user: sanitizedUser,
    };
  }
}
