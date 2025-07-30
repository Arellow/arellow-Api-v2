import Joi from 'joi';

enum UserRole {
  REALTOR = 'REALTOR',
  DEVELOPER = 'DEVELOPER',
  BUYER = 'BUYER'
}

export const registerSchema = Joi.object({
  username: Joi.string().trim().min(3).max(30).required(),

  fullname: Joi.string().trim().min(2).max(100).required(),

  email: Joi.string().trim().email().lowercase().required(),

  role: Joi.string()
    .valid(...Object.values(UserRole))
    .required()
    .messages({
      'any.only': `Role must be one of: ${Object.values(UserRole).join(', ')}`,
    }),

  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
    }),

  phone_number: Joi.object({
    phone: Joi.string()
      .required()
      .pattern(/^\+?\d{7,15}$/)
      .messages({
        'string.pattern.base': 'Phone number must be valid. E.g. +2348012345678 or 08012345678',
      }),
    country: Joi.string().trim().min(3).required(),
  }).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().required().email().lowercase(),
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
  email: Joi.string().required().email().lowercase()
});

export const confirmForgotPasswordSchema = Joi.object({
  resetCode: Joi.string().required(),
  newpassword: Joi.string()
    .required()
    .min(8),
  confirmPassword: Joi.string().required().valid(Joi.ref('newpassword'))
    .messages({ 'any.only': 'Passwords do not match' })
}); 