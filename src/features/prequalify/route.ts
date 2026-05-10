import express from 'express'
import Joi from 'joi';
import { createPreQualification, getPreQualifications, preQualificationDetail, preQualificationStatus } from './controller';
import authenticate, { adminRequireRole, isSuspended, isVerify, requireKyc, requireRole } from '../../middlewares/auth.middleware';
import { validateSchema } from '../../middlewares/propertyParsingAndValidation';
import { PreQualificationStatus, UserRole } from '../../../generated/prisma/enums';

const createPrequalificationSchema = Joi.object({
    bank_name:           Joi.string().required().min(2),
    city:                Joi.string().required().min(2),
    country:             Joi.string().required().min(2),
    down_payment_goal:   Joi.object({ currency: Joi.string().required(), amount: Joi.number().positive().required() }).required(),
    email:               Joi.string().email().required(),
    fullname:            Joi.string().required().min(2),
    home_address:        Joi.string().required().min(5),
    monthly_budget:      Joi.object({ currency: Joi.string().required(), amount: Joi.number().positive().required() }).required(),
    neighbourhood:       Joi.string().required().min(2),
    occupation:          Joi.string().required().min(2),
    phonenumber:         Joi.string().required().min(7).max(20),
    state:               Joi.string().required().min(2),
    employer_name:       Joi.string().optional().allow(""),
    level_of_employment: Joi.string().optional().allow(""),
});

const updatePrequalificationStatusSchema = Joi.object({
    status: Joi.string().valid(...Object.values(PreQualificationStatus)).required(),
});

const adminMiddleware = [authenticate, isVerify, requireKyc, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("MORTGAGE")];

const prequalificationRoutes = express.Router();

prequalificationRoutes.post("/",   authenticate, validateSchema(createPrequalificationSchema), createPreQualification);
prequalificationRoutes.patch("/:id", ...adminMiddleware, validateSchema(updatePrequalificationStatusSchema), preQualificationStatus);
prequalificationRoutes.get("/:id", authenticate, preQualificationDetail);
prequalificationRoutes.get("/",    ...adminMiddleware, getPreQualifications);

export default prequalificationRoutes;
