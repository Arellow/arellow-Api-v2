import Joi from "joi";
import { CampaignPlaceMent } from "../../../../generated/prisma/enums";


export const createCampaignSchema = Joi.object({
  campaignName: Joi.string().required().min(3),
   campaignAddress: Joi.object({
      address: Joi.string().required().min(1),
      website: Joi.string().required().min(1),
      phoneNumber: Joi.string().required().min(1),
    }),
//   Joi.array().items(
   
//   ),
  campaignPlaceMent: Joi.array().items(Joi.string().required().valid(...Object.values(CampaignPlaceMent))),

  endDate: Joi.string().required().min(1),
  startDate: Joi.string().required().min(1),

});


export const createCampaignRequestSchema = Joi.object({
   firstName: Joi.string().required().min(1),
      lastName: Joi.string().required().min(1),
      title: Joi.string().required().min(1),
      phoneNumber: Joi.string().required().min(1),
      message: Joi.string().required().min(1),
      email: Joi.string().trim().email().lowercase().required(),

});

