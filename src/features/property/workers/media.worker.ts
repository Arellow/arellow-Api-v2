import { Worker } from 'bullmq';
// import { redisConnection } from '../queues/redis';
import { MediaType } from '@prisma/client';
import { Readable } from 'stream';
import { cloudinary } from '../../../configs/cloudinary';
import { Prisma } from '../../../lib/prisma';


export const mediaWorker = new Worker(
  'mediaUpload',
  async job => {
    const { propertyId, file, meta } = job.data;


    const result = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'property-media' },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );

      Readable.from(Buffer.from(file.buffer)).pipe(upload);
    });

    const media = result as any;

    await Prisma.media.create({
      data: {
        propertyId,
        url: media.secure_url,
        publicId: media.public_id,
        type: media.resource_type === 'video' ? MediaType.VIDEO : MediaType.PHOTO,
        format: media.format,
        sizeInKB: media.bytes / 1024,
        order: meta.order,
    },
    });

    return media;
  },
  { connection: {
      host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '11071', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        tls: process.env.REDIS_USE_TLS === 'true' ? {} : undefined,
  }

    // redisConnection
    , concurrency: 5 } // 5 files at once
);
