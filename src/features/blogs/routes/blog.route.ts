import express from 'express';
import authenticate, { adminRequireRole, isSuspended, isVerify, requireKyc, requireRole } from '../../../middlewares/auth.middleware';
import { singleupload } from '../../../middlewares/multer';
import { blogDetail, changeBlogStatus, createBlog, deleteBlog, editBlog, getBlogContributorDetail, getBlogs, getBlogsContributors } from '../controllers/blog.controller';
import { UserRole } from '../../../../generated/prisma/enums';

const blogRoutes = express.Router();

blogRoutes.get('/contributors', getBlogsContributors); 
blogRoutes.get('/contributor/:id', getBlogContributorDetail); 
blogRoutes.get('/:id', blogDetail);
blogRoutes.get('/', getBlogs); 


blogRoutes.post('/', authenticate, isVerify, isSuspended, singleupload, createBlog);
blogRoutes.patch('/:id', authenticate, isVerify, isSuspended, singleupload, editBlog);
blogRoutes.delete('/:id', authenticate, isVerify, isSuspended, deleteBlog);
blogRoutes.put('/:id', authenticate, isVerify, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("BLOG"), changeBlogStatus);

export default blogRoutes;
