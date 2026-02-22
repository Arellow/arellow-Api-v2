
import Joi from 'joi';
import { LandCategory } from '../../../../generated/prisma/enums';

export const createLandsSchema = Joi.object({
  title: Joi.string().required().min(3),
  description: Joi.string().required().min(3),
  category: Joi.string().required().valid(...Object.values(LandCategory)),
  
  country: Joi.string().required().min(1),
  state: Joi.string().required().min(1),
  city: Joi.string().required().min(1),
  neighborhood: Joi.string().required().min(1),


  price: Joi.object({
    currency: Joi.string().required().min(1),
    amount: Joi.number().positive().required()
  }),

  squareMeters: Joi.string().required().min(1),

});



export const LandsCategoryMap = {
  OTHERS: "Other",
  GATES_ESTATE: "Gates Estate",
  GOVERNMENT_ALLOCATION: "Government Allocation",
  COMMUNNTY: "Community Land",
  MIXED_USED: "Mixed Used Land",
  INDUSTRAIL: "Industrail Land",
  COMMERCIAL: "Commercial Land",
  ESTATE: "Estate"
};