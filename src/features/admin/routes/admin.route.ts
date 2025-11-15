import express from 'express'
import { adminDashbroad, getDashbroadChart } from '../controllers/admin';

const adminRoutes =  express.Router();

adminRoutes.get("/dashbroad", adminDashbroad);
adminRoutes.get("/dashbroadchart", getDashbroadChart);


export default adminRoutes;