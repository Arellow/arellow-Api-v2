
import { Request, Response, NextFunction } from "express";
import { BlogService } from "../services/blog.service";
import { BadRequestError, InternalServerError } from "../../../lib/appError";
import { CreateBlogDto, UpdateBlogDto, BlogFilterDto } from "../dtos/blog.dto";
import CustomResponse from "../../../utils/helpers/response.util";
import { singleupload, getDataUri } from "../../../middlewares/multer";
import { cloudinary } from "../../../configs/cloudinary"; // Updated import

const blogService = new BlogService();

export const createBlogPost = async (
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
    } else {
      console.log("No file uploaded, imageUrl remains null");
    }

    // Validate and construct data
    const rawData = req.body;
    if (!rawData.title || !rawData.content) {
      throw new BadRequestError("Title and content are required");
    }
    if (rawData.category !== "Internal Blog" && rawData.category !== "External Blog") {
      throw new BadRequestError("Category must be 'Internal Blog' or 'External Blog'");
    }

    const data: CreateBlogDto = {
      title: rawData.title as string,
      content: rawData.content as string,
      category: rawData.category as "Internal Blog" | "External Blog",
      imageUrl,
    };
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
    const blogs = await blogService.getBlogPosts( filter);
    new CustomResponse(200, true, "Blog fetched successfully", res, blogs);
  } catch (error) {
    next(new InternalServerError("Failed to fetch blog posts."));
  }
};

export const getBlogPost = async (
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
    const blog = await blogService.getBlogPost(id);
    console.log("Service returned blog:", blog);
    new CustomResponse(200, true, "Blog fetched successfully", res, blog);
  } catch (error) {
    console.error("Blog fetch error:", error);
    next(new InternalServerError("Failed to fetch blog post."));
  }
};


export const updateBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.user?.id as string;
  const id = req.params.id as string;

  console.log("Entering updateBlogPost, req.user:", req.user, "req.body:", req.body, "req.file:", req.file, "req.params.id:", id);

  if (!userId || !id) {
    res.status(400).json({
      status: "failed",
      message: "User ID and blog ID are required",
      succeeded: false,
    });
    return;
  }

  try {
    let imageUrl: string | null = null; 
    if (req.file) {
      try {
        console.log("Processing file upload, req.file:", req.file);
        const fileUri = getDataUri(req.file as any);
        console.log("Generated Data URI (first 50 chars):", fileUri.content.substring(0, 50) + "...");
        const uploadResult = await cloudinary.uploader.upload(fileUri.content, {
          folder: "blog_images",
          resource_type: "image",
          allowedFormats: ["jpg", "png", "jpeg"],
          transformation: [{ width: 500, height: 500, crop: "limit" }],
        });
        imageUrl = uploadResult.secure_url;
        console.log("Cloudinary upload successful, imageUrl:", imageUrl);
      } catch (uploadError) {
        console.error("Cloudinary upload error:", uploadError);
        throw new Error("Failed to upload image to Cloudinary");
      }
    }

    // Construct data object with only provided fields
    const data: Partial<UpdateBlogDto> = {};
    if (req.body.title !== undefined) data.title = req.body.title;
    if (req.body.content !== undefined) data.content = req.body.content;
    if (req.body.category !== undefined) data.category = req.body.category;
    if (imageUrl !== undefined) data.imageUrl = imageUrl; // Only include if a new image is uploaded

    console.log("Constructed data for service:", data);

    if (Object.keys(data).length === 0) {
      res.status(400).json({
        status: "failed",
        message: "No fields provided for update",
        succeeded: false,
      });
      return;
    }

    const blog = await blogService.updateBlogPost(userId, id, data);
    console.log("Service returned blog:", blog);
    new CustomResponse(200, true, "Updated successfully", res, blog);
  } catch (error) {
    console.error("Blog update error:", error);
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
    await blogService.deleteBlogPost(id);
    new CustomResponse(200, true, "Blog deleted", res);
  } catch (error) {
    next(new InternalServerError("Failed to delete blog post."));
  }
};