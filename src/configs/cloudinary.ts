import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CustomParams {
  folder?: string;
  allowedFormats?: string[];
  transformation?: { width: number; height: number; crop: string }[];
  [key: string]: any;
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "blog_images" as const,
    allowedFormats: ["jpg", "png", "jpeg"],
    transformation: [{ width: 500, height: 500, crop: "limit" }],
  } as CustomParams,
});

export { cloudinary, storage };