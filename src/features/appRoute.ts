import express from 'express';
import authRoutes from './authentication/routes/auth.route';
import userRoutes from './superAdmin/routes/user.route';
import rewardRoutes from './rewards/routes/reward.route';
import usersRoutes from './user/routes/user.route';
// import blogRoutes from './blogs/routes/blog.route';
import campaignRoutes from './campaign/routes/campaign.route';
import propertyRoutes from './property/routes/post.route';
import advertRoutes from './advertiseWithUs/route';
import projectRoutes from './project/routes/project.route';
import propertyRequestRoutes from './requestProperties/routes/propertyrequest.route';
import { sendMail } from '../utils/nodemailer';
import prequalificationRoutes from './prequalify/route';
import chatRoutes from './userchat/route/chat.route';
const appRouter = express.Router();


 appRouter.use("/auth", authRoutes);
 appRouter.use("/user", usersRoutes);
 appRouter.use("/rewards", rewardRoutes);
 appRouter.use("/superAdmin", userRoutes);
//  appRouter.use("/blog",blogRoutes );
 appRouter.use("/campaigns",campaignRoutes );
 appRouter.use("/properties",propertyRoutes );
 appRouter.use("/project",projectRoutes );
 appRouter.use("/advertiseMent", advertRoutes);
 appRouter.use("/propertyrequest", propertyRequestRoutes);
 appRouter.use("/prequalification", prequalificationRoutes);
 appRouter.use("/chat", chatRoutes);
 appRouter.post("/send-email", sendMail);



export default appRouter;