import { Prisma, PrismaClient } from "@prisma/client";
import { InternalServerError } from "../../../lib/appError";
import {
  CreateBlogDto,
  UpdateBlogDto,
  BlogFilterDto,
  BlogResponse,
  BlogPost,
} from "../dtos/blog.dto";

const prisma = new PrismaClient();

export class BlogService {
  private prisma: PrismaClient = prisma;

  async createBlogPost(userId: string, data: CreateBlogDto): Promise<BlogPost> {
    try {
      const blog = await this.prisma.blog.create({
        data: {
          userId, 
          title: data.title,
          content: data.content,
          category: data.category,
          imageUrl: data.imageUrl,
        },
      });
      return {
        id: blog.id,
        title: blog.title,
        content: blog.content,
        category: blog.category,
        imageUrl: blog.imageUrl,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      };
    } catch (error) {
      console.error("[createBlogPost] Prisma error:", error);
      throw new InternalServerError("Failed to create blog post.");
    }
  }

  async getBlogPosts(filter: BlogFilterDto): Promise<BlogResponse> {
    try {
      const { category, page = 1, limit = 10 } = filter;
      const skip = (page - 1) * limit;

      const whereClause: Prisma.BlogWhereInput = {
        ...(category && { category: { equals: category, mode: "insensitive" } }),
      };

      const blogs = await this.prisma.blog.findMany({
        where: whereClause,
        take: limit,
        skip,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const totalCount = await this.prisma.blog.count({ where: whereClause });

      const data: BlogPost[] = blogs.map((b) => ({
        id: b.id,
        title: b.title,
        content: b.content,
        category: b.category,
        imageUrl: b.imageUrl,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      }));

      return { data, totalCount };
    } catch (error) {
      console.error("[getBlogPosts] Prisma error:", error);
      throw new InternalServerError("Failed to fetch blog posts.");
    }
  }

  async getBlogPost(id: string): Promise<BlogPost> {
    try {
      const blog = await this.prisma.blog.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          imageUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!blog) {
        throw new InternalServerError("Blog post not found.");
      }

      return {
        id: blog.id,
        title: blog.title,
        content: blog.content,
        category: blog.category,
        imageUrl: blog.imageUrl,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      };
    } catch (error) {
      console.error("[getBlogPost] Prisma error:", error);
      throw new InternalServerError("Failed to fetch blog post.");
    }
  }

  async updateBlogPost(userId: string, id: string, data: Partial<UpdateBlogDto>): Promise<BlogPost> {
    try {
      const blog = await this.prisma.blog.update({
        where: { id }, // Use id only; userId should be part of authorization logic if needed
        data: {
          ...data, // Spread the partial data object
          updatedAt: new Date(), // Only update if schema manages this; remove if @updatedAt is used
        },
      });
      return {
        id: blog.id,
        title: blog.title,
        content: blog.content,
        category: blog.category,
        imageUrl: blog.imageUrl,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      };
    } catch (error) {
      console.error("[updateBlogPost] Prisma error:", error);
      throw new InternalServerError("Failed to update blog post.");
    }
  }

  async deleteBlogPost(id: string): Promise<void> {
    try {
      await this.prisma.blog.delete({
        where: { id },
      });
    } catch (error) {
      console.error("[deleteBlogPost] Prisma error:", error);
      throw new InternalServerError("Failed to delete blog post.");
    }
  }
}