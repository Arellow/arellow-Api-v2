"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogoutController = void 0;
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
class LogoutController {
    static async logout(req, res, next) {
        try {
            // Clear the login cookie
            res.clearCookie("login", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: true,
            });
            new response_util_1.default(200, true, "Logged out successfully", res);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.LogoutController = LogoutController;
