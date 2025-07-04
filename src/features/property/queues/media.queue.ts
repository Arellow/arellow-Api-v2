import { Queue } from 'bullmq';
import { redisConnection } from './redis';

export const mediaUploadQueue = new Queue('mediaUpload', {
  connection: redisConnection,
});