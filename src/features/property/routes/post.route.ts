import express from 'express'
import { calculateProjectMortgage, getFeaturedProjects, getProjectById, getRecentProjects } from '../controllers/FetchProperties';
import authenticate from '../../../middlewares/auth.middleware';
import { createPropertyRequest } from '../../requestProperties/controllers/request';
import { getAllStates, seedNigerianStates } from '../controllers/seedPropImages';
import { toggleProjectLike } from '../controllers/likeProperty';
const propertyRoutes= express.Router();

propertyRoutes.get("/featured",getFeaturedProjects)
propertyRoutes.get("/recent",getRecentProjects)
propertyRoutes.post("/like", authenticate, toggleProjectLike );
propertyRoutes.post("/seed",seedNigerianStates)
propertyRoutes.get("/seed",getAllStates)
propertyRoutes.get("/:id",getProjectById)
propertyRoutes.post("/mortgage/:id",authenticate, calculateProjectMortgage)

//Request property
propertyRoutes.post("/requestProperty",authenticate,createPropertyRequest)



export default propertyRoutes;