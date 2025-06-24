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
exports.DirectMediaUploader = void 0;
const cloudinary_1 = require("../../../configs/cloudinary");
const promises_1 = __importDefault(require("fs/promises"));
class DirectMediaUploader {
    upload(files) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const results = [];
            for (const job of files) {
                const upload = yield cloudinary_1.cloudinary.uploader.upload(job.filePath, {
                    folder: `properties/${job.propertyId}`,
                    tags: [job.meta.photoType || job.meta.mediaType, `property_${job.propertyId}`],
                    context: {
                        caption: job.meta.caption || '',
                        alt: job.meta.altText || '',
                    },
                    transformation: job.meta.mediaType === 'PHOTO' ? [{ width: 1600, crop: 'limit' }] : undefined,
                    resource_type: job.meta.mediaType === 'VIDEO' || job.meta.mediaType === 'TOUR_3D' ? 'video' : 'image',
                });
                yield promises_1.default.unlink(job.filePath);
                results.push({
                    url: upload.secure_url,
                    publicId: upload.public_id,
                    type: job.meta.mediaType,
                    width: upload.width,
                    height: upload.height,
                    duration: upload.duration,
                    sizeInKB: Math.round(((_a = upload.bytes) !== null && _a !== void 0 ? _a : 0) / 1024),
                    format: upload.format,
                    caption: job.meta.caption,
                    altText: job.meta.altText,
                    order: job.meta.order,
                });
            }
            return results;
        });
    }
}
exports.DirectMediaUploader = DirectMediaUploader;
