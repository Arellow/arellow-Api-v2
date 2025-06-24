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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendVerificationService = void 0;
const prisma_1 = require("../../../lib/prisma");
const appError_1 = require("../../../lib/appError");
const mailer_1 = require("../../../utils/mailer");
const nodemailer_1 = require("../../../utils/nodemailer");
const jwt_1 = require("../../../utils/jwt");
class ResendVerificationService {
    resendVerification(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.Prisma.user.findUnique({
                where: { email: email.toLowerCase() },
                select: {
                    id: true,
                    email: true,
                    is_verified: true,
                },
            });
            if (!user) {
                throw new appError_1.UnAuthorizedError("User not found");
            }
            if (user.is_verified) {
                throw new appError_1.BadRequestError("Email is already verified");
            }
            const verificationToken = (0, jwt_1.generateToken)(user.id, user.email);
            const verificationUrl = `${process.env.FRONTEND_URL_LOCAL}/verify-email?token=${verificationToken}`;
            const mailOptions = yield (0, mailer_1.emailVerificationMailOption)(user.email, verificationUrl);
            yield (0, nodemailer_1.nodeMailerController)(mailOptions);
            // Update last verification sent timestamp
            yield prisma_1.Prisma.user.update({
                where: { id: user.id },
                data: { createdAt: new Date() },
            });
            return {
                message: "Verification email sent",
                email: user.email,
                expires_in: "24 hours",
            };
        });
    }
}
exports.ResendVerificationService = ResendVerificationService;
