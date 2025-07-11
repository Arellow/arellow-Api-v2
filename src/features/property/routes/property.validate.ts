import { PropertyCategory } from '@prisma/client';
import Joi from 'joi';


export const createPropertySchema = Joi.object({
  title: Joi.string().required().min(3),
  description: Joi.string().required().min(3),
  category: Joi.string().required().valid(...Object.values(PropertyCategory)),
  features:  Joi.array().items(Joi.string().min(1)),
  amenities:   Joi.array().items(
  Joi.object({
    name: Joi.string().required().min(1),
    photoUrl: Joi.string().uri().required().min(1)
  })
),

country: Joi.string().required().min(1),
state: Joi.string().required().min(1),
city: Joi.string().required().min(1),
neighborhood: Joi.string().required().min(1),

bedrooms: Joi.number().integer().min(1).required(),
bathrooms: Joi.number().integer().min(1).required(),
floors: Joi.number().integer().min(1).required(),
squareMeters: Joi.number().integer().min(1).required(),

 price: Joi.number().positive().required(),
 location: Joi.object({
    lat: Joi.number().positive().required(),
    lng: Joi.number().positive().required()
  }),

});

   
