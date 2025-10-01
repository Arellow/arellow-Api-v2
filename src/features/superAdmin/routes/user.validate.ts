import Joi from 'joi';

export const addAdminSchema = Joi.object({
  message: Joi.string().email().required()
});