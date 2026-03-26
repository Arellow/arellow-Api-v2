import Joi from "joi";
import { CampaignPlaceMent, CampaignType } from "../../../../generated/prisma/enums";


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
      name: Joi.string().required().min(1),
      title: Joi.string().required().min(1),
        phoneNumber: Joi.object({
             phone: Joi.string()
              .pattern(/^\+?[0-9\s\-()]{7,15}$/)
              .optional()
              .messages({
                'string.pattern.base': 'Phone number must be a valid format with only digits, optional +, spaces, dashes, or parentheses.',
              }),
          country: Joi.string().trim().min(3).required(),
        }).required(),
      message: Joi.string().required().min(1),
      email: Joi.string().trim().email().lowercase().required(),
      type: Joi.string().required().valid(...Object.values(CampaignType))

});

