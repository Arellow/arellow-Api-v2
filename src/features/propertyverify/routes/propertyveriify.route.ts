import express from 'express';
import { createPropertyVerify } from '../controller/createpayment';
import { singleupload } from '../../../middlewares/multer';
import { getPropertyVerificationDetail, getPropertyVerifications, propertyVerificationStatus } from '../controller/propertyverificarion.contrroller';
import authenticate, { adminRequireRole, isSuspended, requireRole } from '../../../middlewares/auth.middleware';
import { UserRole } from '../../../../generated/prisma/enums';

const propertyverifyrouter = express.Router();

propertyverifyrouter.post("/create-property-verify", singleupload, createPropertyVerify);
propertyverifyrouter.patch("/:id/status", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), propertyVerificationStatus);
propertyverifyrouter.get("/:id/detail", getPropertyVerificationDetail);
propertyverifyrouter.get("/", getPropertyVerifications);

export default propertyverifyrouter;