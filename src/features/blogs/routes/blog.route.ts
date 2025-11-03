import express from 'express';
import authenticate, { isSuspended, isVerify, requireKyc } from '../../../middlewares/auth.middleware';
import { singleupload } from '../../../middlewares/multer';
import { createBlog, editBlog } from '../controllers/blog.controller';

const blogRoutes = express.Router();
//  authenticate, isVerify,requireKyc, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), 

// router.get('/blogs', getBlogs); 
// router.get('/trendingBlogs', trendingBlog); 
// router.get('/blogs/featured-contributors', getFeaturedContributorBlogs); 


blogRoutes.post('/', authenticate, isVerify,requireKyc, isSuspended, singleupload, createBlog); 
blogRoutes.post('/:id', authenticate, isVerify,requireKyc, isSuspended, singleupload, editBlog); 
// router.get('/blogs/:id', getBlog);
// router.put('/blogs/:id', authenticate, updateBlog); 
// router.delete('/blogs/:id', authenticate, deleteBlog); 
// router.patch('/blogs/:id/publish', authenticate,isAdmin, publishBlog); 

export default blogRoutes;
