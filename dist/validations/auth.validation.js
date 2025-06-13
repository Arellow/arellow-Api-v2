"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmForgotPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    username: joi_1.default.string().required().min(3).max(30),
    fullname: joi_1.default.string().required().min(2).max(100),
    email: joi_1.default.string().required().email(),
    password: joi_1.default.string()
        .required()
        .min(8).message('Password must be at least 8 characters long'),
    phone_number: joi_1.default.string()
        .required()
        .pattern(/^\+?\d{7,15}$/)
        .messages({
        'string.pattern.base': 'Phone number must be valid. E.g. +2348012345678 or 08012345678'
    })
});
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().required().email(),
    password: joi_1.default.string().required()
});
exports.changePasswordSchema = joi_1.default.object({
    oldPassword: joi_1.default.string().required(),
    newPassword: joi_1.default.string()
        .required()
        .min(8),
    confirmPassword: joi_1.default.string().required().valid(joi_1.default.ref('newPassword'))
        .messages({ 'any.only': 'Passwords do not match' })
});
exports.forgotPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().required().email()
});
exports.confirmForgotPasswordSchema = joi_1.default.object({
    resetCode: joi_1.default.string().required(),
    newpassword: joi_1.default.string()
        .required()
        .min(8),
    confirmPassword: joi_1.default.string().required().valid(joi_1.default.ref('newpassword'))
        .messages({ 'any.only': 'Passwords do not match' })
});
