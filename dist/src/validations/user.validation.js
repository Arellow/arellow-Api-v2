"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kycFaceSchema = exports.kycCacSchema = exports.notificationSchema = exports.userRatingSchema = exports.updateUserSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.updateUserSchema = joi_1.default.object({
    username: joi_1.default.string().min(3).max(30),
    fullname: joi_1.default.string().min(2).max(100),
    phone_number: joi_1.default.string()
        .pattern(/^\+?[1-9]\d{9,14}$/)
        .message("Invalid phone number format e.g. +2348012345678")
});
exports.userRatingSchema = joi_1.default.object({
    rating: joi_1.default.number().required().min(1).max(5),
    rateby: joi_1.default.string().required()
});
exports.notificationSchema = joi_1.default.object({
    message: joi_1.default.string().required().max(500),
    status: joi_1.default.string().required().valid('tour', 'message'),
    prodId: joi_1.default.string().optional()
});
// export const kycNinSchema = Joi.object({
//   nin_number: Joi.string().required().length(11).pattern(/^\d+$/),
//   nin_slip_url: Joi.string().required().uri()
// });
exports.kycCacSchema = joi_1.default.object({
    cac_number: joi_1.default.string().required().pattern(/^RC\d{8}$/),
    cac_doc_url: joi_1.default.string().required().uri()
});
exports.kycFaceSchema = joi_1.default.object({
    face_image_url: joi_1.default.string().required().uri()
});
