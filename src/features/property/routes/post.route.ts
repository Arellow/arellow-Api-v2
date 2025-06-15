import express from 'express'
import { calculateProjectMortgage, getFeaturedProjects, getProjectById, getRecentProjects } from '../controllers/FetchProperties';
import authenticate from '../../../middlewares/auth.middleware';
const propertyRoutes= express.Router();

propertyRoutes.get("/featured",getFeaturedProjects)
propertyRoutes.get("/recent",getRecentProjects)
propertyRoutes.get("/:id",getProjectById)
propertyRoutes.post("/mortgage/:id",authenticate, calculateProjectMortgage)


export default propertyRoutes;