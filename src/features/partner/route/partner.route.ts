import express from 'express'
import authenticate, { adminRequireRole, isSuspended, isVerify, requireKyc, requireRole } from '../../../middlewares/auth.middleware';


import { multipleupload } from '../../../middlewares/multer';
import { validateSchema } from '../../../middlewares/propertyParsingAndValidation';

import { UserRole } from '../../../../generated/prisma/enums';
import { createPartner } from '../controller/createPartner';
import { getPartnerDetail, getPartners, partnerSuspend, partnerUnSuspend, partnerVerify } from '../controller/partner.controller';


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
     authenticate, isVerify, requireKyc, isSuspended, 
     requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PARTNER"),
     createPartner);

    partnerRoute.get("/all", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), getPartners);
    partnerRoute.patch("/:id/verification", authenticate, isSuspended, requireRole(UserRole.SUPER_ADMIN), partnerVerify);
    partnerRoute.patch("/:id/suspend", authenticate, isSuspended, requireRole(UserRole.SUPER_ADMIN), partnerSuspend);
    partnerRoute.patch("/:id/unsuspend", authenticate, isSuspended, requireRole(UserRole.SUPER_ADMIN), partnerUnSuspend);
    partnerRoute.get("/:id/detail", getPartnerDetail);

// partnerRoute.delete("/:id/archiv", authenticate, isSuspended, requireRole(UserRole.SUPER_ADMIN), partnerVerify);


// partnerRoute.get("/allarchive", authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), getAllArchivedProperties);

// partnerRoute.delete("/:id", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
//     adminRequireRole("PROPERTY"),
//     deleteProperty);
// partnerRoute.patch("/:id/feature", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), markAsFeatureProperty);
// partnerRoute.delete("/:id/unfeature", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), unmarkAsFeatureProperty);
// partnerRoute.patch("/:id/status", validateSchema(changeStatusSchema), authenticate, isSuspended,
// //  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), 
//  statusProperty);
// partnerRoute.patch("/:id/reject", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), rejectProperty);
// partnerRoute.patch("/:id/approve", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), 
// adminRequireRole("PROPERTY"),
//  approveProperty);

// partnerRoute.post("/:id/like", authenticate, isSuspended, likeProperty);
// partnerRoute.delete('/:id/like', authenticate, isSuspended, unLikeProperty);
// // partnerRoute.patch("/:propertyId/media", authenticate, isSuspended, mediaForProperty);
// partnerRoute.post("/:id/share", shareProperty);


export default partnerRoute;