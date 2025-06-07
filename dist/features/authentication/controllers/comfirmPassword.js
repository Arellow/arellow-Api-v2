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
exports.AuthController = void 0;
const confirmPassword_1 = require("../services/confirmPassword");
class AuthController {
    constructor() {
        this.comfirmPasswordService = new confirmPassword_1.ConfirmPasswordService();
        this.confirmForgotPassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const dto = req.body;
            try {
                const result = yield this.comfirmPasswordService.confirmForgotPassword(dto);
                return res.status(200).json({
                    message: "Password has been reset successfully.",
                    data: result.user,
                    token: result.token,
                    status: "success",
                });
            }
            catch (error) {
                const statusCode = error.message.includes("expired")
                    ? 400
                    : error.message.includes("not match") || error.message.includes("required")
                        ? 422
                        : 500;
                return res.status(statusCode).json({
                    status: "error",
                    message: error.message || "Something went wrong",
                });
            }
        });
    }
}
exports.AuthController = AuthController;
