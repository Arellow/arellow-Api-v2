import Joi from 'joi';

export const registerSchema = Joi.object({
  username: Joi.string().required().min(3).max(30),
  fullname: Joi.string().required().min(2).max(100),
  email: Joi.string().required().email(),
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
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .message('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
  confirmPassword: Joi.string().required().valid(Joi.ref('newPassword'))
    .messages({ 'any.only': 'Passwords do not match' })
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().required().email()
});

export const confirmForgotPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string()
    .required()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .message('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
  confirmPassword: Joi.string().required().valid(Joi.ref('newPassword'))
    .messages({ 'any.only': 'Passwords do not match' })
}); 