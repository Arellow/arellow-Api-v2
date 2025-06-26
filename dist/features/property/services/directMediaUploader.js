"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectMediaUploader = void 0;
const cloudinary_1 = require("../../../configs/cloudinary");
const promises_1 = __importDefault(require("fs/promises"));
class DirectMediaUploader {
    async upload(files) {
        const results = [];
        for (const job of files) {
            const upload = await cloudinary_1.cloudinary.uploader.upload(job.filePath, {
                folder: `properties/${job.propertyId}`,
                tags: [job.meta.photoType || job.meta.mediaType, `property_${job.propertyId}`],
                context: {
                    caption: job.meta.caption || '',
                    alt: job.meta.altText || '',
                },
                transformation: job.meta.mediaType === 'PHOTO' ? [{ width: 1600, crop: 'limit' }] : undefined,
                resource_type: job.meta.mediaType === 'VIDEO' || job.meta.mediaType === 'TOUR_3D' ? 'video' : 'image',
            });
            await promises_1.default.unlink(job.filePath);
            results.push({
                url: upload.secure_url,
                publicId: upload.public_id,
                type: job.meta.mediaType,
                width: upload.width,
                height: upload.height,
                duration: upload.duration,
                sizeInKB: Math.round((upload.bytes ?? 0) / 1024),
                format: upload.format,
                caption: job.meta.caption,
                altText: job.meta.altText,
                order: job.meta.order,
            });
        }
        return results;
    }
}
exports.DirectMediaUploader = DirectMediaUploader;
