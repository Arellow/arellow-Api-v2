"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../../../lib/prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const appError_1 = require("../../../lib/appError");
const mailer_1 = require("../../../utils/mailer");
const nodemailer_1 = require("../../../utils/nodemailer");
const jwt_1 = require("../../../utils/jwt");
class AuthService {
    static async registerUser(dto) {
        const { username, password, email, phone_number, fullname } = dto;
        const emailLower = email.toLowerCase();
        const existingUser = await prisma_1.Prisma.user.findUnique({
            where: { email: emailLower },
        });
        if (existingUser) {
            throw new appError_1.DuplicateError("Email already exists.");
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = await prisma_1.Prisma.user.create({
            data: {
                username,
                email: emailLower,
                password: hashedPassword,
                phone_number,
                role: "REALTOR",
                fullname,
                is_verified: false,
                avatar: "https://img.freepik.com/premium-vector/male-face-avatar-icon-set-flat-design-social-media-profiles_1281173-3806.jpg?w=740"
            },
        });
        const verificationToken = (0, jwt_1.generateToken)(newUser.id, newUser.email);
        const verificationUrl = `${process.env.FRONTEND_URL_LOCAL}/verify-email?token=${verificationToken}`;
        const mailOptions = await (0, mailer_1.emailVerificationMailOption)(newUser.email, verificationUrl);
        await (0, nodemailer_1.nodeMailerController)(mailOptions);
        return {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            phone_number: newUser.phone_number,
            fullname: newUser.fullname,
            is_verified: newUser.is_verified,
            createdAt: newUser.createdAt,
            avatar: newUser.avatar
        };
    }
}
exports.AuthService = AuthService;
