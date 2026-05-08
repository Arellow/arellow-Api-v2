import express from "express";
import { validateSchema } from "../../../middlewares/propertyParsingAndValidation";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  confirmForgotPasswordSchema,
  changePasswordSchema,
} from "../../../validations/auth.validation";
import { VerifyController } from "../controllers/verifyEmail";
import { RegisterController } from "../controllers/registerUser";
import { LoginController } from "../controllers/loginUser";
import { ForgetPasswordController } from "../controllers/forgetPassword";
import { ConfirmPasswordController } from "../controllers/comfirmPassword";
import { UserController } from "../controllers/changePassword";
import { LogoutController } from "../controllers/logout";
import { RefreshTokenController } from "../controllers/refreshToken";
import { ResendVerificationController } from "../controllers/resendVerification";
import { SubscribeService } from "../services/subscribe";
import { SubscribeController } from "../controllers/subscribe";
import authenticate from "../../../middlewares/auth.middleware";
import { countriesRequest} from "../controllers/countries";
import { DeleteAccountController } from "../controllers/deleteaccount";
import { authLimiter } from "../../../middlewares/rateLimit.middleware";

const authRouter = express.Router();

// Initialize controllers
const forgetPasswordController = new ForgetPasswordController();
const confirmPasswordController = new ConfirmPasswordController();
const userController = new UserController();
const resendVerificationController = new ResendVerificationController();
const subscribeService = new SubscribeService();
const subscribeController = new SubscribeController(subscribeService);

// Public routes
authRouter.post(
  "/register",
  authLimiter,
  validateSchema(registerSchema),
  RegisterController.register
);

authRouter.post(
  "/login",
  authLimiter,
  validateSchema(loginSchema),
  LoginController.login
);

authRouter.post(
  "/verify-email",
  VerifyController.verifyEmail
);



authRouter.post("/forgetpassword/web", authLimiter, validateSchema(forgotPasswordSchema), (req, _res, next) => {
    req.body.isMobile = false
    next()
}, forgetPasswordController.forgetPassword);

authRouter.post("/forgetpassword/mobile", authLimiter, validateSchema(forgotPasswordSchema), (req, _res, next) => {
    req.body.isMobile = true
    next()
}, forgetPasswordController.forgetPassword);


authRouter.patch(
  "/forgetpassword/confirm",
  authLimiter,
  validateSchema(confirmForgotPasswordSchema),
  confirmPasswordController.confirmForgotPassword
);

authRouter.post(
  "/subscribe",
  subscribeController.subscribe
);

// Protected routes
authRouter.patch(
  "/change-password/",
  authenticate,
  validateSchema(changePasswordSchema),
  userController.changePassword
);

authRouter.post(
  "/resend-verification",
  authLimiter,
  resendVerificationController.resendVerification
);

authRouter.post(
  "/logout",
  authenticate,
  LogoutController.logout
);

authRouter.post(
  "/refresh",
  authLimiter,
  RefreshTokenController.refresh
);

authRouter.delete(
  "/delete-account",
  authenticate,
  DeleteAccountController.deleteaccount
);

authRouter.get("/countries", countriesRequest);

export default authRouter;
