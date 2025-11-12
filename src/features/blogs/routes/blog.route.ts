import express from 'express';
import authenticate, { adminRequireRole, isSuspended, isVerify, requireKyc, requireRole } from '../../../middlewares/auth.middleware';
import { singleupload } from '../../../middlewares/multer';
import { blogDetail, changeBlogStatus, createBlog, deleteBlog, editBlog, getBlogs } from '../controllers/blog.controller';
import { UserRole } from '@prisma/client';

const blogRoutes = express.Router();
//  authenticate, isVerify,requireKyc, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), 



blogRoutes.post('/', authenticate, isVerify,requireKyc, isSuspended, singleupload, createBlog); 
blogRoutes.patch('/:id', authenticate, isVerify,requireKyc, isSuspended, singleupload, editBlog); 
blogRoutes.get('/:id', blogDetail);
blogRoutes.delete('/:id', authenticate,isVerify,requireKyc, isSuspended, deleteBlog); 
blogRoutes.get('/', getBlogs); 
blogRoutes.put('/:id', authenticate, isVerify,requireKyc, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("BLOG"),  changeBlogStatus); 

// router.patch('/blogs/:id/publish', authenticate,isAdmin, publishBlog); 

export default blogRoutes;
