import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { BlogDTO } from "../dtos/blog.dto";
import { FileData, getDataUri } from "../../../middlewares/multer";
import { cloudinary } from "../../../configs/cloudinary";
import { blogSchema } from "../../../validations/blog.validation";

const prisma = new PrismaClient();

const blogController = {
  async addBlog(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id as string;
    if (!userId) {
      res.status(401).json({
        status: "failed",
        message: "Unauthorized access",
        succeeded: false,
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: "Image is required file" });
      return;
    }

    const { error, value: rawData } = blogSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      res.status(400).json({ error: error.details[0].message });
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

    // Prepare blog data
    const blogData: BlogDTO = {
      title: rawData.title,
      content: rawData.content,
      author: rawData.author,
      category: rawData.category,
      imageUrl,
      socialMediaLinks: rawData.socialMediaLinks || [],
      tags: rawData.tags || [],
      createdAt: rawData.createdAt || new Date(),
    };

    try {
      const uniqueTags = [...new Set(blogData.tags)];
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
      res.status(400).json({ error: err.message });
    } finally {
      await prisma.$disconnect();
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
    } finally {
      await prisma.$disconnect();
    }
  },

  async getBlog(req: Request, res: Response) {
    try {
      const { id } = req.params;
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
    } finally {
      await prisma.$disconnect();
    }
  },
};

export { blogController };
export const { addBlog, getPosts, getBlog } = blogController;
