import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Define a custom params interface including 'folder'
interface CustomParams {
  folder?: string;
  allowedFormats?: string[];
  transformation?: any[];
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