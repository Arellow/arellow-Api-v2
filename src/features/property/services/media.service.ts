import { Prisma } from "../../../lib/prisma";
import { mediaUploadQueue } from "../queues/media.queue";
import { cloudinary } from "../../../configs/cloudinary";

const PHOTO_TYPES = [
  "KITCHEN",
  "FLOOR_PLAN",
  "PRIMARY_ROOM",
  "OTHER",
  "FRONT_VIEW",
  "LIVING_ROOM"
];

export const mediaService = {

  async queueUploads(propertyId: string, files: Record<string, Express.Multer.File[]>) {

    const jobs: any[] = [];

    for (const [fieldName, fileList] of Object.entries(files)) {

      const isPhoto = PHOTO_TYPES.includes(fieldName);

      for (const file of fileList) {

        jobs.push({
          name: "upload",
          data: {
            propertyId,
            file: {
              buffer: file.buffer,
              originalname: file.originalname,
              mimetype: file.mimetype
            },
            meta: {
              from: "PROPERTY",
              type: isPhoto ? "PHOTO" : fieldName,
              photoType: isPhoto ? fieldName : null
            }
          },
          opts: {
            removeOnFail: { count: 3 },
            removeOnComplete: true
          }
        });

      }

    }

    await mediaUploadQueue.addBulk(jobs);

  },


  async deletePropertyMedia(propertyId: string) {

  const oldMedia = await Prisma.media.findMany({
    where: { propertyId }
  });

  for (const media of oldMedia) {

    try {

      await cloudinary.uploader.destroy(
        media.publicId,
        { resource_type: media.type === "VIDEO" ? "video" : "image" }
      );

    } catch {}

  }

  await Prisma.media.deleteMany({
    where: { propertyId }
  });

}




};