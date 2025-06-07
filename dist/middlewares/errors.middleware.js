"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = errorHandler;
const logger_middleware_1 = __importDefault(require("./logger.middleware"));
const response_util_1 = __importDefault(require("../utils/helpers/response.util"));
const appError_1 = require("../lib/appError");
function errorHandler(error, req, res, next) {
    logger_middleware_1.default.error(error);
    if (error instanceof appError_1.AppError) {
        // Custom handled errors
        new response_util_1.default(error.statusCode, false, error.message, res);
    }
    else {
        // Unhandled errors (like thrown by native code, etc.)
        new response_util_1.default(500, false, "Something went wrong", res);
    }
}
