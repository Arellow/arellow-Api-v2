import express from 'express'
import authenticate from '../../../middlewares/auth.middleware';
import { calculateCustomMortgage } from '../controllers/calculate';
const mortagageRoutes = express.Router();

mortagageRoutes.post("/calculate",authenticate, calculateCustomMortgage)
export default mortagageRoutes