import jwt from "jsonwebtoken";
require("dotenv").config();

const jwtSecret = process.env.JWT_SECRET as string;

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, jwtSecret, { expiresIn: "7d" });
};

export const generateRefreshToken = (userId: string, email: string): string => {
  return jwt.sign({ userId, email }, jwtSecret, { expiresIn: "7d" });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, jwtSecret);
};
