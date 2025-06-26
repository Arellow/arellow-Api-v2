"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForgetPasswordController = void 0;
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const forgetPassword_1 = require("../services/forgetPassword");
const trim_1 = require("../../../utils/trim");
const appError_1 = require("../../../lib/appError");
class ForgetPasswordController {
    constructor() {
        this.forgetPasswordService = new forgetPassword_1.ForgetPasswordService();
        this.forgetPassword = async (req, res, next) => {
            try {
                (0, trim_1.trimObjectKeys)(req.body);
            }
            catch (err) {
                console.error("Trim keys failed:", err);
                throw new appError_1.BadRequestError("Failed to sanitize input keys");
            }
            try {
                const dto = req.body;
                const result = await this.forgetPasswordService.forgetPassword(dto);
                new response_util_1.default(200, true, "Password reset code sent successfully", res, result);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ForgetPasswordController = ForgetPasswordController;
