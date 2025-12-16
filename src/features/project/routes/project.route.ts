import express from 'express'

import { multipleupload } from '../../../middlewares/multer';
import { validateSchema } from '../../../middlewares/propertyParsingAndValidation';
import authenticate, { adminRequireRole, isSuspended, isVerify, requireKyc, requireRole } from '../../../middlewares/auth.middleware';
// import { createProjectSchema } from '../../property/routes/property.validate';
import { createProject } from '../controller/createproject';
import { createProjectSchema } from './property.validate';
import { UserRole } from '../../../../generated/prisma/enums';
const projectRoutes = express.Router();

type Amenity = {
    name: string;
    photoUrl: string;
}

projectRoutes.post("/createproject", multipleupload, (req, res, next) => {

    const parsedFeatures: string[] = typeof req.body.features === 'string' ? JSON.parse(req.body.features || '[]') : req.body.features;
    const parsedAmenities: Amenity[] = typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities || '[]') : req.body.amenities;
  
    const parsedPrice: { amount: number, currency: string } = typeof req.body.price === 'string' ? JSON.parse(req.body.price) : req.body.price;
    const parsedStagePrice: { amount: number, currency: string } = typeof req.body.stagePrice === 'string' ? JSON.parse(req.body.stagePrice) : req.body.stagePrice;



    
    const body = {
        ...req.body,
        features: parsedFeatures,
        amenities: parsedAmenities,
        is_Property_A_Project: true,
        price: parsedPrice,
        stagePrice: parsedStagePrice
    };
    req.body = body;
    next()
},
    validateSchema(createProjectSchema),
     authenticate, isVerify,requireKyc, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), createProject);

// projectRoutes.post("/updateproject/:propertyId", multipleupload, (req, res, next) => {
//          req.body.isFeatureProperty = true;
//          next()
//      },
// validateSchema(createPropertySchema),isVerify, authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), updateProperty);
     




export default projectRoutes;