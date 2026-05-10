import Joi from 'joi';

export const addAdminSchema = Joi.object({
  message: Joi.string().required().min(3),
});

export const createAdminSchema = Joi.object({
  fullname: Joi.string().required().min(2),
  email: Joi.string().email().required(),
  username: Joi.string().required().min(3),
  password: Joi.string().required().min(8),
  phone_number: Joi.object({
    phone: Joi.string().required(),
    country: Joi.string().required(),
  }).required(),
  action: Joi.array().items(Joi.string()).required(),
});