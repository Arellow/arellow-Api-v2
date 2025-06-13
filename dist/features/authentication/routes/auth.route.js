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
const forgetPassword_1 = require("../controllers/forgetPassword");
const comfirmPassword_1 = require("../controllers/comfirmPassword");
const changePassword_1 = require("../controllers/changePassword");
const logout_1 = require("../controllers/logout");
const resendVerification_1 = require("../controllers/resendVerification");
const subscribe_1 = require("../services/subscribe");
const subscribe_2 = require("../controllers/subscribe");
const auth_middleware_1 = __importDefault(require("../../../middlewares/auth.middleware"));
const authRouter = express_1.default.Router();
// Initialize controllers
const forgetPasswordController = new forgetPassword_1.ForgetPasswordController();
const confirmPasswordController = new comfirmPassword_1.ConfirmPasswordController();
const userController = new changePassword_1.UserController();
const resendVerificationController = new resendVerification_1.ResendVerificationController();
const subscribeService = new subscribe_1.SubscribeService();
const subscribeController = new subscribe_2.SubscribeController(subscribeService);
// Public routes
authRouter.post("/register", (0, propertyParsingAndValidation_1.validateSchema)(auth_validation_1.registerSchema), registerUser_1.RegisterController.register);
authRouter.post("/login", (0, propertyParsingAndValidation_1.validateSchema)(auth_validation_1.loginSchema), loginUser_1.LoginController.login);
authRouter.get("/verify-email", verifyEmail_1.VerifyController.verifyEmail);
authRouter.post("/forgetpassword/web", (0, propertyParsingAndValidation_1.validateSchema)(auth_validation_1.forgotPasswordSchema), (req, res, next) => {
    req.body.isMobile = false;
    next();
}, forgetPasswordController.forgetPassword);
authRouter.post("/forgetpassword/mobile", (0, propertyParsingAndValidation_1.validateSchema)(auth_validation_1.forgotPasswordSchema), (req, res, next) => {
    req.body.isMobile = true;
    next();
}, forgetPasswordController.forgetPassword);
authRouter.post("/forgetpassword/confirm", (0, propertyParsingAndValidation_1.validateSchema)(auth_validation_1.confirmForgotPasswordSchema), confirmPasswordController.confirmForgotPassword);
authRouter.post("/subscribe", subscribeController.subscribe);
// Protected routes
authRouter.post("/change-password/", auth_middleware_1.default, (0, propertyParsingAndValidation_1.validateSchema)(auth_validation_1.changePasswordSchema), userController.changePassword);
authRouter.get("/resend-verification", auth_middleware_1.default, resendVerificationController.resendVerification);
authRouter.post("/logout", auth_middleware_1.default, logout_1.LogoutController.logout);
exports.default = authRouter;
