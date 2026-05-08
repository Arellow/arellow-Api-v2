import { Request, Response, NextFunction } from "express";
import { verifyRefreshToken, generateSessionToken, generateRefreshToken, hashToken } from "../../../utils/jwt";
import { Prisma } from "../../../lib/prisma";
import CustomResponse from "../../../utils/helpers/response.util";

export class RefreshTokenController {
  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({ success: false, message: "Refresh token required" });
      }

      let decoded: any;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch {
        return res.status(401).json({ success: false, message: "Invalid or expired refresh token" });
      }

      const user = await Prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user || !user.refreshToken) {
        return res.status(401).json({ success: false, message: "Session expired, please login again" });
      }

      if (user.refreshToken !== hashToken(refreshToken)) {
        // Token reuse detected — invalidate all sessions
        await Prisma.user.update({ where: { id: user.id }, data: { refreshToken: null } });
        return res.status(401).json({ success: false, message: "Token reuse detected, please login again" });
      }

      // Rotate: issue new access + refresh token
      const newAccessToken = generateSessionToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        suspended: user.suspended,
        is_verified: user.is_verified,
        fullname: user.fullname,
      });
      const newRefreshToken = generateRefreshToken(user.id, user.email);

      await Prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: hashToken(newRefreshToken) },
      });

      new CustomResponse(200, true, "Token refreshed", res, {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      next(error);
    }
  }
}
