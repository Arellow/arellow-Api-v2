import { Router } from "express";
import {
  getUserById,
  updateUser,
  deleteUser,
  suspendUser,
  updateAvatar,
  updateNotificationSetting,
  requestReward,
} from "../controllers/user";
import authenticate, { adminRequireRole, isSuspended, isVerify, requireKyc, requireRole } from "../../../middlewares/auth.middleware";
import { validateSchema } from "../../../middlewares/propertyParsingAndValidation";
import { updateUserSchema } from "../../../validations/user.validation";
import { approvedKyc, rejectKyc, createKyc, kycDetail, userKycs } from "../controllers/kyc";
import { UserRole } from "@prisma/client";
import { documentPhotoupload, multipleupload, singleupload } from "../../../middlewares/multer";
import { changeTicketSchema, createCustomerSupportSchema, createKycSchema, createNotificationSchema } from "./user.validate";
import { changeTicketStatus, createCustomerSupport, customerSupportDetail, customerSupports, usercustomerSupportTicket } from "../controllers/customer";
import { getPropertiesStatsByUser, userDashbroad } from "../controllers/dashbroad";
import { createNotification, notificationDelete, notificationDetail, userNotifications, userNotificationsForMobile } from "../controllers/notifications";

const usersRoutes = Router();
usersRoutes.get("/dashbroad", authenticate, userDashbroad);
usersRoutes.get("/propertystats", authenticate, getPropertiesStatsByUser);


usersRoutes.post("/requestreward", authenticate, isVerify, requireKyc, isSuspended, requestReward);
usersRoutes.post("/kyc", authenticate, isVerify, documentPhotoupload,  validateSchema(createKycSchema), createKyc);
usersRoutes.get("/kycs", authenticate,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), userKycs);
usersRoutes.get("/kyc/:id/detail", authenticate,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),  kycDetail);
usersRoutes.patch("/kyc/:id/approve", authenticate,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),  adminRequireRole("KYC"),  approvedKyc);
usersRoutes.patch("/kyc/:id/reject", authenticate,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),  adminRequireRole("KYC"),  rejectKyc);

usersRoutes.post("/tickets", authenticate, isVerify, multipleupload,  validateSchema(createCustomerSupportSchema), createCustomerSupport);
usersRoutes.get("/userticket", authenticate, usercustomerSupportTicket);
usersRoutes.get("/tickets", authenticate, 
  isVerify, 
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  customerSupports);
usersRoutes.patch("/ticket/:id/status", authenticate,   validateSchema(changeTicketSchema),
  isVerify, 
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminRequireRole("SUPPORT"),
  changeTicketStatus);
  usersRoutes.get("/ticket/:id/detail", authenticate, customerSupportDetail);

usersRoutes.get("/detail", authenticate, getUserById);

usersRoutes.patch(
  "/profile",
  authenticate,
  validateSchema(updateUserSchema),
  updateUser
);

usersRoutes.patch(
  "/avatar",
  singleupload,
  authenticate,
  updateAvatar
);
usersRoutes.patch(
  "/notifysetting",
  authenticate,
  updateNotificationSetting
);

usersRoutes.put("/:userId/suspend", suspendUser);
usersRoutes.delete("/:userId", deleteUser);

usersRoutes.get('/mobilenotifications', authenticate, userNotificationsForMobile);
usersRoutes.get('/notifications', authenticate, userNotifications);
usersRoutes.get('/notification/:id/detail', authenticate, notificationDetail);
usersRoutes.delete('/notification/:id/delete', authenticate, notificationDelete);
usersRoutes.post('/notification', validateSchema(createNotificationSchema), authenticate, isVerify, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("SUPPORT"), createNotification);

export default usersRoutes;
