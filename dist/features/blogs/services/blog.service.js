"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogService = void 0;
const client_1 = require("@prisma/client");
const appError_1 = require("../../../lib/appError");
const prisma = new client_1.PrismaClient();
class BlogService {
    constructor() {
        this.prisma = prisma;
    }
    createBlogPost(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const blog = yield this.prisma.blog2.create({
                    data: {
                        userId,
                        title: data.title,
                        content: data.content,
                        category: data.category,
                        imageUrl: data.imageUrl || null,
                        createdAt: new Date(),
                        updatedAt: new Date(),
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
        });
    }
    getBlogPosts(userId, filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category, page = 1, limit = 10 } = filter;
                const skip = (page - 1) * limit;
                const whereClause = Object.assign({ userId }, (category && { category: { equals: category, mode: "insensitive" } }));
                const blogs = yield this.prisma.blog2.findMany({
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
                const totalCount = yield this.prisma.blog2.count({ where: whereClause });
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
        });
    }
    updateBlogPost(userId, id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const blog = yield this.prisma.blog2.update({
                    where: { id },
                    data: {
                        title: data.title,
                        content: data.content,
                        category: data.category,
                        imageUrl: data.imageUrl || undefined,
                        updatedAt: new Date(),
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
        });
    }
    deleteBlogPost(userId, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.blog2.delete({
                    where: { id }, // Use 'id' if it's the unique identifier; adjust if needed
                });
            }
            catch (error) {
                console.error("[deleteBlogPost] Prisma error:", error);
                throw new appError_1.InternalServerError("Failed to delete blog post.");
            }
        });
    }
}
exports.BlogService = BlogService;
