
import Joi from 'joi';
import { PropertyVerifyStatus } from '../../../../generated/prisma/enums';


export const propertyVerificationStatusSchema = Joi.object({
  status: Joi.string().required().valid(...Object.values(PropertyVerifyStatus)),
});

