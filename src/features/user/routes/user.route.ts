import { Router } from "express";
import {
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  suspendUser,
} from "../controllers/user";
import authenticate, { isAdmin, requireRole } from "../../../middlewares/auth.middleware";
import { validateSchema } from "../../../middlewares/propertyParsingAndValidation";
import { updateUserSchema } from "../../../validations/user.validation";
import { getRealtorsLeaderboard } from "../controllers/leaderboard";
import { changeKycStatus, createKyc, kycDetail, userKycs } from "../controllers/kyc";
import { UserRole } from "@prisma/client";

const usersRoutes = Router();
usersRoutes.post("/kyc",  authenticate,  createKyc);
usersRoutes.get("/kycs", authenticate,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), userKycs);
usersRoutes.get("/kyc/:id/detail", authenticate,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),  kycDetail);
usersRoutes.patch("/kyc/:id/detail", authenticate,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),  changeKycStatus);
usersRoutes.get("/leaderboard", getRealtorsLeaderboard);

usersRoutes.get("/:userId", getUserById);
usersRoutes.patch(
  "/:userId",
  authenticate,
  validateSchema(updateUserSchema),
  updateUser
);

usersRoutes.put("/:userId/role", authenticate, updateUserRole);
usersRoutes.put("/:userId/suspend", suspendUser);
usersRoutes.delete("/:userId", deleteUser);

export default usersRoutes;
