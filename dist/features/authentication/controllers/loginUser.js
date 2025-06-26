"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginController = void 0;
const loginUser_1 = require("../services/loginUser");
const appError_1 = require("../../../lib/appError");
const trim_1 = require("../../../utils/trim");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const jwt_1 = require("../../../utils/jwt");
class LoginController {
    static async login(req, res, next) {
        try {
            (0, trim_1.trimObjectKeys)(req.body);
        }
        catch (err) {
            console.error("Trim keys failed:", err);
            throw new appError_1.BadRequestError("Failed to sanitize input keys");
        }
        try {
            const { email, password } = req.body;
            if (typeof email !== "string" || typeof password !== "string") {
                throw new appError_1.BadRequestError("Invalid input. Email and password must be strings.");
            }
            const loginDto = { email, password };
            const { user } = await loginUser_1.AuthService.login(loginDto);
            const token = (0, jwt_1.generateToken)(user.id, user.email);
            const refreshToken = (0, jwt_1.generateRefreshToken)(user.id, user.email);
            res.setHeader("Authorization", `Bearer ${token}`);
            res.setHeader("x-refresh-token", refreshToken);
            new response_util_1.default(200, true, "Login successful", res, {
                user,
                token,
                message: "Use this token in the Authorization header as: Bearer <token>",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.LoginController = LoginController;
