"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendVerificationController = void 0;
const resendVerification_1 = require("../services/resendVerification");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const appError_1 = require("../../../lib/appError");
class ResendVerificationController {
    constructor() {
        this.resendVerificationService = new resendVerification_1.ResendVerificationService();
        this.resendVerification = async (req, res, next) => {
            try {
                if (!req.user?.email) {
                    throw new appError_1.BadRequestError("User email not found");
                }
                const result = await this.resendVerificationService.resendVerification(req.user.email);
                new response_util_1.default(200, true, "Verification email sent successfully", res, result);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ResendVerificationController = ResendVerificationController;
