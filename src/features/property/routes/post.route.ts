import express from 'express'
import { calculateProjectMortgage } from '../controllers/FetchProperties';
import authenticate, { requireRole } from '../../../middlewares/auth.middleware';
import { createPropertyRequest } from '../../requestProperties/controllers/request';
import { getAllStates, seedNigerianStates } from '../controllers/seedPropImages';
import { approveProperty, archiveProperty, likeProperty, rejectProperty, singleProperty, 
    unArchiveProperty, unLikeProperty , deleteProperty, statusProperty, getLikedPropertiesByUser, 
    getPropertiesByUser, mediaForProperty, recentPropertiesByUser, featureProperties, createNewProperty
} from '../controllers/properties';
import { UserRole } from '@prisma/client';

const propertyRoutes= express.Router();

propertyRoutes.get("/featured", featureProperties)
propertyRoutes.get("/recent", recentPropertiesByUser)
// propertyRoutes.post("/like", authenticate, toggleProjectLike );
propertyRoutes.post("/seed",seedNigerianStates)
propertyRoutes.get("/seed",getAllStates)
propertyRoutes.post("/mortgage/:id",authenticate, calculateProjectMortgage)

//Request property
// propertyRoutes.post("/requestProperty",authenticate,createPropertyRequest);


// undocumented on postman
propertyRoutes.post("/createproperty", authenticate, createNewProperty);
propertyRoutes.post("/:id/like", authenticate, likeProperty );
propertyRoutes.delete('/:id/like', authenticate, unLikeProperty );
propertyRoutes.get("/:id",singleProperty);
propertyRoutes.patch("/:id/approve", authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), approveProperty);
propertyRoutes.patch("/:id/reject", authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), rejectProperty);
propertyRoutes.patch("/:id/archive", authenticate, archiveProperty);
propertyRoutes.patch("/:id/unarchive", authenticate, unArchiveProperty);
propertyRoutes.patch("/:id/status", authenticate, statusProperty);
propertyRoutes.delete("/:id", authenticate,  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), deleteProperty);
propertyRoutes.get("/liked", authenticate,  getLikedPropertiesByUser);
propertyRoutes.get("/user", authenticate,  getPropertiesByUser);
propertyRoutes.patch("/:propertyId/media", authenticate,  mediaForProperty);


export default propertyRoutes;