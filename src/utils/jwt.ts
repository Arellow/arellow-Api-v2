import jwt from "jsonwebtoken";
import crypto from "crypto";
require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET as string;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET as string;

// Verification-only token (email verify, password reset links) — minimal payload
export const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, jwtSecret, { expiresIn: "15m" });
};

export type SessionPayload = {
  userId: string;
  email: string;
  role: string;
  suspended: boolean;
  is_verified: boolean;
  fullname: string;
};

// Session token — carries enough to skip a DB lookup on every request
export const generateSessionToken = (payload: SessionPayload): string => {
  return jwt.sign(payload, jwtSecret, { expiresIn: "1d" });
};

export const generateRefreshToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, jwtRefreshSecret, { expiresIn: "30d" });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, jwtSecret);
};

export const verifyRefreshToken = (token: string): any => {
  return jwt.verify(token, jwtRefreshSecret);
};

export const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
