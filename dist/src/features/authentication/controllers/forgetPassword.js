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
exports.ForgetPasswordController = void 0;
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const forgetPassword_1 = require("../services/forgetPassword");
const trim_1 = require("../../../utils/trim");
const appError_1 = require("../../../lib/appError");
class ForgetPasswordController {
    constructor() {
        this.forgetPasswordService = new forgetPassword_1.ForgetPasswordService();
        this.forgetPassword = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                (0, trim_1.trimObjectKeys)(req.body);
            }
            catch (err) {
                console.error("Trim keys failed:", err);
                throw new appError_1.BadRequestError("Failed to sanitize input keys");
            }
            try {
                const dto = req.body;
                const result = yield this.forgetPasswordService.forgetPassword(dto);
                new response_util_1.default(200, true, "Password reset code sent successfully", res, result);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.ForgetPasswordController = ForgetPasswordController;
