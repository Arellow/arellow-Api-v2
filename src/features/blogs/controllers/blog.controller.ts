import { Request, Response, NextFunction } from "express";
import { BlogService } from "../services/blog.service";
import { InternalServerError } from "../../../lib/appError";
import { CreateBlogDto, UpdateBlogDto, BlogFilterDto } from "../dtos/blog.dto";
import CustomResponse from "../../../utils/helpers/response.util";
import { singleupload, getDataUri } from "../../../middlewares/multer";
import { v2 as cloudinary } from "cloudinary"; 

const blogService = new BlogService();

export const createBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id as string;
  console.log("User data:", req.user);
  if (!userId) {
     res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return;
  }

  try {
    // Handle file upload with singleupload middleware
    await new Promise((resolve, reject) => {
      singleupload(req, res, (err) => {
        if (err) {
          console.error("File upload error:", err);
          reject(err);
        } else {
          resolve(null);
        }
      });
    });

    let imageUrl: string | null = null;
    if (req.file) {
      try {
        // Convert file buffer to Data URI
        const fileUri = getDataUri(req.file as any); 
        // Upload to Cloudinary using Data URI
        const uploadResult = await cloudinary.uploader.upload(fileUri.content, {
          folder: "blog_images",
          resource_type: "image",
          allowed_formats: ["jpg", "png", "jpeg"],
          transformation: [{ width: 500, height: 500, crop: "limit" }],
        });
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        throw new Error("Failed to upload image to Cloudinary");
      }
    }
    
    console.log("Image URL:", imageUrl);
    
    // Validate required fields
    if (!req.body.title || !req.body.content || !req.body.category) {
      throw new Error("Title, content, and category are required");
    }

    const data: CreateBlogDto = {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      imageUrl,
    };
    
    console.log("Blog data:", data);
    
    const blog = await blogService.createBlogPost(userId, data);
    new CustomResponse(200, true, "Blog created successfully", res, blog);
  } catch (error) {
    console.error("Blog creation error:", error);
    if (error instanceof Error) {
      next(new InternalServerError(error.message));
    } else {
      next(new InternalServerError("Failed to create blog post."));
    }
  }
};

export const getBlogPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id as string;

  if (!userId) {
     res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return;
  }

  try {
    const filter: BlogFilterDto = {
      category: req.query.category as "Internal Blog" | "External Blog" | "Campaigns",
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
    };
    const blogs = await blogService.getBlogPosts(userId, filter);
    new CustomResponse(200, true, "Blog fetched successfully", res, blogs);
  } catch (error) {
    next(new InternalServerError("Failed to fetch blog posts."));
  }
};

export const updateBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id as string;
  const id = req.params.id as string;

  if (!userId || !id) {
     res.status(400).json({
      status: "failed",
      message: "User ID and blog ID are required",
      succeeded: false,
    });
    return;
  }

  try {
   
    await new Promise((resolve, reject) => {
      singleupload(req, res, (err :any) => {
        if (err) reject(err);
        else resolve(null);
      });
    });

    let imageUrl: string | null = null;
    if (req.file) {
      // Convert file buffer to Data URI
      const fileUri = getDataUri(req.file as any); 
      // Upload to Cloudinary using Data URI
      const uploadResult = await cloudinary.uploader.upload(fileUri.content, {
        folder: "blog_images",
        resource_type: "image",
        allowed_formats: ["jpg", "png", "jpeg"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      });
      imageUrl = uploadResult.secure_url; 
    }

    const data: UpdateBlogDto = {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      imageUrl,
    };
    const blog = await blogService.updateBlogPost(userId, id, data);
    new CustomResponse(200, true, "Updated successfully", res, blog);
  } catch (error) {
    next(new InternalServerError("Failed to update blog post."));
  }
};

export const deleteBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id as string;
  const id = req.params.id as string;

  if (!userId || !id) {
     res.status(400).json({
      status: "failed",
      message: "User ID and blog ID are required",
      succeeded: false,
    });
    return;
  }

  try {
    await blogService.deleteBlogPost(userId, id);
    new CustomResponse(200, true, "Blog deleted", res);
  } catch (error) {
    next(new InternalServerError("Failed to delete blog post."));
  }
};