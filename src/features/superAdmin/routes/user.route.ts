import express from 'express'
import authenticate, { isAdmin, requireRole } from '../../../middlewares/auth.middleware';
import { getAllAdmins, getUsersController } from '../controllers/user';

import { getDashboardSummary, getRecentListings, getRewardOverview, getTopRealtors, performQuickAction } from '../controllers/superAdminDashboard';
import { UserRole } from '@prisma/client';

const userRoutes =  express.Router();
//User management routes
userRoutes.get("/users",authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), getUsersController );

//super admin Dashboard routes
userRoutes.get("/dashboard/summary",authenticate , getDashboardSummary);
userRoutes.get("/dashboard/recent-listing",authenticate , getRecentListings);
// userRoutes.get("/dashboard/quick-action",authenticate , performQuickAction);
userRoutes.get("/dashboard/top-realtors", authenticate, getTopRealtors);
userRoutes.get("/dashboard/reward-overview", authenticate, getRewardOverview);


// flow
userRoutes.get("/admins",authenticate, 
    // requireRole(UserRole.SUPER_ADMIN), 
    getAllAdmins );

export default userRoutes