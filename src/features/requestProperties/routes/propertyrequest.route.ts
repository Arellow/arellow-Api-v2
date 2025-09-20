import express from 'express'
const propertyRequestRoutes = express.Router();

import { assignDevelopers, createPropertyRequest, propertyRequestDetail, propertyAssignDetail, propertyRequests, propertyAssigns, updateDeveloperAssignment } from '../controllers/request'
import authenticate, { adminRequireRole, requireRole } from '../../../middlewares/auth.middleware';
import { validateSchema } from '../../../middlewares/propertyParsingAndValidation';
import { UserRole } from '@prisma/client';
import { createPropertyRequestSchema } from './property.validate';

//Request property
propertyRequestRoutes.post("/create", validateSchema(createPropertyRequestSchema), createPropertyRequest);
propertyRequestRoutes.get("/assignProperties", authenticate, propertyAssigns);
propertyRequestRoutes.get("/requestProperties", authenticate, propertyRequests);
propertyRequestRoutes.get("/assignProperty/:id/detail", authenticate, propertyAssignDetail);
propertyRequestRoutes.get("/:id/detail", authenticate, propertyRequestDetail);
propertyRequestRoutes.post("/:id/assign-developers", authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), assignDevelopers);
propertyRequestRoutes.patch("/:id/close", authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), updateDeveloperAssignment);




export default propertyRequestRoutes;