import { Router } from "express";
import {
  getUserById,
  updateUser,
  deleteUser,
  suspendUser,
} from "../controllers/user";
import authenticate, { adminRequireRole, isAdmin, isVerify, requireRole } from "../../../middlewares/auth.middleware";
import { validateSchema } from "../../../middlewares/propertyParsingAndValidation";
import { updateUserSchema } from "../../../validations/user.validation";
import { approvedKyc, rejectKyc, createKyc, kycDetail, userKycs, userDashbroad } from "../controllers/kyc";
import { UserRole } from "@prisma/client";
import { documentPhotoupload, multipleupload, singleupload } from "../../../middlewares/multer";
import { changeTicketSchema, createCustomerSupportSchema, createKycSchema } from "./user.validate";
import { changeTicketStatus, createCustomerSupport, customerSupportDetail, customerSupports, usercustomerSupportTicket } from "../controllers/customer";

const usersRoutes = Router();
usersRoutes.get("/dashbroad", authenticate, userDashbroad);
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

usersRoutes.get("/:userId", getUserById);
usersRoutes.patch(
  "/:userId",
  singleupload,
  authenticate,
  validateSchema(updateUserSchema),
  updateUser
);

usersRoutes.put("/:userId/suspend", suspendUser);
usersRoutes.delete("/:userId", deleteUser);

export default usersRoutes;
