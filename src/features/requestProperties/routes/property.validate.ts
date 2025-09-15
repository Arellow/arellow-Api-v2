import { PropertyCategory,  } from '@prisma/client';
import Joi from 'joi';

export const createPropertyRequestSchema = Joi.object({
  username: Joi.string().trim().min(3).max(50),
  userRole: Joi.string().trim().min(3).max(50),
  email: Joi.string().trim().email(),
  phoneNumber: Joi.string().pattern(/^[0-9+\-().\s]{7,15}$/),

  propertyCategory: Joi.string().required().valid(...Object.values(PropertyCategory)),
  title: Joi.string().required().min(3),
  features: Joi.array().items(Joi.string()),
  country: Joi.string().required().min(1),
  state: Joi.string().required().min(1),
  city: Joi.string().required().min(1),
  location: Joi.string().required().min(1),
  numberOfBedrooms: Joi.number().integer().min(1).required(),
  numberOfBathrooms: Joi.number().integer().min(1).required(),
  budget: Joi.object({
      currency: Joi.string().required().min(1),
      amount: Joi.number().positive().required()
    }),
  description: Joi.string().required().min(3),

});

