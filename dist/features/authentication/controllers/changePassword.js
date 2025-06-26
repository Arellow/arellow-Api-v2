"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const changePassword_1 = require("../services/changePassword");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
class UserController {
    constructor() {
        this.authService = new changePassword_1.ChangePasswordService();
        this.changePassword = async (req, res, next) => {
            const userId = req.user?.id;
            const dto = req.body;
            try {
                await this.authService.changePassword(userId, dto);
                new response_util_1.default(200, true, "Password changed successfully", res);
                return;
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.UserController = UserController;
