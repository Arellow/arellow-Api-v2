import express from 'express'
import authenticate, { adminRequireRole, isSuspended, isVerify, requireKyc, requireRole } from '../../../middlewares/auth.middleware';
import { getAllStates } from '../controllers/seedPropImages';
import {
    approveProperty, archiveProperty, likeProperty, rejectProperty, singleProperty,
    unArchiveProperty, unLikeProperty, deleteProperty, statusProperty, getLikedPropertiesByUser,
    getPropertiesByUser, mediaForProperty, 
    getAllProperties,
    getAllArchivedProperties,
    getArchivedPropertiesByUser,
    unmarkAsFeatureProperty,
    markAsFeatureProperty,
    shareProperty,
    getProperties,
    getAffordableProperties,
    // featureProperties,
    // recentProperties, 
    // sellingProperties,
    // propertiesListing,
    // getProjects,
} from '../controllers/properties';
import { UserRole } from '@prisma/client';
import { multipleupload } from '../../../middlewares/multer';
import { validateSchema } from '../../../middlewares/propertyParsingAndValidation';
import { changeStatusSchema, createPropertySchema } from './property.validate';
import { createProperty } from '../controllers/createProperty';
import { updateProperty } from '../controllers/updateProperty';

type Amenity = {
    name: string;
    photoUrl: string;
}
const propertyRoutes = express.Router();


// test by flow
propertyRoutes.get("/", getProperties);
propertyRoutes.get("/seed", getAllStates);

// propertyRoutes.get("/project", getProjects);
// propertyRoutes.get("/selling", sellingProperties);
// propertyRoutes.get("/recent", recentProperties);
// propertyRoutes.get("/featured", featureProperties);
// propertyRoutes.get("/listing", authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), propertiesListing);

propertyRoutes.get("/affordable", getAffordableProperties);

propertyRoutes.post("/createproperty", multipleupload, (req, res, next) => {
    const parsedFeatures: string[] = typeof req.body.features === 'string' ? JSON.parse(req.body.features || '[]') : req.body.features;
    const parsedAmenities: Amenity[] = typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities || '[]') : req.body.amenities;
    
    const parsedPrice: { amount: number, currency: string } = typeof req.body.price === 'string' ? JSON.parse(req.body.price || '{}') : req.body.price;

    const body = {
        ...req.body,
        features: parsedFeatures,
        amenities: parsedAmenities,
        price: parsedPrice
    };
    req.body = body;
    next()

},
    validateSchema(createPropertySchema),
     authenticate, isVerify, requireKyc, isSuspended, createProperty);

propertyRoutes.patch("/:propertyId/update", multipleupload,
    (req, res, next) => {

        const parsedFeatures: string[] = typeof req.body.features === 'string' ? JSON.parse(req.body.features || '[]') : req.body.features;
        const parsedAmenities: Amenity[] = typeof req.body.amenities === 'string' ? JSON.parse(req.body.amenities || '[]') : req.body.amenities;
      
        const parsedPrice: { amount: number, currency: string } = typeof req.body.price === 'string' ? JSON.parse(req.body.price || '{}') : req.body.price;

        const body = {
            ...req.body,
            features: parsedFeatures,
            amenities: parsedAmenities,
            price: parsedPrice
        };
        req.body = body;
        next()

    },
    validateSchema(createPropertySchema), authenticate, isVerify,requireKyc, isSuspended, updateProperty);


propertyRoutes.get("/user/archive", authenticate, getArchivedPropertiesByUser);
propertyRoutes.get("/liked", authenticate, getLikedPropertiesByUser);
propertyRoutes.get("/user", authenticate, getPropertiesByUser);
propertyRoutes.patch("/:id/unarchive", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), unArchiveProperty);
propertyRoutes.delete("/:id/archive", authenticate, isSuspended, archiveProperty);
propertyRoutes.get("/allarchive", authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), getAllArchivedProperties);
propertyRoutes.get("/:id/detail", singleProperty);
propertyRoutes.get("/all", authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), getAllProperties);

propertyRoutes.delete("/:id", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
    adminRequireRole("PROPERTY"),
    deleteProperty);
propertyRoutes.patch("/:id/feature", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), markAsFeatureProperty);
propertyRoutes.delete("/:id/unfeature", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), unmarkAsFeatureProperty);
propertyRoutes.patch("/:id/status", validateSchema(changeStatusSchema), authenticate, isSuspended,
//  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), 
 statusProperty);
propertyRoutes.patch("/:id/reject", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), rejectProperty);
propertyRoutes.patch("/:id/approve", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), 
adminRequireRole("PROPERTY"),
 approveProperty);

propertyRoutes.post("/:id/like", authenticate, isSuspended, likeProperty);
propertyRoutes.delete('/:id/like', authenticate, isSuspended, unLikeProperty);
propertyRoutes.patch("/:propertyId/media", authenticate, isSuspended, mediaForProperty);
propertyRoutes.post("/:id/share", shareProperty);


export default propertyRoutes;