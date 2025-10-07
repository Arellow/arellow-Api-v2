import express from "express";
import authenticate, { adminRequireRole, isSuspended, requireRole } from "../../../middlewares/auth.middleware";
import { getRewardHistoryDetail, getRewardRequestDetail, rewardDashbroad, rewardHistory, rewardRequest, rewardStatus } from "../contollers/reward";
import { UserRole } from "@prisma/client";

const rewardRoutes = express.Router();

rewardRoutes.get("/rewardrequest",authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), rewardRequest);
rewardRoutes.get("/rewardhistory",authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), rewardHistory);
rewardRoutes.get("/",authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), rewardDashbroad);

rewardRoutes.get("/rewardhistorydetails/:id", authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), getRewardHistoryDetail);
rewardRoutes.get("/rewardrequestdetail/:id", authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), getRewardRequestDetail);
rewardRoutes.patch("/rewardrequestdetail/:id", authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("REWARD"), rewardStatus);

export default rewardRoutes;