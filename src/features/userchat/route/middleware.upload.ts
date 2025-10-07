import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';


interface CustomParams {
  folder?: string;
  allowedFormats?: string[];
  transformation?: { width: number; height: number; crop: string }[];
  [key: string]: any;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'chat-media',
    allowed_formats: ['jpg', 'png', 'mp4', 'mp3', 'wav', 'pdf'],
    resource_type: 'auto',
  } as CustomParams,
});

const upload = multer({ storage });

export default upload;

