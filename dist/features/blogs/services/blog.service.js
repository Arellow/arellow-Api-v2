"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../../lib/appError");
const prisma = new client_1.PrismaClient();
class BlogService {
    constructor() {
        this.prisma = prisma;
    }
    async createBlogPost(userId, data) {
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
        }
        catch (error) {
            console.error("[createBlogPost] Prisma error:", error);
            throw new appError_1.InternalServerError("Failed to create blog post.");
        }
    }
    async getBlogPosts(filter) {
        try {
            const { category, page = 1, limit = 10 } = filter;
            const skip = (page - 1) * limit;
            const whereClause = {
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
            const data = blogs.map((b) => ({
                id: b.id,
                title: b.title,
                content: b.content,
                category: b.category,
                imageUrl: b.imageUrl,
                createdAt: b.createdAt,
                updatedAt: b.updatedAt,
            }));
            return { data, totalCount };
        }
        catch (error) {
            console.error("[getBlogPosts] Prisma error:", error);
            throw new appError_1.InternalServerError("Failed to fetch blog posts.");
        }
    }
    async getBlogPost(id) {
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
                throw new appError_1.InternalServerError("Blog post not found.");
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
        }
        catch (error) {
            console.error("[getBlogPost] Prisma error:", error);
            throw new appError_1.InternalServerError("Failed to fetch blog post.");
        }
    }
    async updateBlogPost(userId, id, data) {
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
        }
        catch (error) {
            console.error("[updateBlogPost] Prisma error:", error);
            throw new appError_1.InternalServerError("Failed to update blog post.");
        }
    }
    async deleteBlogPost(id) {
        try {
            await this.prisma.blog.delete({
                where: { id },
            });
        }
        catch (error) {
            console.error("[deleteBlogPost] Prisma error:", error);
            throw new appError_1.InternalServerError("Failed to delete blog post.");
        }
    }
}
exports.BlogService = BlogService;
