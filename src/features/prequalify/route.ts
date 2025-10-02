import express from 'express'
import { createPreQualification, getPreQualifications, preQualificationDetail, preQualificationStatus } from './controller';
import authenticate, { adminRequireRole, isSuspended, isVerify, requireKyc, requireRole } from '../../middlewares/auth.middleware';
import Joi from 'joi';
import { validateSchema } from '../../middlewares/propertyParsingAndValidation';
import { UserRole } from '@prisma/client';

 const createPrequalificationSchema = Joi.object({
     bank_name: Joi.string().required().min(3),
    city: Joi.string().required().min(3),
    down_payment_goal: Joi.string().required().min(3),
    email: Joi.string().required().min(3),
    fullname: Joi.string().required().min(3),
    home_address: Joi.string().required().min(3),
    monthly_budget: Joi.string().required().min(3),
    neighbourhood: Joi.string().required().min(3),
    occupation: Joi.string().required().min(3),
    phonenumber: Joi.string().required().min(3),
    state: Joi.string().required().min(3),
    employer_name: Joi.string().optional(),
    level_of_employment: Joi.string().optional()
});



const prequalificationRoutes = express.Router();

prequalificationRoutes.post("/", authenticate,  validateSchema(createPrequalificationSchema), createPreQualification);
prequalificationRoutes.patch("/", authenticate, authenticate, isVerify,requireKyc, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("MORTGAGE"), preQualificationStatus);
prequalificationRoutes.get("/:id", authenticate, preQualificationDetail);
prequalificationRoutes.get("/",authenticate, authenticate, isVerify,requireKyc, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("MORTGAGE"), getPreQualifications);



export default prequalificationRoutes;






