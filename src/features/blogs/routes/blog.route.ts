

import { Router } from "express";
import {
 blogController
} from "../controllers/blog.controller";
import { singleupload } from "../../../middlewares/multer";
import authenticate, { isAdmin } from "../../../middlewares/auth.middleware";

const blogRoutes = Router();

blogRoutes.post("/posts", authenticate, singleupload, blogController.addBlog);
blogRoutes.get("/posts/", blogController.getPosts);
blogRoutes.get("/posts/:id", blogController.getBlog);
// blogRoutes.patch("/posts/:id", authenticate, isAdmin, singleupload, updateBlogPost);
// blogRoutes.patch("/posts/:id", authenticate, isAdmin, singleupload, updateBlogPost);
// blogRoutes.delete("/posts/:id", authenticate, isAdmin, deleteBlogPost);

export default blogRoutes;