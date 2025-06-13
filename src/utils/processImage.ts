// import { v2 as cloudinary } from "cloudinary";
// import { getDataUri } from "../middlewares/multler.js";
// import { Prisma } from "../lib/prisma.js";
// import pLimit from 'p-limit';
// import sharp from 'sharp';
// import Queue from 'bull';
// import type { UploadApiResponse } from 'cloudinary';

// // Configuration
// const MAX_RETRIES = 3;
// const CONCURRENT_UPLOADS = 5;
// const UPLOAD_TIMEOUT = 30000; 
// const MAX_FILE_SIZE = 10 * 1024 * 1024;
// const ALLOWED_FORMATS = ['jpeg', 'jpg', 'png', 'webp'];
// const RATE_LIMIT_WINDOW = 15 * 60 * 1000; 
// const RATE_LIMIT_MAX = 100; 

// // Initialize upload queue
// const uploadQueue = new Queue('image-uploads', {
//   redis: {
//     host: process.env.REDIS_HOST || 'localhost',
//     port: parseInt(process.env.REDIS_PORT || '6379', 10)
//   },
//   limiter: {
//     max: RATE_LIMIT_MAX,
//     duration: RATE_LIMIT_WINDOW
//   }
// });

// // Structured logging
// const logger = {
//   info: (msg: string, meta: Record<string, unknown> = {}) => {
//     console.log(JSON.stringify({
//       level: 'info',
//       msg,
//       meta,
//       timestamp: new Date().toISOString()
//     }));
//   },
//   error: (msg: string, meta: Record<string, unknown> = {}) => {
//     console.error(JSON.stringify({
//       level: 'error',
//       msg,
//       meta,
//       timestamp: new Date().toISOString()
//     }));
//   }
// };

// // Metrics tracking
// const metrics = {
//   uploadDuration: (start: number) => {
//     const duration = Date.now() - start;
//     logger.info('Upload duration', { duration });
//   },
//   uploadSize: (size: number) => {
//     logger.info('Upload size', { size });
//   },
//   uploadSuccess: () => {
//     logger.info('Upload success');
//   },
//   uploadFailure: (error: unknown) => {
//     logger.error('Upload failure', { error });
//   }
// };

// // Circuit Breaker implementation
// class CircuitBreaker {
//   private failures: number;
//   private lastFailure: number | null;
//   private state: 'CLOSED' | 'OPEN' | 'HALF-OPEN';
//   private failureThreshold: number;
//   private resetTimeout: number;

//   constructor() {
//     this.failures = 0;
//     this.lastFailure = null;
//     this.state = 'CLOSED';
//     this.failureThreshold = 5;
//     this.resetTimeout = 60000;
//   }

//   async execute<T>(fn: () => Promise<T>): Promise<T> {
//     if (this.state === 'OPEN') {
//       if (this.lastFailure && Date.now() - this.lastFailure > this.resetTimeout) {
//         this.state = 'HALF-OPEN';
//       } else {
//         throw new Error('Circuit breaker is open');
//       }
//     }

//     try {
//       const result = await fn();
//       this.reset();
//       return result;
//     } catch (error) {
//       this.recordFailure();
//       throw error;
//     }
//   }

//   private recordFailure(): void {
//     this.failures++;
//     this.lastFailure = Date.now();
//     if (this.failures >= this.failureThreshold) {
//       this.state = 'OPEN';
//     }
//   }

//   private reset(): void {
//     this.failures = 0;
//     this.lastFailure = null;
//     this.state = 'CLOSED';
//   }
// }

// const circuitBreaker = new CircuitBreaker();

// // Optimize image before upload
// async function optimizeImage(buffer: Buffer): Promise<Buffer> {
//   try {
//     const start = Date.now();
//     const optimized = await sharp(buffer)
//       .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
//       .jpeg({ quality: 80 })
//       .toBuffer();
    
//     metrics.uploadDuration(start);
//     metrics.uploadSize(optimized.length);
//     return optimized;
//   } catch (error) {
//     logger.error('Image optimization failed', { error });
//     return buffer; 
//   }
// }

// // Validate image
// function validateImage(file: { mimetype: string; size: number }): void {
//   if (!file) throw new Error('No file provided');
  
//   const format = file.mimetype.split('/')[1];
//   if (!ALLOWED_FORMATS.includes(format)) {
//     throw new Error(`Invalid file format. Allowed formats: ${ALLOWED_FORMATS.join(', ')}`);
//   }
  
//   if (file.size > MAX_FILE_SIZE) {
//     throw new Error(`File too large. Maximum size: ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
//   }

//   metrics.uploadSize(file.size);
// }

// // Upload with retry mechanism
// async function uploadWithRetry(file: string | { content: string }, retries = MAX_RETRIES): Promise<string> {
//   return circuitBreaker.execute(async () => {
//     for (let attempt = 1; attempt <= retries; attempt++) {
//       const start = Date.now();
//       try {
//         // Convert data URI to buffer if needed
//         const uploadContent = typeof file === 'string' ? file : file.content;
        
