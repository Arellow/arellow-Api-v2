"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPropertyRequestSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createPropertyRequestSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100).required().messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters long",
    }),
    email: joi_1.default.string().email().required().messages({
        "string.email": "Please provide a valid email address",
        "string.empty": "Email is required",
    }),
    phone_number: joi_1.default.string().min(7).max(20).required().messages({
        "string.empty": "Phone number is required",
    }),
    state: joi_1.default.string().required().messages({
        "string.empty": "State is required",
    }),
    property_location: joi_1.default.string().required().messages({
        "string.empty": "Property location is required",
    }),
    neighborhood: joi_1.default.string().allow("", null),
    property_category: joi_1.default.string().required().messages({
        "string.empty": "Property category is required",
    }),
    property_type: joi_1.default.string().required().messages({
        "string.empty": "Property type is required",
    }),
    furnishing_status: joi_1.default.string().valid("furnished", "semi-furnished", "unfurnished").allow("", null),
    number_of_bedrooms: joi_1.default.number().integer().min(0).allow(null),
    number_of_bathrooms: joi_1.default.number().integer().min(0).allow(null),
    budget: joi_1.default.number().min(0).allow(null),
    property_description: joi_1.default.string().max(1000).allow("", null),
    userId: joi_1.default.string().required().messages({
        "any.required": "User ID is required",
    }),
});
