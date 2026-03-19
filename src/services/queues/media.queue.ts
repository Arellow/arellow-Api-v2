import { Queue } from 'bullmq';
import { redisConnection } from '../../lib/redis';
// import { redisConnection } from '../../../lib/redis';


export const mediaUploadQueueBusboy = new Queue('mediaBusyBoyUpload', {
  connection: redisConnection,
});
