// import express from 'express'
// import authenticate, { adminRequireRole, isSuspended, isVerify, requireKyc, requireRole } from '../../../middlewares/auth.middleware';
// import { multipleupload } from '../../../middlewares/multer';
// import { validateSchema } from '../../../middlewares/propertyParsingAndValidation';
// import { createLand } from '../controllers/createLand';
// import { UserRole } from '../../../../generated/prisma/enums';
// import { createLandsSchema } from './lands.validate';
// import { getLands, singleLand } from '../controllers/lands.controller';

// const landsRoutes = express.Router();


// landsRoutes.post("/createland/:id", multipleupload, (req, res, next) => {
 
//     const parsedPrice: { amount: number, currency: string } = typeof req.body.price === 'string' ? JSON.parse(req.body.price || '{}') : req.body.price;

//     const body = {
//         ...req.body,
//         price: parsedPrice
//     };
//     req.body = body;
//     next()

// },
//     validateSchema(createLandsSchema),
//      authenticate, isVerify, requireKyc, isSuspended, 
//      requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), 
//      adminRequireRole("PROPERTY"),
//      createLand);

// landsRoutes.get("/:id/detail", singleLand); 
// // getLands

// landsRoutes.get("/", getLands);
// export default landsRoutes;





import express from 'express';
import authenticate, { adminRequireRole, isSuspended, isVerify, requireKyc, requireRole , rejectSuperAdmin} from '../../../middlewares/auth.middleware';
import { multipleupload } from '../../../middlewares/multer';
import { validateSchema } from '../../../middlewares/propertyParsingAndValidation';
import { createLandsSchema } from './lands.validate';
import { getLands, getLandsByPartner, shareLand, singleLand } from '../controllers/lands.controller';
import { UserRole } from '../../../../generated/prisma/enums';
import { parseLandBody } from '../../../utils/parseJson';
import { createLand } from '../controllers/createLand.controller';

const landsRoutes = express.Router();

/** Public routes */
landsRoutes.get('/', getLands);
landsRoutes.get('/:id/detail', singleLand);
landsRoutes.get('/:id/partners', getLandsByPartner);
landsRoutes.post('/:id/share', shareLand);


/** Admin routes */
const adminMiddlewares = [
  authenticate,
  isVerify,
  requireKyc,
  isSuspended,
  rejectSuperAdmin,
  requireRole(UserRole.ADMIN),
  adminRequireRole('LAND')
];

landsRoutes.post(
  '/createland/:id',
  multipleupload,
  parseLandBody,
  validateSchema(createLandsSchema),
  ...adminMiddlewares,
  createLand
);

export default landsRoutes;