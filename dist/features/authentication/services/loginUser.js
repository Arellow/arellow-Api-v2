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
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../../../lib/prisma");
const appError_1 = require("../../../lib/appError");
class AuthService {
    static login(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, password }) {
            if (!email || !password) {
                throw new appError_1.BadRequestError("Email and password are required.");
            }
            const user = yield prisma_1.Prisma.user.findUnique({
                where: { email: email.toLowerCase() },
            });
            if (!user)
                throw new appError_1.UnAuthorizedError("Invalid credentials.");
            if (!user.is_verified) {
                throw new appError_1.UnAuthorizedError("Please verify your email before logging in.");
            }
            const passwordMatch = yield bcryptjs_1.default.compare(password, user.password);
            if (!passwordMatch) {
                throw new appError_1.UnAuthorizedError("Invalid credentials.");
            }
            yield prisma_1.Prisma.user.update({
                where: { id: user.id },
                data: { last_login: new Date() },
            });
            const maxAge = 1000 * 60 * 60 * 24 * 7;
            const { password: _, role, banner, biography, kyc_status, nin_status, nin_number, nin_slip_url, cac_status, cac_number, cac_doc_url, face_status, face_image_url, kyc_verified_at, conversationsIds, isMessageReadedCounter } = user, sanitizedUser = __rest(user, ["password", "role", "banner", "biography", "kyc_status", "nin_status", "nin_number", "nin_slip_url", "cac_status", "cac_number", "cac_doc_url", "face_status", "face_image_url", "kyc_verified_at", "conversationsIds", "isMessageReadedCounter"]);
            return {
                user: sanitizedUser,
            };
        });
    }
}
exports.AuthService = AuthService;
