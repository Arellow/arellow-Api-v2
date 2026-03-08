import { mediaUploadQueue } from '../../property/queues/media.queue';

export const mediaService = {
  async queueUploads(landId: string, files: Record<string, Express.Multer.File[]>, type: string) {
    const jobs: any[] = [];
    for (const [fieldName, fileList] of Object.entries(files)) {
      const isPhoto = [type].includes(fieldName);
      for (const file of fileList) {
        jobs.push({
          name: 'upload',
          data: {
            propertyId: landId,
            file: { buffer: file.buffer, originalname: file.originalname, mimetype: file.mimetype },
            meta: { from: type, type: isPhoto ? 'PHOTO' : fieldName, photoType: isPhoto ? fieldName : null }
          },
          opts: { removeOnFail: { count: 3 }, removeOnComplete: true }
        });
      }
    }
    await mediaUploadQueue.addBulk(jobs);
  }
};