import express from 'express'

import { multipleupload } from '../../../middlewares/multer';
import { validateSchema } from '../../../middlewares/propertyParsingAndValidation';
import authenticate, { adminRequireRole, isSuspended, isVerify, rejectSuperAdmin, requireKyc, requireRole } from '../../../middlewares/auth.middleware';
import { createProjectSchema } from './property.validate';
import { UserRole } from '../../../../generated/prisma/enums';
import { parseProjectBody } from '../../../utils/parseJson';
import { createProject } from '../controller/createProject.controller';
import { updateProject } from '../controller/updateProject.controller';
const projectRoutes = express.Router();


projectRoutes.post(
  "/createproject",
  authenticate,
  isVerify,
  requireKyc,
  isSuspended,
  rejectSuperAdmin,
  requireRole(UserRole.ADMIN),
  adminRequireRole("PROPERTY"),
  multipleupload,
  parseProjectBody,
  validateSchema(createProjectSchema),
  createProject
);

projectRoutes.patch(
  "/:propertyId/update",
  authenticate,
  isVerify,
  requireKyc,
  isSuspended,
  rejectSuperAdmin,
  requireRole(UserRole.ADMIN),
  adminRequireRole("PROPERTY"),
  multipleupload,
  parseProjectBody,
  validateSchema(createProjectSchema),
  updateProject
);


export default projectRoutes;