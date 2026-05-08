import { Response } from "express";
import CustomResponse from "../../../utils/helpers/response.util";
import { generateSessionToken, generateRefreshToken, hashToken } from "../../../utils/jwt";
import { UserResponseDTO } from "../dtos/registerUserDto";
import { Prisma } from "../../../lib/prisma";

export const userResponse = async ({ res, user, message }: { res: Response; user: UserResponseDTO; message: string }) => {
  const accessToken = generateSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    suspended: user.suspended,
    is_verified: user.is_verified,
    fullname: user.fullname,
  });
  const refreshToken = generateRefreshToken(user.id, user.email);

  await Prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: hashToken(refreshToken) },
  });

  const response = {
    id: user.id,
    username: user.username,
    email: user.email,
    phone_number: user.phone_number,
    fullname: user.fullname,
    is_verified: user.is_verified,
    createdAt: user.createdAt,
    avatar: user.avatar,
    role: user.role,
    kyc: user.kyc,
    suspended: user.suspended,
    address: user.address,
    AdminPermission: user?.AdminPermission?.action || [],
  };

  new CustomResponse(200, true, message, res, {
    user: response,
    token: accessToken,
    refreshToken,
  });
};
