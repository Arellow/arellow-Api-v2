import { PrismaClient, Blog, BlogCategory, UserRole } from "@prisma/client";
import { CreateBlogDto, UpdateBlogDto, BlogPost } from "../dtos/blog.dto";
import { InternalServerError, BadRequestError } from "../../../lib/appError";

export class BlogService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  private calculateTimeToRead(content: string): number {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes > 0 ? minutes : 1;
  }
  async createBlogPost(
    userId: string,
    data: CreateBlogDto,
    isEligibleForFeatured: boolean = false
  ): Promise<BlogPost> {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new BadRequestError("User not found.");
      let socialMediaLinks: string[] = [];
      if (data.socialMediaLinks) {
        try {
          socialMediaLinks = Array.isArray(data.socialMediaLinks)
            ? data.socialMediaLinks
            : JSON.parse(data.socialMediaLinks);
          if (
            !Array.isArray(socialMediaLinks) ||
            !socialMediaLinks.every((item) => typeof item === "string")
          ) {
            throw new Error("socialMediaLinks must be an array of strings");
          }
        } catch (e) {
          throw new BadRequestError(
            "Invalid socialMediaLinks format. Expected a JSON array of strings."
          );
        }
      }

      let tags: string[] = [];
      if (data.tags) {
        try {
          tags = Array.isArray(data.tags) ? data.tags : JSON.parse(data.tags);
          if (
            !Array.isArray(tags) ||
            !tags.every((item) => typeof item === "string")
          ) {
            throw new Error("tags must be an array of strings");
          }
        } catch (e) {
          throw new BadRequestError(
            "Invalid tags format. Expected a JSON array of strings."
          );
        }
      }
      if (!user) throw new BadRequestError("User not found.");

      const timeToRead = this.calculateTimeToRead(data.content);
      const blog = await this.prisma.blog.create({
        data: {
          userId,
          title: data.title,
          content: data.content,
          tags, 
          category: data.category as BlogCategory,
          imageUrl: data.imageUrl || null,
          author: data.author || user.fullname,
          socialMediaLinks,
          createdAt: new Date(),
          updatedAt: new Date(),
          timeToRead,
        },
      });

      if (isEligibleForFeatured) {
        if (user && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
          await this.prisma.blogFeaturedContributor.create({
            data: {
              userId,
              blogId: blog.id,
            },
          });
        }
      }

      return {
        id: blog.id,
        title: blog.title,
        author: blog.author,
        isPublished: blog.isPublished,
        tags: blog.tags,
        timeToRead: blog.timeToRead,
        content: blog.content,
        category:
          blog.category === "INTERNAL" ? "Internal Blog" : "External Blog",
        imageUrl: blog.imageUrl,
        socialMediaLinks: blog.socialMediaLinks,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      };
    } catch (error) {
      console.error("[createBlogPost] Prisma error:", error);
      throw new InternalServerError("Failed to create blog post.");
    }
  }



  async trendingBlog(): Promise<BlogPost[]> {
  try {
    const blogs = await this.prisma.blog.findMany({
      include: {
        user: { select: { fullname: true, avatar: true } },
        featuredContributors: true,
      },
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 4, 
    });

    return blogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      isPublished: blog.isPublished,
      tags: blog.tags || [],
      category: blog.category === "INTERNAL" ? "Internal Blog" : "External Blog",
      imageUrl: blog.imageUrl,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      author: blog.author || "Anonymous",
      authorAvatar: blog.user.avatar || null,
      socialMediaLinks: blog.socialMediaLinks || [], 
      timeToRead: blog.timeToRead || 0, 
      featuredContributors: blog.featuredContributors.map((fc) => ({
        id: fc.id,
        userId: fc.userId,
        userFullname: blog.user.fullname , 
        userAvatar: blog.user.avatar || null,
      


      })),
    }));
  } catch (error) {
    console.error("[getBlogs] Prisma error:", error);
    throw new InternalServerError("Failed to retrieve blogs.");
  }
}
  async getBlogs(): Promise<BlogPost[]> {
  try {
    const blogs = await this.prisma.blog.findMany({
      include: {
        user: { select: { fullname: true, avatar: true } },
        featuredContributors: true,
      },
      where: { isPublished: true },
      take: 6,
    });

    return blogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      isPublished: blog.isPublished,
      tags: blog.tags || [],
      category: blog.category === "INTERNAL" ? "Internal Blog" : "External Blog",
      imageUrl: blog.imageUrl,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      author: blog.author || "Anonymous",
      authorAvatar: blog.user.avatar || null,
      socialMediaLinks: blog.socialMediaLinks || [], 
      timeToRead: blog.timeToRead || 0, 
      featuredContributors: blog.featuredContributors.map((fc) => ({
        id: fc.id,
        userId: fc.userId,
        userFullname: blog.user.fullname , 
        userAvatar: blog.user.avatar || null,
      


      })),
    }));
  } catch (error) {
    console.error("[getBlogs] Prisma error:", error);
    throw new InternalServerError("Failed to retrieve blogs.");
  }
}
  async getTrendingBlogs(): Promise<BlogPost[]> {
  try {
    const blogs = await this.prisma.blog.findMany({
      include: {
        user: { select: { fullname: true, avatar: true } },
        featuredContributors: true,
      },
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 10, 
    });

    return blogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      content: blog.content,
      isPublished: blog.isPublished,
      tags: blog.tags || [],
      category: blog.category === "INTERNAL" ? "Internal Blog" : "External Blog",
      imageUrl: blog.imageUrl,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      author: blog.author || "Anonymous",
      authorAvatar: blog.user.avatar || null,
      socialMediaLinks: blog.socialMediaLinks || [], 
      timeToRead: blog.timeToRead || 0, 
      featuredContributors: blog.featuredContributors.map((fc) => ({
        id: fc.id,
        userId: fc.userId,
        userFullname: blog.user.fullname , 
        userAvatar: blog.user.avatar || null,
      


      })),
    }));
  } catch (error) {
    console.error("[getBlogs] Prisma error:", error);
    throw new InternalServerError("Failed to retrieve blogs.");
  }
}

