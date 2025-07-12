import { Request, Response, NextFunction } from "express";
import { BlogService } from "../services/blog.service";
import { CreateBlogDto, UpdateBlogDto } from "../dtos/blog.dto";
import { InternalServerError, BadRequestError } from "../../../lib/appError";
import  CustomResponse  from "../../../utils/helpers/response.util";
import { getDataUri } from "../../../middlewares/multer";
import { cloudinary } from "../../../configs/cloudinary";
import { UserRole } from "@prisma/client";

const blogService = new BlogService();

export const createBlogPost = async (
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
    let imageUrl: string | null = null;
    if (req.file) {
      try {
        const fileUri = getDataUri(req.file as any);
        const uploadResult = await cloudinary.uploader.upload(fileUri.content, {
          folder: "Arellow_blog_images",
          resource_type: "image",
          allowedFormats: ["jpg", "png", "jpeg"],
          transformation: [{ width: 500, height: 500, crop: "limit" }],
        });
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        throw new BadRequestError("Failed to upload image to Cloudinary");
      }
    } else {
      console.log("No file uploaded, imageUrl remains null");
    }

    const rawData = req.body;
    // Validate required fields
    if (!rawData.title || !rawData.content) {
      throw new BadRequestError("Title and content are required");
    }
    if (rawData.category !== "INTERNAL" && rawData.category !== "EXTERNAL") {
      throw new BadRequestError("Category must be 'INTERNAL' or 'EXTERNAL' ");
    }
  

    const data: CreateBlogDto = {
      title: rawData.title as string,
      content: rawData.content as string,
      category: rawData.category as "Internal Blog" | "External Blog",
      imageUrl,
      author: rawData.author as string || undefined, // Optional author field
      tags: rawData.tags ? (rawData.tags as string[]) : undefined, // Optional tags field
      socialMediaLinks: rawData.socialMediaLinks ? (rawData.socialMediaLinks as string[]) : undefined, // Optional social media links field   

    };

    const userRole = (req.user?.role as UserRole) || "BUYER";
    const isEligibleForFeatured = userRole !== "ADMIN" && userRole !== "SUPER_ADMIN";

    const blog = await blogService.createBlogPost(userId, data, isEligibleForFeatured);
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


export const publishBlog = async (
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
    const { id } = req.params;
    const blog = await blogService.updateBlog(id, userId, { isPublished: true });
    new CustomResponse(200, true, "Blog published successfully", res, blog);
  } catch (error) {
    console.error("Publish blog error:", error);
    if (error instanceof BadRequestError) {
      next(error);
    } else {
      next(new InternalServerError("Failed to publish blog."));
    }
  }
};


export const getBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blogs = await blogService.getBlogs();
    new CustomResponse(200, true, "Blogs retrieved successfully", res, blogs);
  } catch (error) {
    console.error("Get blogs error:", error);
    next(new InternalServerError("Failed to retrieve blogs."));
  }
};

export const trendingBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blogs = await blogService.getTrendingBlogs();
    new CustomResponse(200, true, "Blogs retrieved successfully", res, blogs);
  } catch (error) {
    console.error("Get blogs error:", error);
    next(new InternalServerError("Failed to retrieve blogs."));
  }
};

export const getBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const blog = await blogService.getBlog(id);
    new CustomResponse(200, true, "Blog retrieved successfully", res, blog);
  } catch (error) {
    console.error("Get blog error:", error);
    if (error instanceof BadRequestError) {
      next(error);
    } else {
      next(new InternalServerError("Failed to retrieve blog."));
    }
  }
};

export const updateBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id as string;
  if (!userId) {
    console.log("Unauthorized access detected");
    res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return;
  }

  try {
    let imageUrl: string | null = null;
    if (req.file) {
      try {
        const fileUri = getDataUri(req.file as any);
        const uploadResult = await cloudinary.uploader.upload(fileUri.content, {
          folder: "blog_images",
          resource_type: "image",
          allowedFormats: ["jpg", "png", "jpeg"],
          transformation: [{ width: 500, height: 500, crop: "limit" }],
        });
        imageUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        throw new BadRequestError("Failed to upload image to Cloudinary");
      }
    }

    const { id } = req.params;
    const rawData = req.body;
    const data: UpdateBlogDto = {
      title: rawData.title,
      content: rawData.content,
      category: rawData.category,
      imageUrl,
    };

    const blog = await blogService.updateBlog(id, userId, data);
    new CustomResponse(200, true, "Blog updated successfully", res, blog);
  } catch (error) {
    console.error("Update blog error:", error);
    if (error instanceof BadRequestError) {
      next(error);
    } else {
      next(new InternalServerError("Failed to update blog."));
    }
  }
};

export const deleteBlog = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id as string;
  if (!userId) {
    console.log("Unauthorized access detected");
    res.status(401).json({
      status: "failed",
      message: "Unauthorized access",
      succeeded: false,
    });
    return;
  }

  try {
    const { id } = req.params;
    await blogService.deleteBlog(id, userId);
    new CustomResponse(200, true, "Blog deleted successfully", res);
  } catch (error) {
    console.error("Delete blog error:", error);
    if (error instanceof BadRequestError) {
      next(error);
    } else {
      next(new InternalServerError("Failed to delete blog."));
    }
  }
};

export const getFeaturedContributorBlogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const blogs = await blogService.getFeaturedContributorBlogs();
    new CustomResponse(200, true, "Featured contributor blogs retrieved successfully", res, blogs);
  } catch (error) {
    console.error("Get featured contributor blogs error:", error);
    next(new InternalServerError("Failed to retrieve featured contributor blogs."));
  }
};