import express from 'express';
import { createBlogPost, getBlogs, getBlog, updateBlog, deleteBlog, publishBlog, getFeaturedContributorBlogs, trendingBlog, getTheNumberOfProperties } from '../controllers/blog.controller';
import authenticate, { adminRequireRole, isAdmin } from '../../../middlewares/auth.middleware';
import { singleupload } from '../../../middlewares/multer';

const router = express.Router();


router.get('/blogs', getBlogs); 
router.get('/trendingBlogs', trendingBlog); 
router.get('/numberOfProperties', getTheNumberOfProperties); 
router.get('/blogs/featured-contributors', getFeaturedContributorBlogs); 


router.post('/create', authenticate, singleupload, createBlogPost); 
router.get('/:id', getBlog);
router.patch('/:id', authenticate,singleupload, updateBlog); 
router.delete('/blogs/:id', authenticate,  deleteBlog); 
router.patch('/blogs/:id/publish', authenticate, adminRequireRole("BLOG"), publishBlog); 

export default router;