"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyController = void 0;
const verifyEmail_1 = require("../services/verifyEmail");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const appError_1 = require("../../../lib/appError");
class VerifyController {
    static async verifyEmail(req, res, next) {
        try {
            const { token } = req.query;
            if (!token || typeof token !== "string") {
                throw new appError_1.BadRequestError("Verification token is required.");
            }
            const dto = { token };
            const message = await verifyEmail_1.AuthService.verifyEmail(dto);
            new response_util_1.default(200, true, message, res);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.VerifyController = VerifyController;
