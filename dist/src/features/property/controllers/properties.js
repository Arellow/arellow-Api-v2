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
exports.mediaForProperty = exports.statusProperty = exports.deleteProperty = exports.unArchiveProperty = exports.archiveProperty = exports.rejectProperty = exports.approveProperty = exports.getPropertiesByUser = exports.getLikedPropertiesByUser = exports.unLikeProperty = exports.likeProperty = exports.singleProperty = exports.createNewProperty = void 0;
const prisma_1 = require("../../../lib/prisma");
const response_util_1 = __importDefault(require("../../../utils/helpers/response.util"));
const appError_1 = require("../../../lib/appError");
const directMediaUploader_1 = require("../services/directMediaUploader");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ dest: 'tmp/', limits: { fileSize: 500 * 1024 * 1024 } });
const mediaUploader = new directMediaUploader_1.DirectMediaUploader();
const createNewProperty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { title, description, bathrooms, bedrooms, category, city, country, floors, location, neighborhood, price, squareMeters, state, features, } = req.body;
        const amenities = req.body.amenities || [];
        // Basic validation
        if (!title || !description) {
            return res.status(400).json({ error: 'Title and description are required' });
        }
        // Validate amenities format if provided
        if (amenities && !Array.isArray(amenities)) {
            return res.status(400).json({ error: 'Amenities must be an array' });
        }
        if (amenities) {
            for (const amenity of amenities) {
                if (typeof amenity.name !== 'string' || typeof amenity.photoUrl !== 'string') {
                    return res.status(400).json({ error: 'Each amenity must have name and photoUrl strings' });
                }
            }
        }
        if (features) {
            for (const amenity of amenities) {
                if (typeof amenity.name !== 'string' || typeof amenity.photoUrl !== 'string') {
                    return res.status(400).json({ error: 'Each amenity must have name and photoUrl strings' });
                }
            }
        }
        const propertyAmenities = amenities.map(amenity => {
            return { name: amenity.name, photoUrl: amenity.photoUrl };
        });
        // Create property
        const newProperty = yield prisma_1.Prisma.property.create({
            data: {
                title,
                description,
                amenities: {
                    create: propertyAmenities
                },
                userId,
                bathrooms,
                bedrooms,
                category,
                city,
                country,
                floors,
                location,
                neighborhood,
                price,
                squareMeters,
                state,
                features
            },
        });
        new response_util_1.default(201, true, "Featured projects fetched successfully", res, newProperty);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Internal server error", 500));
    }
});
exports.createNewProperty = createNewProperty;
const singleProperty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        // find single
        const response = yield prisma_1.Prisma.property.findUnique({
            where: { id },
            include: {
                amenities: true,
                user: {
                    include: { approvedProperties: true, },
                    omit: { password: true }
                }
            },
        });
        new response_util_1.default(201, true, "Featured projects fetched successfully", res, response);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Internal server error", 500));
    }
});
exports.singleProperty = singleProperty;
// likes a property
const likeProperty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const propertyId = req.params.id;
    try {
        // Check if already liked
        const existingLike = yield prisma_1.Prisma.userPropertyLike.findUnique({
            where: {
                userId_propertyId: {
                    userId,
                    propertyId,
                },
            },
        });
        if (existingLike) {
            next(new appError_1.InternalServerError("Property already liked", 400));
        }
        // Create like relation
        yield prisma_1.Prisma.userPropertyLike.create({
            data: {
                user: { connect: { id: userId } },
                property: { connect: { id: propertyId } },
            },
        });
        // Increment likes count
        yield prisma_1.Prisma.property.update({
            where: { id: propertyId },
            data: { likesCount: { increment: 1 } },
        });
        new response_util_1.default(200, true, "Property liked", res);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Internal server error", 500));
    }
});
exports.likeProperty = likeProperty;
// Unlike a property
const unLikeProperty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const propertyId = req.params.id;
    try {
        // Delete the like relation
        const deleteResult = yield prisma_1.Prisma.userPropertyLike.deleteMany({
            where: {
                userId,
                propertyId,
            },
        });
        if (deleteResult.count === 0) {
            next(new appError_1.InternalServerError("Like does not exist", 400));
        }
        // Decrement likes count
        yield prisma_1.Prisma.property.update({
            where: { id: propertyId },
            data: { likesCount: { decrement: 1 } },
        });
        new response_util_1.default(200, true, "Property unliked", res);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Internal server error", 500));
    }
});
exports.unLikeProperty = unLikeProperty;
const getLikedPropertiesByUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const likes = yield prisma_1.Prisma.userPropertyLike.findMany({
            where: { userId },
            include: {
                property: true,
            },
        });
        const properties = likes.map((like) => like.property);
        new response_util_1.default(200, true, "success", res, properties);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Failed to fetch liked properties", 500));
    }
});
exports.getLikedPropertiesByUser = getLikedPropertiesByUser;
const getPropertiesByUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { search, salesStatus, minPrice, maxPrice, page = "1", limit = "10" } = req.query;
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        const filters = {
            userId,
            AND: [
                search
                    ? {
                        OR: [
                            { title: { contains: search, mode: 'insensitive' } },
                            { category: { contains: search, mode: 'insensitive' } },
                            { city: { contains: search, mode: 'insensitive' } },
                            { state: { contains: search, mode: 'insensitive' } },
                            { country: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                    : undefined,
                salesStatus ? { salesStatus: salesStatus } : undefined,
                minPrice ? { price: { gte: parseFloat(minPrice) } } : undefined,
                maxPrice ? { price: { lte: parseFloat(maxPrice) } } : undefined
            ].filter(Boolean) // 👈 IMPORTANT: ensure no `undefined` entries
        };
        const [properties, total] = yield Promise.all([
            prisma_1.Prisma.property.findMany({
                where: filters,
                orderBy: { createdAt: "desc" },
                skip: (pageNumber - 1) * pageSize,
                take: pageSize
            }),
            prisma_1.Prisma.property.count({ where: filters })
        ]);
        const totalPages = Math.ceil(total / pageSize);
        const nextPage = pageNumber < totalPages ? pageNumber + 1 : null;
        const prevPage = pageNumber > 1 ? pageNumber - 1 : null;
        const canGoNext = pageNumber < totalPages;
        const canGoPrev = pageNumber > 1;
        new response_util_1.default(200, true, "success", res, {
            data: properties,
            pagination: {
                total,
                page: pageNumber,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
                nextPage,
                prevPage,
                canGoNext,
                canGoPrev
            }
        });
    }
    catch (error) {
        next(new appError_1.InternalServerError("Server Error", 500));
    }
});
exports.getPropertiesByUser = getPropertiesByUser;
const approveProperty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    try {
        yield prisma_1.Prisma.property.update({
            where: { id },
            data: {
                status: 'APPROVED',
                rejectionReason: null,
                approvedBy: { connect: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id } },
            },
        });
        new response_util_1.default(200, true, "Property approved", res);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Internal server error", 500));
    }
});
exports.approveProperty = approveProperty;
const rejectProperty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) {
        new appError_1.InternalServerError("Rejection reason is required", 400);
        return;
    }
    try {
        yield prisma_1.Prisma.property.update({
            where: { id },
            data: {
                status: 'REJECTED',
                rejectionReason: reason,
                approvedBy: { connect: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id } },
            },
        });
        new response_util_1.default(200, true, "Property rejected", res);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Internal server error", 500));
    }
});
exports.rejectProperty = rejectProperty;
const archiveProperty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const property = yield prisma_1.Prisma.property.findUnique({ where: { id } });
        if (!property) {
            new response_util_1.default(404, true, "Property not found", res);
            return;
        }
        // Ownership check:
        if (property.userId !== userId) {
            new response_util_1.default(403, true, "Forbidden: only owner can update status", res);
            return;
        }
        ;
        yield prisma_1.Prisma.property.update({
            where: { id },
            data: { archived: true },
        });
        new response_util_1.default(200, true, "Property archived", res);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Internal server error", 500));
    }
});
exports.archiveProperty = archiveProperty;
const unArchiveProperty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const property = yield prisma_1.Prisma.property.findUnique({ where: { id } });
        if (!property) {
            new response_util_1.default(404, true, "Property not found", res);
            return;
        }
        // Ownership check:
        if (property.userId !== userId) {
            new response_util_1.default(403, true, "Forbidden: only owner can update status", res);
            return;
        }
        ;
        yield prisma_1.Prisma.property.update({
            where: { id },
            data: { archived: false },
        });
        new response_util_1.default(200, true, "Property archived", res);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Internal server error", 500));
    }
});
exports.unArchiveProperty = unArchiveProperty;
const deleteProperty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield prisma_1.Prisma.property.delete({ where: { id } });
        new response_util_1.default(200, true, "Property deleted permanently", res);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Internal server error", 500));
    }
});
exports.deleteProperty = deleteProperty;
const statusProperty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const propertyId = req.params.id;
    const { salesStatus } = req.body;
    if (!['SELLING', 'SOLD'].includes(salesStatus)) {
        new response_util_1.default(400, true, "Invalid salesStatus value", res);
        return;
    }
    try {
        const property = yield prisma_1.Prisma.property.findUnique({ where: { id: propertyId } });
        if (!property) {
            new response_util_1.default(404, true, "Property not found", res);
            return;
        }
        // Ownership check:
        if (property.userId !== userId) {
            new response_util_1.default(403, true, "Forbidden: only owner can update status", res);
            return;
        }
        yield prisma_1.Prisma.property.update({
            where: { id: propertyId },
            data: {
                salesStatus,
            },
        });
        new response_util_1.default(200, true, "status updated", res);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Internal server error", 500));
    }
});
exports.statusProperty = statusProperty;
const mediaForProperty = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { propertyId } = req.params;
    const files = req.files;
    const metaArray = req.body.metadata;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!files || files.length === 0 || !metaArray) {
        new response_util_1.default(404, true, "Files and metadata are required", res);
        return;
    }
    // Parse metadata array (expecting JSON strings)
    let metadata;
    try {
        const property = yield prisma_1.Prisma.property.findUnique({ where: { id: propertyId } });
        if (!property) {
            new response_util_1.default(404, true, "Property not found", res);
            return;
        }
        // Ownership check:
        if (property.userId !== userId) {
            new response_util_1.default(403, true, "Forbidden: only owner can update status", res);
            return;
        }
        ;
        metadata = Array.isArray(metaArray)
            ? metaArray.map((m) => JSON.parse(m))
            : [JSON.parse(metaArray)];
    }
    catch (_b) {
        new response_util_1.default(404, true, "Invalid metadata JSON", res);
        return;
    }
    if (metadata.length !== files.length) {
        new response_util_1.default(404, true, "Metadata count must match files count", res);
        return;
    }
    const uploadJobs = files.map((file, i) => ({
        filePath: file.path,
        propertyId,
        meta: metadata[i],
    }));
    try {
        const uploaded = yield mediaUploader.upload(uploadJobs);
        if (uploaded.length > 0) {
            yield prisma_1.Prisma.media.createMany({
                data: uploaded.map((u) => ({
                    propertyId,
                    type: u.type,
                    url: u.url,
                    publicId: u.publicId,
                    caption: u.caption,
                    altText: u.altText,
                    order: u.order,
                    width: u.width,
                    height: u.height,
                    duration: u.duration,
                    sizeInKB: u.sizeInKB,
                    format: u.format,
                })),
            });
        }
        new response_util_1.default(200, true, "Upload successful", res, uploaded);
    }
    catch (error) {
        next(new appError_1.InternalServerError("Upload faile", 500));
    }
});
exports.mediaForProperty = mediaForProperty;
