import express from 'express'
import { calculateProjectMortgage } from '../controllers/FetchProperties';
import authenticate, { isSuspended, requireRole } from '../../../middlewares/auth.middleware';
import { getAllStates } from '../controllers/seedPropImages';
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
import { createPropertyRequest, propertyRequestDetail, propertyRequests } from '../../requestProperties/controllers/request';

const propertyRoutes= express.Router();

propertyRoutes.post("/mortgage/:id",authenticate, calculateProjectMortgage)

//Request property
propertyRoutes.post("/requestProperty", createPropertyRequest);
propertyRoutes.get("/requestProperties", authenticate,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), propertyRequests);
propertyRoutes.get("/requestProperty/:id/detail", authenticate,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),  propertyRequestDetail);


// test by flow
propertyRoutes.get("/seed",getAllStates);
propertyRoutes.get("/selling", sellingProperties);
propertyRoutes.get("/recent", recentProperties);
propertyRoutes.post("/createproperty", authenticate, isSuspended, multipleupload, createNewProperty);
propertyRoutes.post("/updateproperty/:propertyId", authenticate,  isSuspended,  multipleupload, updateProperty);
propertyRoutes.get("/featured", featureProperties);
propertyRoutes.get("/user/archive", authenticate, getArchivedPropertiesByUser);
propertyRoutes.get("/liked", authenticate,  getLikedPropertiesByUser);
propertyRoutes.get("/user", authenticate,  getPropertiesByUser);
propertyRoutes.delete("/:id/unarchive", authenticate,  isSuspended, unArchiveProperty);
propertyRoutes.patch("/:id/archive", authenticate,  isSuspended, archiveProperty);
propertyRoutes.get("/allarchive", requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), getAllArchivedProperties);
propertyRoutes.get("/:id/detail",singleProperty);
propertyRoutes.get("/all", requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), getAllProperties);
propertyRoutes.delete("/:id", authenticate,  isSuspended,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), deleteProperty);
propertyRoutes.patch("/:id/feature", authenticate,  isSuspended,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), markAsFeatureProperty);
propertyRoutes.delete("/:id/unfeature", authenticate,  isSuspended,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), unmarkAsFeatureProperty);
propertyRoutes.patch("/:id/status", authenticate, isSuspended,  statusProperty);
propertyRoutes.patch("/:id/reject", authenticate, isSuspended,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), rejectProperty);
propertyRoutes.patch("/:id/approve", authenticate, isSuspended,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), approveProperty);

propertyRoutes.post("/:id/like", authenticate, isSuspended,  likeProperty );
propertyRoutes.delete('/:id/like', authenticate, isSuspended,  unLikeProperty );
propertyRoutes.patch("/:propertyId/media", authenticate, isSuspended,   mediaForProperty);


export default propertyRoutes;