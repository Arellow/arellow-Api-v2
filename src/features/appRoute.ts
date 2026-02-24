import express from 'express';
import authRoutes from './authentication/routes/auth.route';
import userRoutes from './superAdmin/routes/user.route';
import rewardRoutes from './rewards/routes/reward.route';
import usersRoutes from './user/routes/user.route';
import campaignRoutes from './campaign/routes/campaign.route';
import propertyRoutes from './property/routes/post.route';
import projectRoutes from './project/routes/project.route';
import propertyRequestRoutes from './requestProperties/routes/propertyrequest.route';
import prequalificationRoutes from './prequalify/route';
import chatRoutes from './userchat/route/chat.route';
import blogRoutes from './blogs/routes/blog.route';
import adminRoutes from './admin/routes/admin.route';
import landsRoutes from './lands/routes/lands.route';
import propertyverifyrouter from './propertyverify/routes/propertyveriify.route';
const appRouter = express.Router();


 appRouter.use("/auth", authRoutes);
 appRouter.use("/user", usersRoutes);
 appRouter.use("/rewards", rewardRoutes);
 appRouter.use("/superAdmin", userRoutes);
 appRouter.use("/admin", adminRoutes);
 appRouter.use("/blog", blogRoutes);
 appRouter.use("/campaigns",campaignRoutes );
 appRouter.use("/properties",propertyRoutes );
 appRouter.use("/project",projectRoutes );
 appRouter.use("/propertyrequest", propertyRequestRoutes);
 appRouter.use("/prequalification", prequalificationRoutes);
 appRouter.use("/chat", chatRoutes);
 appRouter.use("/lands", landsRoutes);
 appRouter.use("/propertyverify", propertyverifyrouter);


export default appRouter;