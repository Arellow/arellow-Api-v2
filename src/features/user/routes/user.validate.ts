import {ticketStatus } from '@prisma/client';
import Joi from 'joi';


export const createKycSchema = Joi.object({
 documentNumber: Joi.string()
    .length(11)
    .required()
    .messages({
      'string.length': 'idNumber must be exactly 11 characters',
      'any.required': 'documentNumber is required',
      'string.base': 'documentNumber must be a string',
    }),
    firstname: Joi.string().required().min(1),
    lastname: Joi.string().required().min(1),
});

export const changeTicketSchema = Joi.object({
  message: Joi.string().allow(''),
  status: Joi.string().required().valid(...Object.values(ticketStatus)),
});

export const createCustomerSupportSchema = Joi.object({
  category: Joi.string().required().min(3),
  description: Joi.string().required().min(3),
  title: Joi.string().required().min(3),
});

export const createNotificationSchema = Joi.object({
   message: Joi.string().required().min(3),
  title: Joi.string().required().min(3),
});
