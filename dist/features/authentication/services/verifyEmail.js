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
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../../lib/prisma");
const appError_1 = require("../../../lib/appError");
class AuthService {
    static verifyEmail(_a) {
        return __awaiter(this, arguments, void 0, function* ({ token }) {
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY);
                if (!(decoded === null || decoded === void 0 ? void 0 : decoded.id)) {
                    throw new appError_1.BadRequestError("Invalid or expired token.");
                }
                const user = yield prisma_1.Prisma.user.findUnique({
                    where: { id: decoded.id },
                });
                if (!user) {
                    throw new appError_1.NotFoundError("User not found.");
                }
                if (user.is_verified) {
                    return "Email already verified.";
                }
                yield prisma_1.Prisma.user.update({
                    where: { id: decoded.id },
                    data: { is_verified: true },
                });
                return "Email successfully verified.";
            }
            catch (err) {
                throw new appError_1.BadRequestError(err.message || "Could not verify email.");
            }
        });
    }
}
exports.AuthService = AuthService;
