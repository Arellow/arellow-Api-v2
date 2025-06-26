"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordService = void 0;
const prisma_1 = require("../../../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const appError_1 = require("../../../lib/appError");
class ChangePasswordService {
    async changePassword(userId, dto) {
        const { oldPassword, newPassword, confirmPassword } = dto;
        if (!oldPassword || !newPassword || !confirmPassword) {
            throw new appError_1.BadRequestError("Please provide all required fields");
        }
        if (newPassword !== confirmPassword) {
            throw new appError_1.BadRequestError("New password and confirm password do not match");
        }
        if (oldPassword === newPassword) {
            throw new appError_1.BadRequestError("New password must be different from the old password");
        }
        const user = await prisma_1.Prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new appError_1.NotFoundError("User not found");
        }
        const isMatch = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            throw new appError_1.UnAuthorizedError("The old password entered is incorrect");
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.Prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        return true;
    }
}
exports.ChangePasswordService = ChangePasswordService;
