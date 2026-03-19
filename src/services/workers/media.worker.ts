import { Queue, Worker } from "bullmq";
import { Readable } from "stream";
import { MediaField, UploadFile } from "../../features/property/routes/property.validate";
import { cloudinary } from "../../configs/cloudinary";
import { Prisma } from "../../lib/prisma";
import { MediaType, PhotoType } from "../../../generated/prisma/enums";
// import { v2 as cloudinary } from "../../../configs/cloudinary";
// import { Prisma } from "../../../lib/prisma";
// import { UploadFile, MediaField } from "../../types/property";

interface MediaJobData {
  propertyId: string;
  file: UploadFile;
}



// export const mediaUploadQueue = new Queue<MediaJobData>("mediaUpload", {
//   connection: {
//     host: process.env.REDIS_HOST,
//     port: parseInt(process.env.REDIS_PORT || "6379", 10),
//     password: process.env.REDIS_PASSWORD,
//   },
// });

export const mediaWorker = new Worker<MediaJobData>(
  "mediaBusyBoyUpload",
  async (job) => {
    const { propertyId, file } = job.data;


    console.log("job: ", job.data)
    console.log("enter ")
    console.log(file)
      console.log("log file ended")

    const resourceType: "image" | "video" = file.mimetype.startsWith("video/") ? "video" : "image";

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType, folder: `properties/${Date.now()}` },
        (err, result) => (err ? reject(err) : resolve(result))
      );
    console.log({uploadStream})
      Readable.from(file.buffer).pipe(uploadStream);
    //   file.stream.pipe(uploadStream);
      
    });

    console.log({uploadResult})

    await Prisma.media.create({
      data: {
        propertyId,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        type: uploadResult.resource_type as MediaType,
        format: uploadResult.format,
        sizeInKB: uploadResult.bytes / 1024,
        photoType: file.field as PhotoType,
        altText: file.field as MediaField,
      },
    });
 console.log("done ")
    return uploadResult;
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || "6379", 10),
      password: process.env.REDIS_PASSWORD,
    },
    concurrency: 5,
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 86400 },
  }
);