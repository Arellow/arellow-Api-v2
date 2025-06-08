import multer from "multer";
import DataUriParser from "datauri/parser.js";
import path from "path";

const storage = multer.memoryStorage();

// Configure multer with minimal restrictions
export const multipleupload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
}).fields([
  { name: "banner" },
  { name: "outside_view_images" },
  { name: "living_room_images" },
  { name: "kitchen_room_images" },
  { name: "primary_room_images" },
  { name: "floor_plan_images" },
  { name: "tour_3d_images" },
  { name: "other_images" },
  { name: "youTube_thumbnail" }
]);

type ImageFile = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname?: string;
  content?: string;
  fieldname?: string;
  encoding?: string;
  stream?: any;
  destination?: string;
  path?: string;
};

export const getDataUri = (file: ImageFile) => {
  try {
    const parser = new DataUriParser();
    const extName = path.extname(file.originalname || 'file').toString();
    return parser.format(extName, file.buffer);
  } catch (error) {
    throw new Error('Failed to process file data');
  }
};



