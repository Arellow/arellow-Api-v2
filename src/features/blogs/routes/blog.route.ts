// import express from 'express';
// import { createBlogPost, getBlogs, getBlog, updateBlog, deleteBlog, publishBlog, getFeaturedContributorBlogs, trendingBlog } from '../controllers/blog.controller';
// import authenticate, { isAdmin } from '../../../middlewares/auth.middleware';
// import { singleupload } from '../../../middlewares/multer';

// const router = express.Router();


// router.get('/blogs', getBlogs); 
// router.get('/trendingBlogs', trendingBlog); 
// router.get('/blogs/featured-contributors', getFeaturedContributorBlogs); 


// router.post('/blogs', authenticate, singleupload, createBlogPost); 
// router.get('/blogs/:id', getBlog);
// router.put('/blogs/:id', authenticate, updateBlog); 
// router.delete('/blogs/:id', authenticate, deleteBlog); 
// router.patch('/blogs/:id/publish', authenticate,isAdmin, publishBlog); 

// export default router;