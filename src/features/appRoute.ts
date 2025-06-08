import express from 'express';
import authRoutes from './authentication/routes/auth.route';
import postRoutes from './property/routes/post.route';
const appRouter = express.Router();

 appRouter.use("/auth", authRoutes);
 appRouter.use("/post", postRoutes);
export default appRouter;