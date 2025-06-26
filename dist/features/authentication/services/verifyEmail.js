"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../../lib/prisma");
const appError_1 = require("../../../lib/appError");
class AuthService {
    static async verifyEmail({ token }) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (!decoded?.userId) {
                throw new appError_1.BadRequestError("Invalid or expired token.");
            }
            const user = await prisma_1.Prisma.user.findUnique({
                where: { id: decoded.userId },
            });
            if (!user) {
                throw new appError_1.NotFoundError("User not found.");
            }
            if (user.is_verified) {
                return "Email already verified.";
            }
            await prisma_1.Prisma.user.update({
                where: { id: decoded.userId },
                data: { is_verified: true },
            });
            return "Email successfully verified.";
        }
        catch (err) {
            throw new appError_1.BadRequestError(err.message || "Could not verify email.");
        }
    }
}
exports.AuthService = AuthService;
