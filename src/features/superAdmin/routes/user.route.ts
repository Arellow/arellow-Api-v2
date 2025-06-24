import express from 'express'
import authenticate, { isAdmin } from '../../../middlewares/auth.middleware';
import { getUsersController } from '../controllers/user';
import { userDetail } from '../controllers/userDetails';
// import { getDashboardSummary, getRecentListings, getRewardOverview, getTopRealtors, performQuickAction } from '../controllers/superAdminDashboard';

const userRoutes =  express.Router();
//User management routes
userRoutes.get("/users",authenticate, isAdmin, getUsersController );
userRoutes.get("/userDetail/:userId",authenticate,isAdmin, userDetail);

// //super admin Dashboard routes
// userRoutes.get("/dashboard/summary",authenticate , getDashboardSummary);
// userRoutes.get("/dashboard/recent-listing",authenticate , getRecentListings);
// // userRoutes.get("/dashboard/quick-action",authenticate , performQuickAction);
// userRoutes.get("/dashboard/top-realtors", authenticate, getTopRealtors);
// userRoutes.get("/dashboard/reward-overview", authenticate, getRewardOverview);

export default userRoutes