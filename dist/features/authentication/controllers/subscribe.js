"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscribeController = void 0;
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const appError_1 = require("../../../lib/appError");
const trim_1 = require("../../../utils/trim");
class SubscribeController {
    constructor(subscribeService) {
        this.subscribeService = subscribeService;
        this.subscribe = async (req, res, next) => {
            try {
                (0, trim_1.trimObjectKeys)(req.body);
            }
            catch (err) {
                console.error("Trim keys failed:", err);
                throw new appError_1.BadRequestError("Failed to sanitize input keys");
            }
            try {
                const { email, phone } = req.body;
                if (!email && !phone) {
                    throw new appError_1.BadRequestError("Email or phone number is required");
                }
                if (email && typeof email !== "string") {
                    throw new appError_1.BadRequestError("Email must be a string");
                }
                if (phone && typeof phone !== "string") {
                    throw new appError_1.BadRequestError("Phone number must be a string");
                }
                const result = await this.subscribeService.subscribe(email, phone);
                new response_util_1.default(200, true, "Subscription successful", res, result);
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.SubscribeController = SubscribeController;
