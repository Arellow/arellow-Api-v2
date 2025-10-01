import Joi from 'joi';

export const addAdminSchema = Joi.object({
  message: Joi.string().required().min(3),
});