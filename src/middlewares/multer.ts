import multer from "multer";
import DataUriParser from "datauri/parser";
import path from "path";

// Configure memory storage
const storage = multer.memoryStorage();

// File filter to enforce image types
const fileFilter = (req: any, file :any, cb:any) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, png, jpg) are allowed"), false);
  }
};

// Single file upload middleware
export const singleupload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("image");

// Multiple file upload middleware
export const multipleupload = multer({ storage }).fields([
  { name: "outside_view_images" },
  { name: "living_room_images" },
  { name: "kitchen_room_images" },
  { name: "primary_room_images" },
  { name: "floor_plan_images" },
  { name: "tour_3d_images" },
  { name: "other_images" },
  { name: "banner" },
  { name: "youTube_thumbnail" },
]);

// Interface for file data
interface FileData {
  originalname: string;
  buffer: Buffer;
}

// Convert file buffer to Data URI
export const getDataUri = (file: FileData): { content: string } => {
  const parser = new DataUriParser();
  const extName = path.extname(file.originalname).toString();
  const result = parser.format(extName, file.buffer);

  if (!result.content) {
    throw new Error("Failed to generate data URI");
  }

  return { content: result.content };
};