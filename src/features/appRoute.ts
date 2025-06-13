import express from 'express';
import authRoutes from './authentication/routes/auth.route';
import userRoutes from './superAdmin/routes/user.route';
import rewardRoutes from './rewards/routes/reward.route';
import usersRoutes from './user/routes/user.route';
import userAdminRoutes from './userAdmin/routes/userManagement';
const appRouter = express.Router();

 appRouter.use("/auth", authRoutes);
 appRouter.use("/user", usersRoutes);
 appRouter.use("/userAdmin", userAdminRoutes);
 appRouter.use("/reward", rewardRoutes);
 appRouter.use("/superAdmin", userRoutes);
export default appRouter;