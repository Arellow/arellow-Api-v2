import express from 'express'
import { calculateProjectMortgage } from '../controllers/FetchProperties';
import authenticate, { requireRole } from '../../../middlewares/auth.middleware';
// import { createPropertyRequest } from '../../requestProperties/controllers/request';
import { getAllStates, seedNigerianStates } from '../controllers/seedPropImages';
import { approveProperty, archiveProperty, likeProperty, rejectProperty, singleProperty, 
    unArchiveProperty, unLikeProperty , deleteProperty, statusProperty, getLikedPropertiesByUser, 
    getPropertiesByUser, mediaForProperty, recentProperties, featureProperties, createNewProperty,
    getAllProperties,
    updateProperty,
    getAllArchivedProperties,
    getArchivedPropertiesByUser,
    unmarkAsFeatureProperty,
    markAsFeatureProperty,
    sellingProperties
} from '../controllers/properties';
import { UserRole } from '@prisma/client';
import { multipleupload } from '../../../middlewares/multer';

const propertyRoutes= express.Router();

// propertyRoutes.post("/like", authenticate, toggleProjectLike );
propertyRoutes.post("/seed",seedNigerianStates)
propertyRoutes.get("/seed",getAllStates)
propertyRoutes.post("/mortgage/:id",authenticate, calculateProjectMortgage)

//Request property
// propertyRoutes.post("/requestProperty",authenticate,createPropertyRequest);


// test by flow
propertyRoutes.get("/selling", sellingProperties);
propertyRoutes.get("/recent", recentProperties);
propertyRoutes.post("/createproperty", authenticate, multipleupload, createNewProperty);
propertyRoutes.post("/updateproperty/:propertyId", authenticate, multipleupload, updateProperty);
propertyRoutes.get("/featured", featureProperties);
propertyRoutes.get("/user/archive", authenticate,  getArchivedPropertiesByUser);
propertyRoutes.get("/liked", authenticate,  getLikedPropertiesByUser);
propertyRoutes.get("/user", authenticate,  getPropertiesByUser);
propertyRoutes.delete("/:id/unarchive", authenticate, unArchiveProperty);
propertyRoutes.patch("/:id/archive", authenticate, archiveProperty);
propertyRoutes.get("/allarchive", requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), getAllArchivedProperties);
propertyRoutes.get("/:id/detail",singleProperty);
propertyRoutes.get("/all", requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), getAllProperties);
propertyRoutes.delete("/:id", authenticate,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), deleteProperty);
propertyRoutes.patch("/:id/feature", authenticate,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), markAsFeatureProperty);
propertyRoutes.delete("/:id/unfeature", authenticate,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), unmarkAsFeatureProperty);
propertyRoutes.patch("/:id/status", authenticate, statusProperty);
propertyRoutes.patch("/:id/reject", authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), rejectProperty);
propertyRoutes.patch("/:id/approve", authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), approveProperty);

propertyRoutes.post("/:id/like", authenticate, likeProperty );
propertyRoutes.delete('/:id/like', authenticate, unLikeProperty );
propertyRoutes.patch("/:propertyId/media", authenticate,  mediaForProperty);


export default propertyRoutes;