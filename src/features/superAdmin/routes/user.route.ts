import express from 'express'
import authenticate, { isAdmin, requireRole } from '../../../middlewares/auth.middleware';
import { addAdminRole, getAllAdmins, getUsersController, suspendAdminStatus , createAdmin} from '../controllers/user';

import { UserRole } from '@prisma/client';
import { addAdminSchema } from './user.validate';
import { validateSchema } from '../../../middlewares/propertyParsingAndValidation';

const userRoutes =  express.Router();
//User management routes
userRoutes.get("/users",authenticate, requireRole(UserRole.SUPER_ADMIN), getUsersController );
userRoutes.put("/:userId/role", authenticate,  requireRole(UserRole.SUPER_ADMIN),  addAdminRole);
userRoutes.patch("/:userId/suspend", validateSchema(addAdminSchema),authenticate,  requireRole(UserRole.SUPER_ADMIN),  suspendAdminStatus);
userRoutes.get("/admins",authenticate, requireRole(UserRole.SUPER_ADMIN), getAllAdmins );
userRoutes.post("/createadmin",authenticate, requireRole(UserRole.SUPER_ADMIN), createAdmin );



export default userRoutes