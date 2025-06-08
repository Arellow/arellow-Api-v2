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
exports.LoginController = void 0;
const loginUser_1 = require("../services/loginUser");
const appError_1 = require("../../../lib/appError");
const trim_1 = require("../../../utils/trim");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
class LoginController {
    static login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
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
                const { user, token } = yield loginUser_1.AuthService.login(loginDto);
                res.cookie("login", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: true,
                });
                new response_util_1.default(200, true, "Login successful", res, { user, token });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.LoginController = LoginController;
