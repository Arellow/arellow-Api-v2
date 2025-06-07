"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePasswordService = void 0;
const prisma_1 = require("../../../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const appError_1 = require("../../../lib/appError");
class ChangePasswordService {
    changePassword(userId, dto) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, oldPassword, newPassword, confirmPassword } = dto;
            if (!email || !oldPassword || !newPassword || !confirmPassword) {
                throw new appError_1.BadRequestError("Please provide all required fields");
            }
            if (newPassword !== confirmPassword) {
                throw new appError_1.BadRequestError("New password and confirm password do not match");
            }
            if (oldPassword === newPassword) {
                throw new appError_1.BadRequestError("New password must be different from the old password");
            }
            const emailLower = email.toLowerCase();
            const user = yield prisma_1.Prisma.user.findUnique({
                where: { email: emailLower },
            });
            if (!user || user.id !== userId) {
                throw new appError_1.UnAuthorizedError("Invalid credentials");
            }
            const isMatch = yield bcryptjs_1.default.compare(oldPassword, user.password);
            if (!isMatch) {
                throw new appError_1.UnAuthorizedError("The old password entered is incorrect");
            }
            const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
            yield prisma_1.Prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });
            return true;
        });
    }
}
exports.ChangePasswordService = ChangePasswordService;
