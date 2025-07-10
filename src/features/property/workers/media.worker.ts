import { Worker } from 'bullmq';
// import { redisConnection } from '../queues/redis';
// import { MediaType } from '@prisma/client';
import { Readable } from 'stream';
import { cloudinary } from '../../../configs/cloudinary';
import { Prisma } from '../../../lib/prisma';


export const mediaWorker = new Worker(
  'mediaUpload',
  async job => {
    const { propertyId, file, meta } = job.data;

    console.log({meta})


    const result = await new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: meta?.photoType == "TICKET" ? 'ticket-media' : 'property-media' },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );

      Readable.from(Buffer.from(file.buffer)).pipe(upload);
    });

    const media = result as any;

    if(meta?.photoType == "TICKET"){
       await Prisma.userMedia.create({
        data: {
          ticketId: propertyId,
          url: media.secure_url,
          publicId: media.public_id,
          // type: media.resource_type === 'video' ? MediaType.VIDEO : MediaType.PHOTO,
          type: meta.type,
          format: media.format,
          sizeInKB: media.bytes / 1024,
          // order: meta.order,
          photoType: meta.photoType,
          altText: meta.type
      },
      });


    } else {
      await Prisma.media.create({
        data: {
          propertyId,
          url: media.secure_url,
          publicId: media.public_id,
          // type: media.resource_type === 'video' ? MediaType.VIDEO : MediaType.PHOTO,
          type: meta.type,
          format: media.format,
          sizeInKB: media.bytes / 1024,
          // order: meta.order,
          photoType: meta.photoType,
          altText: meta.type
      },
      });

    }


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
