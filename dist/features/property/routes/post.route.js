"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const postRouter = express_1.default.Router();
// postRouter.post("/create/:userId", authenticate, multipleupload,  parseArrayFields(["features", "amenities"]),validateSchema(createPropertySchema), CreatePost);
exports.default = postRouter;
