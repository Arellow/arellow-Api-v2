
import Joi from 'joi';
import { PropertyCategory, PropertyProgress, PropertyStage } from '../../../../generated/prisma/enums';


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
  
  bedrooms: Joi.number().positive().required().min(1),
  bathrooms: Joi.number().positive().required().min(1),
  floors: Joi.number().positive().required().min(1),
  

  price: Joi.object({
    currency: Joi.string().required().min(1),
    amount: Joi.number().positive().required()
  }),

  squareMeters: Joi.string().required().min(1),

  yearBuilt: Joi.number().positive().required(),
 
   stagePrice: Joi.object({
      currency: Joi.string().required().min(1),
      amount: Joi.number().positive().required()
    }),
  stage: Joi.string().required().valid(...Object.values(PropertyStage)),
  progress: Joi.string().required().valid(...Object.values(PropertyProgress)),
});







