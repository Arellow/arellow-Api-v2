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
exports.RegisterController = void 0;
const registerUser_1 = require("../services/registerUser");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const appError_1 = require("../../../lib/appError");
const trim_1 = require("../../../utils/trim");
class RegisterController {
    static register(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, trim_1.trimObjectKeys)(req.body);
            }
            catch (err) {
                console.error("Trim keys failed:", err);
                throw new appError_1.BadRequestError("Failed to sanitize input keys");
            }
            try {
                const { username, password, email, phone_number, fullname } = req.body;
                const missingFields = [];
                if (!username)
                    missingFields.push("username");
                if (!password)
                    missingFields.push("password");
                if (!email)
                    missingFields.push("email");
                if (!phone_number)
                    missingFields.push("phone_number");
                if (!fullname)
                    missingFields.push("fullname");
                if (missingFields.length > 0) {
                    throw new appError_1.BadRequestError(`Missing required fields: ${missingFields.join(", ")}`);
                }
                if (typeof username !== "string" ||
                    typeof password !== "string" ||
                    typeof email !== "string" ||
                    typeof phone_number !== "string" ||
                    typeof fullname !== "string") {
                    throw new appError_1.BadRequestError("All fields must be strings");
                }
                const dto = {
                    username,
                    password,
                    email,
                    phone_number,
                    fullname,
                };
                const user = yield registerUser_1.AuthService.registerUser(dto);
                new response_util_1.default(201, true, "User registered successfully. Check your email to verify.", res, user);
            }
            catch (error) {
                if (error instanceof appError_1.DuplicateError) {
                    next(new appError_1.BadRequestError("Email or username already exists"));
                }
                else {
                    next(error);
                }
            }
        });
    }
}
exports.RegisterController = RegisterController;
