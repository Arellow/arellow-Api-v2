import { KycDocumentType, ticketStatus } from '@prisma/client';
import Joi from 'joi';


export const createKycSchema = Joi.object({
  documentNumber: Joi.string().required().min(3).max(30),
  documentType: Joi.string().required().valid(...Object.values(KycDocumentType)),
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