//         const uploadPromise = cloudinary.uploader.upload(uploadContent, {
//           folder: "ARELLOWPOSTS",
//           resource_type: "auto",
//           timeout: UPLOAD_TIMEOUT,
//         });

//         const result = await Promise.race([
//           uploadPromise,
//           new Promise((_, reject) => 
//             setTimeout(() => reject(new Error('Upload timeout')), UPLOAD_TIMEOUT)
//           )
//         ]) as UploadApiResponse;

//         if (!result.public_id) {
//           throw new Error('Upload failed: No public_id returned');
//         }

//         const url = cloudinary.url(result.public_id, {
//           transformation: [
//             {
//               quality: "auto",
//               fetch_format: "auto",
//             },
//             {
//               width: 500,
//               height: 500,
//               crop: "fill",
//               gravity: "auto",
//             }
//           ],
//         }) || result.secure_url;

//         if (!url) {
//           throw new Error('Failed to generate Cloudinary URL');
//         }

//         // Store image metadata
//         await Prisma.arellowImages.create({
//           data: {
//             photoUrl: url,
//             public_id: result.public_id,
//           },
//         });

//         metrics.uploadSuccess();
//         metrics.uploadDuration(start);
//         return url;

//       } catch (error) {
//         logger.error(`Upload attempt ${attempt} failed`, { error });
//         metrics.uploadFailure(error);
        
//         if (attempt === retries) throw error;
//         // Exponential backoff
//         const backoffTime = Math.pow(2, attempt) * 1000;
//         logger.info(`Retrying upload after ${backoffTime}ms`);
//         await new Promise(resolve => setTimeout(resolve, backoffTime));
//       }
//     }
//   });
// }

// // Queue processor
// uploadQueue.process(async (job) => {
//   const { image } = job.data;
//   try {
//     validateImage(image);
//     const optimizedBuffer = await optimizeImage(image.buffer);
//     const dataUri = getDataUri({ ...image, buffer: optimizedBuffer });
//     return await uploadWithRetry(dataUri);
//   } catch (error) {
//     logger.error('Queue processing failed', { error, jobId: job.id });
//     throw error;
//   }
// });

// interface ImageData {
//   buffer: Buffer;
//   originalname: string;
//   mimetype: string;
//   size: number;
// }

// export async function processImage(images: ImageData[] = [], isProfile = false): Promise<string[]> {
//   if (!images || images.length === 0) {
//     return [];
//   }

//   const successfulUploads: string[] = [];
//   const uploadErrors: { file: string; error: string }[] = [];
//   const jobs = [];

//   // Create upload jobs
//   for (const image of images) {
//     if (!image || !image.buffer) {
//       console.warn('Invalid image data received');
//       continue;
//     }

//     const job = {
//       data: { image },
//       finished: async () => {
//         try {
//           const optimizedBuffer = await optimizeImage(image.buffer);
//           const dataUri = getDataUri({ ...image, buffer: optimizedBuffer });
//           return await uploadWithRetry(dataUri);
//         } catch (error) {
//           console.error('Image processing failed:', error);
//           throw error;
//         }
//       }
//     };
//     jobs.push(job);
//   }

//   // Process queue with concurrency limit
//   const limit = pLimit(CONCURRENT_UPLOADS);
//   const imagesToUpload = jobs.map(job => {
//     return limit(async () => {
//       try {
//         const result = await job.finished();
//         successfulUploads.push(result);
//         return result;
//       } catch (error) {
//         const fileName = job.data?.image?.originalname || 'unknown';
//         uploadErrors.push({ 
//           file: fileName, 
//           error: error instanceof Error ? error.message : 'Unknown error'
//         });
//         return null;
//       }
//     });
//   });

//   const results = await Promise.all(imagesToUpload);
//   const validResults = results.filter(Boolean) as string[];

//   if (uploadErrors.length > 0) {
//     console.error('Some images failed to upload:', uploadErrors);
//   }

//   return validResults;
// }

// export async function deleteImage(photoUrl: string): Promise<void> {
//   if (!photoUrl) return;

//   try {
//     const start = Date.now();
//     const isAvatarSaved = await Prisma.arellowImages.findFirst({
//       where: { photoUrl }
//     });
   
//     if (isAvatarSaved) {
//       await cloudinary.uploader.destroy(isAvatarSaved.public_id);
//       await Prisma.arellowImages.delete({ where: { id: isAvatarSaved.id }});
//       metrics.uploadDuration(start);
//       logger.info('Image deleted successfully', { photoUrl });
//     }
//   } catch (error) {
//     logger.error('Failed to delete image', { error, photoUrl });
//     throw error;
//   }
// }

// export async function deleteMultipleImages(images: string[] = []): Promise<void> {
//   if (images.length === 0) return;

//   const start = Date.now();
//   const deletePromises = images.map(photoUrl => deleteImage(photoUrl));
//   const results = await Promise.allSettled(deletePromises);
  
//   const failures = results.filter(r => r.status === 'rejected');
//   if (failures.length > 0) {
//     logger.error('Some image deletions failed', { 
//       failureCount: failures.length,
//       totalCount: images.length 
//     });
//   }

//   metrics.uploadDuration(start);
// }
