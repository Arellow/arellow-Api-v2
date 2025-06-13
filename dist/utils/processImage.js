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
exports.processImage = processImage;
exports.deleteImage = deleteImage;
exports.deleteMultipleImages = deleteMultipleImages;
const cloudinary_1 = require("cloudinary");
const multler_js_1 = require("../middlewares/multler.js");
const prisma_js_1 = require("../lib/prisma.js");
const p_limit_1 = __importDefault(require("p-limit"));
const sharp_1 = __importDefault(require("sharp"));
const bull_1 = __importDefault(require("bull"));
// Configuration
const MAX_RETRIES = 3;
const CONCURRENT_UPLOADS = 5;
const UPLOAD_TIMEOUT = 30000;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FORMATS = ['jpeg', 'jpg', 'png', 'webp'];
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 100;
// Initialize upload queue
const uploadQueue = new bull_1.default('image-uploads', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10)
    },
    limiter: {
        max: RATE_LIMIT_MAX,
        duration: RATE_LIMIT_WINDOW
    }
});
// Structured logging
const logger = {
    info: (msg, meta = {}) => {
        console.log(JSON.stringify({
            level: 'info',
            msg,
            meta,
            timestamp: new Date().toISOString()
        }));
    },
    error: (msg, meta = {}) => {
        console.error(JSON.stringify({
            level: 'error',
            msg,
            meta,
            timestamp: new Date().toISOString()
        }));
    }
};
// Metrics tracking
const metrics = {
    uploadDuration: (start) => {
        const duration = Date.now() - start;
        logger.info('Upload duration', { duration });
    },
    uploadSize: (size) => {
        logger.info('Upload size', { size });
    },
    uploadSuccess: () => {
        logger.info('Upload success');
    },
    uploadFailure: (error) => {
        logger.error('Upload failure', { error });
    }
};
// Circuit Breaker implementation
class CircuitBreaker {
    constructor() {
        this.failures = 0;
        this.lastFailure = null;
        this.state = 'CLOSED';
        this.failureThreshold = 5;
        this.resetTimeout = 60000;
    }
    execute(fn) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.state === 'OPEN') {
                if (this.lastFailure && Date.now() - this.lastFailure > this.resetTimeout) {
                    this.state = 'HALF-OPEN';
                }
                else {
                    throw new Error('Circuit breaker is open');
                }
            }
            try {
                const result = yield fn();
                this.reset();
                return result;
            }
            catch (error) {
                this.recordFailure();
                throw error;
            }
        });
    }
    recordFailure() {
        this.failures++;
        this.lastFailure = Date.now();
        if (this.failures >= this.failureThreshold) {
            this.state = 'OPEN';
        }
    }
    reset() {
        this.failures = 0;
        this.lastFailure = null;
        this.state = 'CLOSED';
    }
}
const circuitBreaker = new CircuitBreaker();
// Optimize image before upload
function optimizeImage(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const start = Date.now();
            const optimized = yield (0, sharp_1.default)(buffer)
                .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toBuffer();
            metrics.uploadDuration(start);
            metrics.uploadSize(optimized.length);
            return optimized;
        }
        catch (error) {
            logger.error('Image optimization failed', { error });
            return buffer;
        }
    });
}
// Validate image
function validateImage(file) {
    if (!file)
        throw new Error('No file provided');
    const format = file.mimetype.split('/')[1];
    if (!ALLOWED_FORMATS.includes(format)) {
        throw new Error(`Invalid file format. Allowed formats: ${ALLOWED_FORMATS.join(', ')}`);
    }
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }
    metrics.uploadSize(file.size);
}
// Upload with retry mechanism
function uploadWithRetry(file_1) {
    return __awaiter(this, arguments, void 0, function* (file, retries = MAX_RETRIES) {
        return circuitBreaker.execute(() => __awaiter(this, void 0, void 0, function* () {
            for (let attempt = 1; attempt <= retries; attempt++) {
                const start = Date.now();
                try {
                    // Convert data URI to buffer if needed
                    const uploadContent = typeof file === 'string' ? file : file.content;
                    const uploadPromise = cloudinary_1.v2.uploader.upload(uploadContent, {
                        folder: "ARELLOWPOSTS",
                        resource_type: "auto",
                        timeout: UPLOAD_TIMEOUT,
                    });
                    const result = yield Promise.race([
                        uploadPromise,
                        new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timeout')), UPLOAD_TIMEOUT))
                    ]);
                    if (!result.public_id) {
                        throw new Error('Upload failed: No public_id returned');
                    }
                    const url = cloudinary_1.v2.url(result.public_id, {
                        transformation: [
                            {
                                quality: "auto",
                                fetch_format: "auto",
                            },
                            {
                                width: 500,
                                height: 500,
                                crop: "fill",
                                gravity: "auto",
                            }
                        ],
                    }) || result.secure_url;
                    if (!url) {
                        throw new Error('Failed to generate Cloudinary URL');
                    }
                    // Store image metadata
                    yield prisma_js_1.Prisma.arellowImages.create({
                        data: {
                            photoUrl: url,
                            public_id: result.public_id,
                        },
                    });
                    metrics.uploadSuccess();
                    metrics.uploadDuration(start);
                    return url;
                }
                catch (error) {
                    logger.error(`Upload attempt ${attempt} failed`, { error });
                    metrics.uploadFailure(error);
                    if (attempt === retries)
                        throw error;
                    // Exponential backoff
                    const backoffTime = Math.pow(2, attempt) * 1000;
                    logger.info(`Retrying upload after ${backoffTime}ms`);
                    yield new Promise(resolve => setTimeout(resolve, backoffTime));
                }
            }
        }));
    });
}
// Queue processor
uploadQueue.process((job) => __awaiter(void 0, void 0, void 0, function* () {
    const { image } = job.data;
    try {
        validateImage(image);
        const optimizedBuffer = yield optimizeImage(image.buffer);
        const dataUri = (0, multler_js_1.getDataUri)(Object.assign(Object.assign({}, image), { buffer: optimizedBuffer }));
        return yield uploadWithRetry(dataUri);
    }
    catch (error) {
        logger.error('Queue processing failed', { error, jobId: job.id });
        throw error;
    }
}));
function processImage() {
    return __awaiter(this, arguments, void 0, function* (images = [], isProfile = false) {
        if (!images || images.length === 0) {
            return [];
        }
        const successfulUploads = [];
        const uploadErrors = [];
        const jobs = [];
        // Create upload jobs
        for (const image of images) {
            if (!image || !image.buffer) {
                console.warn('Invalid image data received');
                continue;
            }
            const job = {
                data: { image },
                finished: () => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const optimizedBuffer = yield optimizeImage(image.buffer);
                        const dataUri = (0, multler_js_1.getDataUri)(Object.assign(Object.assign({}, image), { buffer: optimizedBuffer }));
                        return yield uploadWithRetry(dataUri);
                    }
                    catch (error) {
                        console.error('Image processing failed:', error);
                        throw error;
                    }
                })
            };
            jobs.push(job);
        }
        // Process queue with concurrency limit
        const limit = (0, p_limit_1.default)(CONCURRENT_UPLOADS);
        const imagesToUpload = jobs.map(job => {
            return limit(() => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                try {
                    const result = yield job.finished();
                    successfulUploads.push(result);
                    return result;
                }
                catch (error) {
                    const fileName = ((_b = (_a = job.data) === null || _a === void 0 ? void 0 : _a.image) === null || _b === void 0 ? void 0 : _b.originalname) || 'unknown';
                    uploadErrors.push({
                        file: fileName,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                    return null;
                }
            }));
        });
        const results = yield Promise.all(imagesToUpload);
        const validResults = results.filter(Boolean);
        if (uploadErrors.length > 0) {
            console.error('Some images failed to upload:', uploadErrors);
        }
        return validResults;
    });
}
function deleteImage(photoUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!photoUrl)
            return;
        try {
            const start = Date.now();
            const isAvatarSaved = yield prisma_js_1.Prisma.arellowImages.findFirst({
                where: { photoUrl }
            });
            if (isAvatarSaved) {
                yield cloudinary_1.v2.uploader.destroy(isAvatarSaved.public_id);
                yield prisma_js_1.Prisma.arellowImages.delete({ where: { id: isAvatarSaved.id } });
                metrics.uploadDuration(start);
                logger.info('Image deleted successfully', { photoUrl });
            }
        }
        catch (error) {
            logger.error('Failed to delete image', { error, photoUrl });
            throw error;
        }
    });
}
function deleteMultipleImages() {
    return __awaiter(this, arguments, void 0, function* (images = []) {
        if (images.length === 0)
            return;
        const start = Date.now();
        const deletePromises = images.map(photoUrl => deleteImage(photoUrl));
        const results = yield Promise.allSettled(deletePromises);
        const failures = results.filter(r => r.status === 'rejected');
        if (failures.length > 0) {
            logger.error('Some image deletions failed', {
                failureCount: failures.length,
                totalCount: images.length
            });
        }
        metrics.uploadDuration(start);
    });
}
