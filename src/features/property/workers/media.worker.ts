import { Worker } from 'bullmq';

import { Readable } from 'stream';
import { cloudinary } from '../../../configs/cloudinary';
import { Prisma } from '../../../lib/prisma';


export const mediaWorker = new Worker(
  'mediaUpload',
  async job => {
    const { propertyId,
      //  filePath,
      file,
        meta } = job.data;

    try {
       const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: meta?.from },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );

      Readable.from(Buffer.from(file.buffer)).pipe(uploadStream);
      //  fs.createReadStream(filePath).pipe(uploadStream);
    });

    const media = uploadResult as any;


    if(meta?.from === "PARTNER"){

       await Prisma.media.create({
        data: {
          partnerId: propertyId,
          url: media.secure_url,
          publicId: media.public_id,
          type: meta.type,
          format: media.format,
          sizeInKB: media.bytes / 1024,
          photoType: meta.photoType,
          altText: meta.type
      },
      });
    }

    if(meta?.from === "LANDS"){

       await Prisma.media.create({
        data: {
          landsId:propertyId,
          url: media.secure_url,
          publicId: media.public_id,
          type: meta.type,
          format: media.format,
          sizeInKB: media.bytes / 1024,
          photoType: meta.photoType,
          altText: meta.type
      },
      });
    }




    if(meta?.from == "TICKET"){
       await Prisma.userMedia.create({
        data: {
          ticketId: propertyId,
          url: media.secure_url,
          publicId: media.public_id,
          type: meta.type,
          format: media.format,
          sizeInKB: media.bytes / 1024,
          photoType: meta.photoType,
          altText: meta.type
      },
      });


    }
    
    
     if(meta?.from === "PROPERTY"){
      await Prisma.media.create({
        data: {
          propertyId,
          url: media.secure_url,
          publicId: media.public_id,
          type: meta.type,
          format: media.format,
          sizeInKB: media.bytes / 1024,
          photoType: meta.photoType,
          altText: meta.type
      },
      });

    }


    // Remove job from Redis
    await job.remove();

    return media;
      
    } catch (error) {
      throw error;
      
    }


  },
  { connection: {
      host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '11071', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        tls: process.env.REDIS_USE_TLS === 'true' ? {} : undefined,
  },
    concurrency: 5,
  removeOnComplete: {
    age: 3600, 
    count: 1000
  },
  removeOnFail: {
    age: 86400 
  }
  
  } 
);


// mediaWorker.on('progress', (job, progress) => {
//   // update Redis or DB with progress
//   console.log({progress})
// });

// mediaWorker.on('completed', (job, result) => {
//   // notify user of completion
//   console.log({result})
// });