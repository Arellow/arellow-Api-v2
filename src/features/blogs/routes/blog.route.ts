import { Router } from "express";
import {
  createBlogPost,
  getBlogPosts,
  updateBlogPost,
  deleteBlogPost,
} from "../controllers/blog.controller";
import { singleupload } from "../../../middlewares/multer"; 
import authenticate, { isAdmin } from "../../../middlewares/auth.middleware";

const blogRoutes = Router();


blogRoutes.post("/posts",authenticate, singleupload, createBlogPost); 
blogRoutes.get("/posts", authenticate,getBlogPosts); 
blogRoutes.put("/posts/:id",authenticate, isAdmin, singleupload, updateBlogPost); 
blogRoutes.delete("/posts/:id", authenticate, isAdmin, deleteBlogPost);

export default blogRoutes;