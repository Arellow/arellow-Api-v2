import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { BlogDTO } from "../dtos/blog.dto";
import { FileData, getDataUri } from "../../../middlewares/multer";
import { cloudinary } from "../../../configs/cloudinary";

const prisma = new PrismaClient();

const blogController = {
 
 async addBlog(req: Request, res: Response, next: NextFunction) {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({
      status: "failed",
      message: "Unauthorized access, userId is required",
      succeeded: false,
    });
    return;
  }

  let imageUrl: string | undefined;

  if (req.file) {
    try {
      const fileData: FileData = {
        originalname: req.file.originalname,
        buffer: req.file.buffer,
      };

      const dataUri = getDataUri(fileData);

      const result = await cloudinary.uploader.upload(dataUri.content, {
        folder: "Arellow_blog_images",
        resource_type: "image",
        allowed_formats: ["jpg", "png", "jpeg"],
        transformation: [{ width: 500, height: 500, crop: "limit" }],
      });
      imageUrl = result.secure_url;
    } catch (uploadErr) {
      res.status(500).json({ error: "Failed to upload image to Cloudinary" });
      return;
    }
  }

  let socialMediaLinks: string[] = [];
  if (req.body.socialMediaLinks) {
    try {
      const parsedLinks = typeof req.body.socialMediaLinks === "string"
        ? JSON.parse(req.body.socialMediaLinks)
        : req.body.socialMediaLinks;
      socialMediaLinks = Array.isArray(parsedLinks) ? parsedLinks : [parsedLinks.toString()];
    } catch (e) {
      socialMediaLinks = req.body.socialMediaLinks ? [req.body.socialMediaLinks.toString()] : [];
    }
  }

  const blogData: BlogDTO = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    category: req.body.category,
    imageUrl,
    socialMediaLinks,
    tags: req.body.tags || [],
    createdAt: req.body.createdAt || new Date(),
  };

  try {
    const uniqueTags = [...new Set(blogData.tags)];

    // Only check for duplicates if tags are not empty
    if (uniqueTags.length > 0) {
      const existingBlog = await prisma.blog.findFirst({
        where: {
          tags: {
            equals: uniqueTags,
          },
          userId,
        },
      });

      if (existingBlog) {
        res.status(409).json({
          status: "failed",
          message: "A blog post with the same tags already exists for this user.",
          succeeded: false,
        });
        return;
      }
    }

    const blog = await prisma.blog.create({
      data: {
        title: blogData.title,
        content: blogData.content,
        author: blogData.author,
        category: blogData.category,
        imageUrl: blogData.imageUrl,
        socialMediaLinks: blogData.socialMediaLinks,
        tags: uniqueTags,
        createdAt: blogData.createdAt,
        userId,
      },
    });
    res.status(201).json({
      status: "success",
      message: "Blog created successfully",
      succeeded: true,
      data: blog,
    });
  } catch (err: any) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      res.status(400).json({
        error: "A blog post with the same tags already exists. Please use a different set of tags.",
      });
    } else {
      res.status(400).json({ error: err.message || "Failed to create blog post" });
    }
  }
},

  async getPosts(req: Request, res: Response) {
    try {
      const blogs = await prisma.blog.findMany({
        orderBy: { createdAt: "desc" },
      });
      res.status(200).json({
        status: "success",
        message: "Blog posts retrieved",
        succeeded: true,
        data: blogs,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  async getBlog(req: Request, res: Response) {
    try {
      const { id } = req.params as { id?: string };
      if (!id) {
        res.status(400).json({
          status: "failed",
          message: "Blog ID is required",
          succeeded: false,
        });
        return;
      }

      const blog = await prisma.blog.findUnique({
        where: { id },
      });

      if (!blog) {
        res.status(404).json({
          status: "failed",
          message: "Blog post not found",
          succeeded: false,
        });
        return;
      }

      res.status(200).json({
        status: "success",
        message: "Blog post retrieved",
        succeeded: true,
        data: blog,
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
};

export { blogController };
export const { addBlog, getPosts, getBlog } = blogController;