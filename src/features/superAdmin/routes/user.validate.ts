import { actionRole } from '@prisma/client';
import Joi from 'joi';

const allowedActions = Object.values(actionRole); 

export const addAdminSchema = Joi.object({
  email: Joi.string().email().required(),
  action: Joi.alternatives().try(
    Joi.array()
      .items(Joi.string().valid(...allowedActions))
      .required(),
    Joi.string() 
  ),
});