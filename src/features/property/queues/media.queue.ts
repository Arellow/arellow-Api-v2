import { Queue } from 'bullmq';
import { redisConnection } from '../../../lib/redis';

export const mediaUploadQueue = new Queue('mediaUpload', {
  connection: redisConnection,
});