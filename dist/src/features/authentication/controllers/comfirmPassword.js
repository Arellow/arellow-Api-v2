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
exports.ConfirmPasswordController = void 0;
const confirmPassword_1 = require("../services/confirmPassword");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const appError_1 = require("../../../lib/appError");
class ConfirmPasswordController {
    constructor() {
        this.comfirmPasswordService = new confirmPassword_1.ConfirmPasswordService();
        this.confirmForgotPassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const dto = req.body;
            console.log(dto);
            try {
                const result = yield this.comfirmPasswordService.confirmForgotPassword(dto);
                new response_util_1.default(200, true, "Password has been reset successfully.", res, { user: result.user, token: result.token });
            }
            catch (error) {
                if (error.message.includes("expired")) {
                    next(new appError_1.BadRequestError("Reset code has expired"));
                }
                else if (error.message.includes("not match") || error.message.includes("required")) {
                    next(new appError_1.BadRequestError(error.message));
                }
                else {
                    next(error);
                }
            }
        });
    }
}
exports.ConfirmPasswordController = ConfirmPasswordController;
