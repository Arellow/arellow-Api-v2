import express from 'express'

import { UserRole } from '@prisma/client';
import { multipleupload } from '../../../middlewares/multer';
import { validateSchema } from '../../../middlewares/propertyParsingAndValidation';
import authenticate, { adminRequireRole, isSuspended, requireRole } from '../../../middlewares/auth.middleware';
// import { createProjectSchema } from '../../property/routes/property.validate';
import { createProject } from '../controller/createproject';
import { createProjectSchema } from './property.validate';
const projectRoutes = express.Router();

type Amenity = {
    name: string;
    photoUrl: string;
}

projectRoutes.post("/createproject", multipleupload, (req, res, next) => {

    const parsedFeatures: string[] = typeof req.body.features === 'string' ? JSON.parse(req.body.features || '[]') : req.body.features;
    const parsedAmenities: Amenity[] = typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities || '[]') : req.body.amenities;
    const parsedLocation: {
        lat: string,

        lng: string
    } = typeof req.body.location === 'string' ? JSON.parse(req.body.location || '{}') : req.body.location;

    const body = {
        ...req.body,
        features: parsedFeatures,
        amenities: parsedAmenities,
        location: parsedLocation,
        is_Property_A_Project: true
    };
    req.body = body;
    next()
},
    validateSchema(createProjectSchema),
     authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), createProject);

// projectRoutes.post("/mortgage/:id", authenticate, calculateProjectMortgage)




export default projectRoutes;