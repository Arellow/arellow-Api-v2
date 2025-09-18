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
import { ResendVerificationController } from "../controllers/resendVerification";
import { SubscribeService } from "../services/subscribe";
import { SubscribeController } from "../controllers/subscribe";
import authenticate from "../../../middlewares/auth.middleware";
import { countriesRequest} from "../controllers/countries";

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
  validateSchema(registerSchema),
  RegisterController.register
);

authRouter.post(
  "/login",
  validateSchema(loginSchema),
  LoginController.login
);

authRouter.post(
  "/verify-email",
  VerifyController.verifyEmail
);



authRouter.post("/forgetpassword/web", validateSchema(forgotPasswordSchema), (req,res,next) => {
    req.body.isMobile = false
    next()
}, forgetPasswordController.forgetPassword);

authRouter.post("/forgetpassword/mobile", validateSchema(forgotPasswordSchema), (req,res,next) => {
    req.body.isMobile = true
    next()
}, forgetPasswordController.forgetPassword);


authRouter.patch(
  "/forgetpassword/confirm",
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

  resendVerificationController.resendVerification
);

authRouter.post(
  "/logout",
  authenticate,
  LogoutController.logout
);

authRouter.get("/countries", countriesRequest);

export default authRouter;
