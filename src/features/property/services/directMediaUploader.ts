import { cloudinary } from '../../../configs/cloudinary';
import { IMediaUploader, UploadJob, UploadedMedia } from './mediaUploader';

import fs from 'fs/promises';

export class DirectMediaUploader implements IMediaUploader {
  async upload(files: UploadJob[]): Promise<UploadedMedia[]> {
    const results: UploadedMedia[] = [];

    for (const job of files) {
      const upload = await cloudinary.uploader.upload(job.filePath, {
        folder: `properties/${job.propertyId}`,
        tags: [job.meta.photoType || job.meta.mediaType, `property_${job.propertyId}`],
        context: {
          caption: job.meta.caption || '',
          alt: job.meta.altText || '',
        },
        transformation: job.meta.mediaType === 'PHOTO' ? [{ width: 1600, crop: 'limit' }] : undefined,
        resource_type: job.meta.mediaType === 'VIDEO' || job.meta.mediaType === 'TOUR_3D' ? 'video' : 'image',
      });

      await fs.unlink(job.filePath);

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
