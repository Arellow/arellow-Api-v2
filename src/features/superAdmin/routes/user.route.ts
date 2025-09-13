import express from 'express'
import authenticate, { isAdmin, requireRole } from '../../../middlewares/auth.middleware';
import { addAdmin, getAllAdmins, getUsersController, suspendAdminStatus } from '../controllers/user';

import { UserRole } from '@prisma/client';
import { addAdminSchema } from './user.validate';
import { validateSchema } from '../../../middlewares/propertyParsingAndValidation';

const userRoutes =  express.Router();
//User management routes
userRoutes.get("/users",authenticate, requireRole(UserRole.SUPER_ADMIN), getUsersController );
userRoutes.put("/:userId/role", validateSchema(addAdminSchema),authenticate,  requireRole(UserRole.SUPER_ADMIN),  addAdmin);
userRoutes.patch("/:userId/suspend", validateSchema(addAdminSchema),authenticate,  requireRole(UserRole.SUPER_ADMIN),  suspendAdminStatus);
userRoutes.get("/admins",authenticate, requireRole(UserRole.SUPER_ADMIN), getAllAdmins );



export default userRoutes