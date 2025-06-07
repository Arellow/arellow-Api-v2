"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const propertyParsingAndValidation_1 = require("../../../middlewares/propertyParsingAndValidation");
const auth_validation_1 = require("../../../validations/auth.validation");
const verifyEmail_1 = require("../controllers/verifyEmail");
const registerUser_1 = require("../controllers/registerUser");
const loginUser_1 = require("../controllers/loginUser");
const authRouter = express_1.default.Router();
authRouter.post("/register", (0, propertyParsingAndValidation_1.validateSchema)(auth_validation_1.registerSchema), registerUser_1.RegisterController.register);
authRouter.get("/verify-email", verifyEmail_1.VerifyController.verifyEmail);
authRouter.post("/login", (0, propertyParsingAndValidation_1.validateSchema)(auth_validation_1.loginSchema), loginUser_1.LoginController.login);
exports.default = authRouter;