async getBlog(id: string): Promise<BlogPost> {
  try {
    const blog = await this.prisma.blog.findUnique({
      where: { id },
      include: {
        user: { select: { fullname: true, avatar: true } },
        featuredContributors: true,
      },
    });

    if (!blog) {
      throw new BadRequestError("Blog not found.");
    }

    return {
      id: blog.id,
      title: blog.title,
      content: blog.content,
      isPublished: blog.isPublished,
      tags: blog.tags || [], 
      category: blog.category === "INTERNAL" ? "Internal Blog" : "External Blog",
      imageUrl: blog.imageUrl,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      author: blog.author || "Anonymous",
      authorAvatar: blog.user.avatar || null,
      socialMediaLinks: blog.socialMediaLinks || [], 
      timeToRead: blog.timeToRead || 5, 
      featuredContributors: blog.featuredContributors.map((fc) => ({
        id: fc.id,
        userId: fc.userId,
        userFullname: blog.user.fullname,
        userAvatar: blog.user.avatar || null,
      })),
    };
  } catch (error) {
    console.error("[getBlog] Prisma error:", error);
    if (error instanceof BadRequestError) throw error;
    throw new InternalServerError("Failed to retrieve blog.");
  }
}
   async updateBlog(id: string, userId: string, data: UpdateBlogDto): Promise<BlogPost> {
    try {
      const existingBlog = await this.prisma.blog.findUnique({ where: { id } });
      if (!existingBlog) {
        throw new BadRequestError("Blog not found.");
      }
      if (existingBlog.userId !== userId && userId !== "SUPER_ADMIN") {
        throw new BadRequestError("Unauthorized to update this blog.");
      }

      const timeToRead = data.content ? this.calculateTimeToRead(data.content) : existingBlog.timeToRead;

      const updatedBlog = await this.prisma.blog.update({
        where: { id },
        data: {
          title: data.title || existingBlog.title,
          content: data.content || existingBlog.content,
          category: data.category ? (data.category as BlogCategory) : existingBlog.category,
          imageUrl: data.imageUrl || existingBlog.imageUrl,
          author: data.author || existingBlog.author,
          timeToRead,
          isPublished: data.isPublished ?? existingBlog.isPublished,
          updatedAt: new Date(),
        },
        include: {
          user: { select: { fullname: true, avatar: true } },
          featuredContributors: true,
        },
      });

      return {
        id: updatedBlog.id,
        title: updatedBlog.title,
        content: updatedBlog.content,
        category: updatedBlog.category === "INTERNAL" ? "Internal Blog" : "External Blog",
        imageUrl: updatedBlog.imageUrl,
        isPublished: updatedBlog.isPublished,
        createdAt: updatedBlog.createdAt,
        updatedAt: updatedBlog.updatedAt,
        author: updatedBlog.user.fullname || 'Anonymous',
        authorAvatar: updatedBlog.user.avatar || null,
        featuredContributors: updatedBlog.featuredContributors.map(fc => ({
          id: fc.id,
          userId: fc.userId,
        })),
        timeToRead: updatedBlog.timeToRead,
      };
    } catch (error) {
      console.error("[updateBlog] Prisma error:", error);
      if (error instanceof BadRequestError) throw error;
      throw new InternalServerError("Failed to update blog.");
    }
  }

  async deleteBlog(id: string, userId: string): Promise<void> {
    try {
      const blog = await this.prisma.blog.findUnique({ where: { id } });
      if (!blog) {
        throw new BadRequestError("Blog not found.");
      }
      if (blog.userId !== userId && userId !== "SUPER_ADMIN") {
        throw new BadRequestError("Unauthorized to delete this blog.");
      }

      await this.prisma.blogFeaturedContributor.deleteMany({
        where: { blogId: id },
      });
      await this.prisma.blog.delete({ where: { id } });
    } catch (error) {
      console.error("[deleteBlog] Prisma error:", error);
      if (error instanceof BadRequestError) throw error;
      throw new InternalServerError("Failed to delete blog.");
    }
  }

   async getFeaturedContributorBlogs(): Promise<BlogPost[]> {
    try {
      const blogs = await this.prisma.blog.findMany({
        where: {
          featuredContributors: {
            some: {}, // Ensures blogs have at least one featured contributor
          },
          isPublished: true, // Only fetch published blogs
        },
        include: {
          user: { select: { fullname: true, avatar: true } },
          featuredContributors: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return blogs.map(blog => ({
        id: blog.id,
        title: blog.title,
        content: blog.content,
        isPublished: blog.isPublished,
        category: blog.category === "INTERNAL" ? "Internal Blog" : "External Blog",
        imageUrl: blog.imageUrl,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
        author: blog.user.fullname || 'Anonymous',
        authorAvatar: blog.user.avatar || null,
        featuredContributors: blog.featuredContributors.map(fc => ({
          id: fc.id,
          userId: fc.userId,
          userFullname: blog.user.fullname,
          userAvatar: blog.user.avatar || null,
        })),
        timeToRead: blog.timeToRead,
      }));
    } catch (error) {
      console.error("[getFeaturedContributorBlogs] Prisma error:", error);
      throw new InternalServerError("Failed to retrieve featured contributor blogs.");
    }
  }

  async getNumberOfPropertiesListed(): Promise<number> {
    try {
      const count = await this.prisma.property.count({
        // where: { isA: true },
      });
      return count;
    } catch (error) {
      console.error("[getNumberOfProjectListed] Prisma error:", error);
      throw new InternalServerError("Failed to retrieve number of blogs listed.");
    }
  }
}
