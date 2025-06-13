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
exports.deleteBlogPost = exports.updateBlogPost = exports.getBlogPosts = exports.createBlogPost = void 0;
const blog_service_1 = require("../services/blog.service");
const appError_1 = require("../../../lib/appError");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const multer_1 = require("../../../middlewares/multer");
const cloudinary_1 = require("cloudinary");
const blogService = new blog_service_1.BlogService();
const createBlogPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        // Handle file upload with singleupload middleware
        yield new Promise((resolve, reject) => {
            (0, multer_1.singleupload)(req, res, (err) => {
                if (err)
                    reject(err);
                else
                    resolve(null);
            });
        });
        let imageUrl = null;
        if (req.file) {
            // Convert file buffer to Data URI
            const fileUri = (0, multer_1.getDataUri)(req.file);
            // Upload to Cloudinary using Data URI
            const uploadResult = yield cloudinary_1.v2.uploader.upload(fileUri.content, {
                folder: "blog_images",
                resource_type: "image",
                allowed_formats: ["jpg", "png", "jpeg"],
                transformation: [{ width: 500, height: 500, crop: "limit" }],
            });
            imageUrl = uploadResult.secure_url;
        }
        const data = {
            title: req.body.title,
            content: req.body.content,
            category: req.body.category,
            imageUrl,
        };
        const blog = yield blogService.createBlogPost(userId, data);
        new response_util_1.default(200, true, "Blog created successfully", res, blog);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to create blog post."));
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
        const blogs = yield blogService.getBlogPosts(userId, filter);
        new response_util_1.default(200, true, "Blog fetched successfully", res, blogs);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch blog posts."));
    }
});
exports.getBlogPosts = getBlogPosts;
const updateBlogPost = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
        yield new Promise((resolve, reject) => {
            (0, multer_1.singleupload)(req, res, (err) => {
                if (err)
                    reject(err);
                else
                    resolve(null);
            });
        });
        let imageUrl = null;
        if (req.file) {
            // Convert file buffer to Data URI
            const fileUri = (0, multer_1.getDataUri)(req.file);
            // Upload to Cloudinary using Data URI
            const uploadResult = yield cloudinary_1.v2.uploader.upload(fileUri.content, {
                folder: "blog_images",
                resource_type: "image",
                allowed_formats: ["jpg", "png", "jpeg"],
                transformation: [{ width: 500, height: 500, crop: "limit" }],
            });
            imageUrl = uploadResult.secure_url;
        }
        const data = {
            title: req.body.title,
            content: req.body.content,
            category: req.body.category,
            imageUrl,
        };
        const blog = yield blogService.updateBlogPost(userId, id, data);
        new response_util_1.default(200, true, "Updated successfully", res, blog);
    }
    catch (error) {
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
        yield blogService.deleteBlogPost(userId, id);
        new response_util_1.default(200, true, "Blog deleted", res);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to delete blog post."));
    }
});
exports.deleteBlogPost = deleteBlogPost;
