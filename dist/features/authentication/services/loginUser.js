"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../../lib/prisma");
const appError_1 = require("../../../lib/appError");
class AuthService {
    static async login({ email, password }) {
        if (!email || !password) {
            throw new appError_1.BadRequestError("Email and password are required.");
        }
        const user = await prisma_1.Prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user)
            throw new appError_1.UnAuthorizedError("Invalid credentials.");
        if (!user.is_verified) {
            throw new appError_1.UnAuthorizedError("Please verify your email before logging in.");
        }
        const passwordMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!passwordMatch) {
            throw new appError_1.UnAuthorizedError("Invalid credentials.");
        }
        await prisma_1.Prisma.user.update({
            where: { id: user.id },
            data: { last_login: new Date() },
        });
        const maxAge = 1000 * 60 * 60 * 24 * 7;
        const { password: _, role, ...sanitizedUser } = user;
        return {
            user: sanitizedUser,
        };
    }
}
exports.AuthService = AuthService;
