import express from 'express'
import { adminDashbroad, getDashbroadChart } from '../controllers/admin';
import authenticate from '../../../middlewares/auth.middleware';

const adminRoutes =  express.Router();

adminRoutes.get("/dashbroad", authenticate, adminDashbroad);
adminRoutes.get("/dashbroadchart",  authenticate, getDashbroadChart);


export default adminRoutes;