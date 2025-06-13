"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDataUri = exports.multipleupload = exports.singleupload = void 0;
const multer_1 = __importDefault(require("multer"));
const parser_1 = __importDefault(require("datauri/parser"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.memoryStorage();
// Single file upload middleware
exports.singleupload = (0, multer_1.default)({ storage }).single("image");
exports.multipleupload = (0, multer_1.default)({ storage }).fields([
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
// Convert file buffer to Data URI
const getDataUri = (file) => {
    const parser = new parser_1.default();
    const extName = path_1.default.extname(file.originalname).toString();
    const result = parser.format(extName, file.buffer);
    if (!result.content) {
        throw new Error("Failed to generate data URI");
    }
    return { content: result.content };
};
exports.getDataUri = getDataUri;
