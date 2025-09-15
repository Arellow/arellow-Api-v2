import { PropertyCategory, PropertyProgress, PropertyStage, SalesStatus } from '@prisma/client';
import Joi from 'joi';


export const createProjectSchema = Joi.object({
  title: Joi.string().required().min(3),
  description: Joi.string().required().min(3),
  category: Joi.string().required().valid(...Object.values(PropertyCategory)),
  features: Joi.array().items(Joi.string().min(1)),
  amenities: Joi.array().items(
    Joi.object({
      name: Joi.string().required().min(1),
      photoUrl: Joi.string().uri().required().min(1)
    })
  ),

  country: Joi.string().required().min(1),
  state: Joi.string().required().min(1),
  city: Joi.string().required().min(1),
  neighborhood: Joi.string().required().min(1),

  bedrooms: Joi.string().required().min(1),
  bathrooms: Joi.string().required().min(1),
  squareMeters: Joi.string().required().min(1),

  floors: Joi.string().required().min(1),
   price: Joi.object({
      currency: Joi.string().required().min(1),
      amount: Joi.number().positive().required()
    }),

  isFeatureProperty: Joi.boolean().required(),
  yearBuilt: Joi.string().required().min(1),
 
   stagePrice: Joi.object({
      currency: Joi.string().required().min(1),
      amount: Joi.number().positive().required()
    }),
  stage: Joi.string().required().valid(...Object.values(PropertyStage)),
  progress: Joi.string().required().valid(...Object.values(PropertyProgress)),
});








