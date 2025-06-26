"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendVerificationService = void 0;
const prisma_1 = require("../../../lib/prisma");
const appError_1 = require("../../../lib/appError");
const mailer_1 = require("../../../utils/mailer");
const nodemailer_1 = require("../../../utils/nodemailer");
const jwt_1 = require("../../../utils/jwt");
class ResendVerificationService {
    async resendVerification(email) {
        const user = await prisma_1.Prisma.user.findUnique({
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
        const mailOptions = await (0, mailer_1.emailVerificationMailOption)(user.email, verificationUrl);
        await (0, nodemailer_1.nodeMailerController)(mailOptions);
        // Update last verification sent timestamp
        await prisma_1.Prisma.user.update({
            where: { id: user.id },
            data: { createdAt: new Date() },
        });
        return {
            message: "Verification email sent",
            email: user.email,
            expires_in: "24 hours",
        };
    }
}
exports.ResendVerificationService = ResendVerificationService;
