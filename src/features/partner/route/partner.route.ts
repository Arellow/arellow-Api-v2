import express from 'express'
import authenticate, { adminRequireRole, isSuspended, isVerify, rejectSuperAdmin, requireKyc, requireRole } from '../../../middlewares/auth.middleware';


import { multipleupload } from '../../../middlewares/multer';
import { validateSchema } from '../../../middlewares/propertyParsingAndValidation';

import { UserRole } from '../../../../generated/prisma/enums';
import { createPartner } from '../controller/createPartner';
import { deletePartner, getPartnerDetail, getPartners, partnerSuspend, partnerUnSuspend, partnerVerify } from '../controller/partner.controller';


const partnerRoute = express.Router();



partnerRoute.post("/createpartner", multipleupload, 
//     (req, res, next) => {
   
//     const body = {
//         ...req.body,
//         features: parsedFeatures,
//         amenities: parsedAmenities,
//         price: parsedPrice
//     };
//     req.body = body;
//     next()

// },
//     validateSchema(createPropertySchema),
     authenticate, isVerify, requireKyc, isSuspended, rejectSuperAdmin,
     requireRole(UserRole.ADMIN), adminRequireRole("PARTNER"),
     createPartner);

    partnerRoute.get("/all", getPartners);
    partnerRoute.patch("/:id/verification", authenticate, isSuspended, requireRole(UserRole.SUPER_ADMIN), partnerVerify);
    partnerRoute.patch("/:id/suspend", authenticate, isSuspended, requireRole(UserRole.SUPER_ADMIN), partnerSuspend);
    partnerRoute.patch("/:id/unsuspend", authenticate, isSuspended, requireRole(UserRole.SUPER_ADMIN), partnerUnSuspend);
    // partnerRoute.delete("/:id", authenticate, isSuspended, requireRole(UserRole.SUPER_ADMIN), partnerUnSuspend);
    partnerRoute.get("/:id/detail", getPartnerDetail);
    partnerRoute.delete("/:id", deletePartner);


export default partnerRoute;