import multer from "multer";
import DataUriParser from "datauri/parser";
import path from "path";
// import fs from 'fs';
// Configure memory storage
const storage = multer.memoryStorage();


// File filter to enforce image types
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, png, jpg) are allowed"), false);
  }
};

// Permissive filter for chat media (images, video, audio, common documents)
const chatMediaFilter = (_req: any, file: any, cb: any) => {
  const allowed = [
    "image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp",
    "video/mp4", "video/quicktime", "video/x-msvideo", "video/webm",
    "audio/mpeg", "audio/mp4", "audio/m4a", "audio/x-m4a", "audio/aac",
    "audio/wav", "audio/ogg", "audio/webm",
    "application/pdf", "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain", "text/csv",
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not supported: ${file.mimetype}`), false);
  }
};

// Single file upload middleware
export const singleupload = multer({
  storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("image");

// Chat media upload — accepts images, video, audio, documents up to 50MB
export const chatMediaUpload = multer({
  storage,
  fileFilter: chatMediaFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
}).single("image");

export const documentPhotoupload = multer({
  storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single("documentPhoto");

// Multiple file upload middleware

export const multipleupload = multer({ storage }).fields([
  { name: "KITCHEN" },
  { name: "FLOOR_PLAN" },
  { name: "PRIMARY_ROOM" },
  { name: "OTHER" },
  { name: "FRONT_VIEW" },
  { name: "LIVING_ROOM" },
  { name: "VIDEO" },
  { name: "TOUR_3D" },
  { name: "SupportImages" },
  { name: "LANDS" },
  
  { name: "PROOF_OF_ADDRESS" },
  { name: "CAC_CERT" },
  { name: "MEMORANDUM_AND_ARTICLE" },
  { name: "CAC_STATUS_REPORT" },
  { name: "PARTNER_BANNER" },
  { name: "PARTNER_CARD" },

]);






// Interface for file data
export interface FileData {
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