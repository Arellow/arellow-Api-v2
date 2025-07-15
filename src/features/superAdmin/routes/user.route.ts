import express from 'express'
import authenticate, { isAdmin, requireRole } from '../../../middlewares/auth.middleware';
import { addAdmin, getAllAdmins, getUsersController, suspendAdminStatus } from '../controllers/user';

import { getDashboardSummary, getRecentListings, getRewardOverview, getTopRealtors, performQuickAction } from '../controllers/superAdminDashboard';
import { UserRole } from '@prisma/client';
import { addAdminSchema } from './user.validate';
import { validateSchema } from '../../../middlewares/propertyParsingAndValidation';

const userRoutes =  express.Router();
//User management routes
userRoutes.get("/users",authenticate, requireRole(UserRole.SUPER_ADMIN), getUsersController );
userRoutes.put("/:userId/role", validateSchema(addAdminSchema),authenticate,  requireRole(UserRole.SUPER_ADMIN),  addAdmin);
userRoutes.patch("/:userId/suspend", validateSchema(addAdminSchema),authenticate,  requireRole(UserRole.SUPER_ADMIN),  suspendAdminStatus);
userRoutes.get("/admins",authenticate, requireRole(UserRole.SUPER_ADMIN), getAllAdmins );


//super admin Dashboard routes
userRoutes.get("/dashboard/summary",authenticate , getDashboardSummary);
userRoutes.get("/dashboard/recent-listing",authenticate , getRecentListings);
// userRoutes.get("/dashboard/quick-action",authenticate , performQuickAction);
userRoutes.get("/dashboard/top-realtors", authenticate, getTopRealtors);
userRoutes.get("/dashboard/reward-overview", authenticate, getRewardOverview);



export default userRoutes