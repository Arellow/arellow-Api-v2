import express from 'express'
import authenticate, { adminRequireRole, isSuspended, isVerify, requireKyc, requireRole } from '../../../middlewares/auth.middleware';
import { multipleupload } from '../../../middlewares/multer';
import { validateSchema } from '../../../middlewares/propertyParsingAndValidation';
import { createLand } from '../controllers/createLand';
import { UserRole } from '../../../../generated/prisma/enums';
import { createLandsSchema } from './lands.validate';
import { getLands, singleLand } from '../controllers/lands.controller';

const landsRoutes = express.Router();


landsRoutes.post("/createlands", multipleupload, (req, res, next) => {
 
    const parsedPrice: { amount: number, currency: string } = typeof req.body.price === 'string' ? JSON.parse(req.body.price || '{}') : req.body.price;

    const body = {
        ...req.body,
        price: parsedPrice
    };
    req.body = body;
    next()

},
    validateSchema(createLandsSchema),
     authenticate, isVerify, requireKyc, isSuspended, 
     requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), 
     adminRequireRole("PROPERTY"),
     createLand);

landsRoutes.get("/:id/detail", singleLand); 
// getLands

landsRoutes.get("/", getLands);
export default landsRoutes;