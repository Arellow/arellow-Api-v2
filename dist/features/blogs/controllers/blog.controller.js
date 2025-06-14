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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBlogPost = exports.updateBlogPost = exports.getBlogPost = exports.getBlogPosts = exports.createBlogPost = void 0;
const blog_service_1 = require("../services/blog.service");
const appError_1 = require("../../../lib/appError");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const multer_1 = require("../../../middlewares/multer");
const cloudinary_1 = require("../../../configs/cloudinary"); // Updated import
const blogService = new blog_service_1.BlogService();
const createBlogPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
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
        let imageUrl = null;
        if (req.file) {
            try {
                const fileUri = (0, multer_1.getDataUri)(req.file);
                const uploadResult = yield cloudinary_1.cloudinary.uploader.upload(fileUri.content, {
                    folder: "blog_images",
                    resource_type: "image",
                    allowedFormats: ["jpg", "png", "jpeg"],
                    transformation: [{ width: 500, height: 500, crop: "limit" }],
                });
                imageUrl = uploadResult.secure_url;
            }
            catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                throw new appError_1.BadRequestError("Failed to upload image to Cloudinary");
            }
        }
        else {
            console.log("No file uploaded, imageUrl remains null");
        }
        // Validate and construct data
        const rawData = req.body;
        if (!rawData.title || !rawData.content) {
            throw new appError_1.BadRequestError("Title and content are required");
        }
        if (rawData.category !== "Internal Blog" && rawData.category !== "External Blog") {
            throw new appError_1.BadRequestError("Category must be 'Internal Blog' or 'External Blog'");
        }
        const data = {
            title: rawData.title,
            content: rawData.content,
            category: rawData.category,
            imageUrl,
        };
        const blog = yield blogService.createBlogPost(userId, data);
        new response_util_1.default(200, true, "Blog created successfully", res, blog);
    }
    catch (error) {
        console.error("Blog creation error:", error);
        if (error instanceof Error) {
            next(new appError_1.InternalServerError(error.message));
        }
        else {
            next(new appError_1.InternalServerError("Failed to create blog post."));
        }
    }
});
exports.createBlogPost = createBlogPost;
const getBlogPosts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        res.status(401).json({
            status: "failed",
            message: "Unauthorized access",
            succeeded: false,
        });
        return;
    }
    try {
        const filter = {
            category: req.query.category,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 10,
        };
        const blogs = yield blogService.getBlogPosts(filter);
        new response_util_1.default(200, true, "Blog fetched successfully", res, blogs);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch blog posts."));
    }
});
exports.getBlogPosts = getBlogPosts;
const getBlogPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const id = req.params.id;
    if (!userId || !id) {
        res.status(400).json({
            status: "failed",
            message: "User ID and blog ID are required",
            succeeded: false,
        });
        return;
    }
    try {
        const blog = yield blogService.getBlogPost(id);
        console.log("Service returned blog:", blog);
        new response_util_1.default(200, true, "Blog fetched successfully", res, blog);
    }
    catch (error) {
        console.error("Blog fetch error:", error);
        next(new appError_1.InternalServerError("Failed to fetch blog post."));
    }
});
exports.getBlogPost = getBlogPost;
const updateBlogPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const id = req.params.id;
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
        let imageUrl = null;
        if (req.file) {
            try {
                console.log("Processing file upload, req.file:", req.file);
                const fileUri = (0, multer_1.getDataUri)(req.file);
                console.log("Generated Data URI (first 50 chars):", fileUri.content.substring(0, 50) + "...");
                const uploadResult = yield cloudinary_1.cloudinary.uploader.upload(fileUri.content, {
                    folder: "blog_images",
                    resource_type: "image",
                    allowedFormats: ["jpg", "png", "jpeg"],
                    transformation: [{ width: 500, height: 500, crop: "limit" }],
                });
                imageUrl = uploadResult.secure_url;
                console.log("Cloudinary upload successful, imageUrl:", imageUrl);
            }
            catch (uploadError) {
                console.error("Cloudinary upload error:", uploadError);
                throw new Error("Failed to upload image to Cloudinary");
            }
        }
        // Construct data object with only provided fields
        const data = {};
        if (req.body.title !== undefined)
            data.title = req.body.title;
        if (req.body.content !== undefined)
            data.content = req.body.content;
        if (req.body.category !== undefined)
            data.category = req.body.category;
        if (imageUrl !== undefined)
            data.imageUrl = imageUrl; // Only include if a new image is uploaded
        console.log("Constructed data for service:", data);
        if (Object.keys(data).length === 0) {
            res.status(400).json({
                status: "failed",
                message: "No fields provided for update",
                succeeded: false,
            });
            return;
        }
        const blog = yield blogService.updateBlogPost(userId, id, data);
        console.log("Service returned blog:", blog);
        new response_util_1.default(200, true, "Updated successfully", res, blog);
    }
    catch (error) {
        console.error("Blog update error:", error);
        next(new appError_1.InternalServerError("Failed to update blog post."));
    }
});
exports.updateBlogPost = updateBlogPost;
const deleteBlogPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const id = req.params.id;
    if (!userId || !id) {
        res.status(400).json({
            status: "failed",
            message: "User ID and blog ID are required",
            succeeded: false,
        });
        return;
    }
    try {
        yield blogService.deleteBlogPost(id);
        new response_util_1.default(200, true, "Blog deleted", res);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to delete blog post."));
    }
});
exports.deleteBlogPost = deleteBlogPost;
