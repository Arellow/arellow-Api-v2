"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfirmPasswordService = void 0;
const prisma_1 = require("../../../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const appError_1 = require("../../../lib/appError");
const jwt_1 = require("../../../utils/jwt");
class ConfirmPasswordService {
    async confirmForgotPassword(dto) {
        const { resetCode, newpassword, confirmPassword } = dto;
        if (!resetCode || !newpassword || !confirmPassword) {
            throw new appError_1.BadRequestError("Reset code, new password, and confirmation are required");
        }
        if (newpassword.trim() !== confirmPassword.trim()) {
            throw new appError_1.BadRequestError("New password and confirm password do not match");
        }
        // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        // if (!passwordRegex.test(newpassword.trim())) {
        //   throw new BadRequestError("Password must be at least 8 characters and include uppercase, lowercase, number, and special character");
        // }
        const resetPasswordEntries = await prisma_1.Prisma.resetPassword.findMany();
        const resetPassword = await Promise.all(resetPasswordEntries.map(async (entry) => {
            const match = await bcryptjs_1.default.compare(resetCode.trim(), entry.resetString);
            return match ? entry : null;
        })).then((results) => results.find((entry) => entry !== null));
        if (!resetPassword) {
            throw new appError_1.UnAuthorizedError("Invalid or expired reset code");
        }
        if (resetPassword.expiresAt < Math.floor(Date.now() / 1000)) {
            await prisma_1.Prisma.resetPassword.deleteMany({ where: { userId: resetPassword.userId } });
            throw new appError_1.UnAuthorizedError("Reset code expired. Please request a new one.");
        }
        const user = await prisma_1.Prisma.user.findUnique({
            where: { id: resetPassword.userId },
        });
        if (!user) {
            throw new Error("User not found");
        }
        const hashedPassword = await bcryptjs_1.default.hash(newpassword.trim(), 10);
        const updatedUser = await prisma_1.Prisma.$transaction(async (prisma) => {
            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword },
            });
            await prisma.resetPassword.deleteMany({
                where: { userId: user.id },
            });
            return prisma.user.findUnique({ where: { id: user.id } });
        });
        if (!updatedUser) {
            throw new appError_1.InternalServerError("Failed to update password");
        }
        const token = (0, jwt_1.generateToken)(updatedUser.id, updatedUser.email);
        const { password, banner, biography, role, kyc_status, nin_status, nin_number, nin_slip_url, cac_status, cac_number, cac_doc_url, face_status, face_image_url, kyc_verified_at, conversationsIds, isMessageReadedCounter, ...userData } = updatedUser;
        return {
            user: userData,
            token,
        };
    }
}
exports.ConfirmPasswordService = ConfirmPasswordService;
