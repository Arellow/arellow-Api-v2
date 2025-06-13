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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
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
    confirmForgotPassword(dto) {
        return __awaiter(this, void 0, void 0, function* () {
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
            const resetPasswordEntries = yield prisma_1.Prisma.resetPassword.findMany();
            const resetPassword = yield Promise.all(resetPasswordEntries.map((entry) => __awaiter(this, void 0, void 0, function* () {
                const match = yield bcryptjs_1.default.compare(resetCode.trim(), entry.resetString);
                return match ? entry : null;
            }))).then((results) => results.find((entry) => entry !== null));
            if (!resetPassword) {
                throw new appError_1.UnAuthorizedError("Invalid or expired reset code");
            }
            if (resetPassword.expiresAt < Math.floor(Date.now() / 1000)) {
                yield prisma_1.Prisma.resetPassword.deleteMany({ where: { userId: resetPassword.userId } });
                throw new appError_1.UnAuthorizedError("Reset code expired. Please request a new one.");
            }
            const user = yield prisma_1.Prisma.user.findUnique({
                where: { id: resetPassword.userId },
            });
            if (!user) {
                throw new Error("User not found");
            }
            const hashedPassword = yield bcryptjs_1.default.hash(newpassword.trim(), 10);
            const updatedUser = yield prisma_1.Prisma.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                yield prisma.user.update({
                    where: { id: user.id },
                    data: { password: hashedPassword },
                });
                yield prisma.resetPassword.deleteMany({
                    where: { userId: user.id },
                });
                return prisma.user.findUnique({ where: { id: user.id } });
            }));
            if (!updatedUser) {
                throw new appError_1.InternalServerError("Failed to update password");
            }
            const token = (0, jwt_1.generateToken)(updatedUser.id, updatedUser.email);
            const { password, banner, biography, role, kyc_status, nin_status, nin_number, nin_slip_url, cac_status, cac_number, cac_doc_url, face_status, face_image_url, kyc_verified_at, conversationsIds, isMessageReadedCounter } = updatedUser, userData = __rest(updatedUser, ["password", "banner", "biography", "role", "kyc_status", "nin_status", "nin_number", "nin_slip_url", "cac_status", "cac_number", "cac_doc_url", "face_status", "face_image_url", "kyc_verified_at", "conversationsIds", "isMessageReadedCounter"]);
            return {
                user: userData,
                token,
            };
        });
    }
}
exports.ConfirmPasswordService = ConfirmPasswordService;
