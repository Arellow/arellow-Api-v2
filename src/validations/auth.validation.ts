import { UserRole } from '@prisma/client';
import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().required().min(3).max(30),
  country: Joi.string().required().min(3),
  fullname: Joi.string().required().min(2).max(100),
  email: Joi.string().required().email(),
  role: Joi.string().valid(...Object.values(UserRole)),
  password: Joi.string()
    .required()
    .min(8).message('Password must be at least 8 characters long'),
  phone_number: Joi.string()
    .required()
    .pattern(/^\+?\d{7,15}$/)
    .messages({
      'string.pattern.base': 'Phone number must be valid. E.g. +2348012345678 or 08012345678'
    })
});

export const loginSchema = Joi.object({
  email: Joi.string().required().email(),
  password: Joi.string().required()
});

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string()
    .required()
    .min(8),

  confirmPassword: Joi.string().required().valid(Joi.ref('newPassword'))
    .messages({ 'any.only': 'Passwords do not match' })
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().required().email()
});

export const confirmForgotPasswordSchema = Joi.object({
  resetCode: Joi.string().required(),
  newpassword: Joi.string()
    .required()
    .min(8),
  confirmPassword: Joi.string().required().valid(Joi.ref('newpassword'))
    .messages({ 'any.only': 'Passwords do not match' })
}); 