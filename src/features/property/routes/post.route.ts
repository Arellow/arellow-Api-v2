// import express from 'express'
// import authenticate, { adminRequireRole, isSuspended, isVerify, requireKyc, requireRole } from '../../../middlewares/auth.middleware';
// import { getAllStates } from '../controllers/seedPropImages';
// import {
//     approveProperty, archiveProperty, likeProperty, rejectProperty, singleProperty,
//     unArchiveProperty, unLikeProperty, deleteProperty, statusProperty, getLikedPropertiesByUser,
//     getPropertiesByUser,
//     getAllProperties,
//     getAllArchivedProperties,
//     getArchivedPropertiesByUser,
//     unmarkAsFeatureProperty,
//     markAsFeatureProperty,
//     shareProperty,
//     getProperties,
//     getAffordableProperties,
//     getTopPerforming,
// } from '../controllers/properties';

// import { multipleupload } from '../../../middlewares/multer';
// import { validateSchema } from '../../../middlewares/propertyParsingAndValidation';
// import { changeStatusSchema, createPropertySchema } from './property.validate';
// import { UserRole } from '../../../../generated/prisma/enums';
// import { parsePropertyBody } from '../../../utils/parseJson';
// import { createProperty } from '../controllers/createProperty.controller';
// import { updateProperty } from '../controllers/updateProperty.controller';


// const propertyRoutes = express.Router();

// propertyRoutes.get("/", getProperties);
// propertyRoutes.get("/seed", getAllStates);

// propertyRoutes.get("/leaderboard", getTopPerforming);
// propertyRoutes.get("/affordable", getAffordableProperties);


// propertyRoutes.post(
//   "/createproperty",
//   authenticate,
//   isVerify,
//   requireKyc,
//   isSuspended,
//   multipleupload,
//   parsePropertyBody,
//   validateSchema(createPropertySchema),
//   createProperty
// );

// propertyRoutes.patch(
//   "/:propertyId/update",
//   authenticate,
//   isVerify,
//   requireKyc,
//   isSuspended,
//   multipleupload,
//   parsePropertyBody,
//   validateSchema(createPropertySchema),
//   updateProperty
// );


// propertyRoutes.get("/user/archive", authenticate, getArchivedPropertiesByUser);
// propertyRoutes.get("/liked", authenticate, getLikedPropertiesByUser);
// propertyRoutes.get("/user", authenticate, getPropertiesByUser);
// propertyRoutes.patch("/:id/unarchive", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), unArchiveProperty);
// propertyRoutes.delete("/:id/archive", authenticate, isSuspended, archiveProperty);
// propertyRoutes.get("/allarchive", authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), getAllArchivedProperties);
// propertyRoutes.get("/:id/detail", singleProperty);
// propertyRoutes.get("/all", authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), getAllProperties);

// propertyRoutes.delete("/:id", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
//     adminRequireRole("PROPERTY"),
//     deleteProperty);
// propertyRoutes.patch("/:id/feature", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), markAsFeatureProperty);
// propertyRoutes.delete("/:id/unfeature", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), unmarkAsFeatureProperty);
// propertyRoutes.patch("/:id/status", validateSchema(changeStatusSchema), authenticate, isSuspended,
// //  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), 
//  statusProperty);
// propertyRoutes.patch("/:id/reject", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), adminRequireRole("PROPERTY"), rejectProperty);
// propertyRoutes.patch("/:id/approve", authenticate, isSuspended, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), 
// adminRequireRole("PROPERTY"),
//  approveProperty);

// propertyRoutes.post("/:id/like", authenticate, isSuspended, likeProperty);
// propertyRoutes.delete('/:id/like', authenticate, isSuspended, unLikeProperty);
// propertyRoutes.post("/:id/share", shareProperty);


// export default propertyRoutes;









import express from 'express';
import authenticate, { 
  adminRequireRole, 
  isSuspended, 
  isVerify, 
  requireKyc, 
  requireRole 
} from '../../../middlewares/auth.middleware';

import { multipleupload } from '../../../middlewares/multer';
import { validateSchema } from '../../../middlewares/propertyParsingAndValidation';
import { parsePropertyBody } from '../../../utils/parseJson';
import { changeStatusSchema, createPropertySchema } from './property.validate';
import { UserRole } from '../../../../generated/prisma/enums';

import {
  approveProperty,
  archiveProperty,
  likeProperty,
  rejectProperty,
  singleProperty,
  unArchiveProperty,
  unLikeProperty,
  deleteProperty,
  statusProperty,
  getLikedPropertiesByUser,
  getPropertiesByUser,
  getAllProperties,
  getAllArchivedProperties,
  getArchivedPropertiesByUser,
  unmarkAsFeatureProperty,
  markAsFeatureProperty,
  shareProperty,
  getProperties,
  getAffordableProperties,
  getTopPerforming,
} from '../controllers/properties';

import { getAllStates } from '../controllers/seedPropImages';
import { createProperty } from '../controllers/createProperty.controller';
import { updateProperty } from '../controllers/updateProperty.controller';

const propertyRoutes = express.Router();

/**
 * ------------------------
 * Public Routes
 * ------------------------
 */
propertyRoutes.get('/', getProperties);
propertyRoutes.get('/all', authenticate, requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN), getAllProperties);
propertyRoutes.get('/seed', getAllStates);
propertyRoutes.get('/leaderboard', getTopPerforming);
propertyRoutes.get('/affordable', getAffordableProperties);
propertyRoutes.get('/:id/detail', singleProperty);

/**
 * ------------------------
 * User Routes
 * ------------------------
 */
propertyRoutes.get('/user', authenticate, getPropertiesByUser);
propertyRoutes.get('/user/archive', authenticate, getArchivedPropertiesByUser);
propertyRoutes.get('/liked', authenticate, getLikedPropertiesByUser);
propertyRoutes.post('/:id/like', authenticate, isSuspended, likeProperty);
propertyRoutes.delete('/:id/like', authenticate, isSuspended, unLikeProperty);
propertyRoutes.post('/:id/share', shareProperty);

/**
 * ------------------------
 * Property Creation & Update
 * ------------------------
 */
propertyRoutes.post(
  '/createproperty',
  authenticate,
  isVerify,
  requireKyc,
  isSuspended,
  multipleupload,
  parsePropertyBody,
  validateSchema(createPropertySchema),
  createProperty
);

propertyRoutes.patch(
  '/:propertyId/update',
  authenticate,
  isVerify,
  requireKyc,
  isSuspended,
  multipleupload,
  parsePropertyBody,
  validateSchema(createPropertySchema),
  updateProperty
);

/**
 * ------------------------
 * Admin / Moderator Actions
 * ------------------------
 */
propertyRoutes.patch(
  '/:id/status',
  validateSchema(changeStatusSchema),
  authenticate,
  isSuspended,
  // requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  // adminRequireRole("PROPERTY"),
  statusProperty
);

propertyRoutes.patch(
  '/:id/approve',
  authenticate,
  isSuspended,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminRequireRole('PROPERTY'),
  approveProperty
);

propertyRoutes.patch(
  '/:id/reject',
  authenticate,
  isSuspended,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminRequireRole('PROPERTY'),
  rejectProperty
);

propertyRoutes.patch(
  '/:id/unarchive',
  authenticate,
  isSuspended,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminRequireRole('PROPERTY'),
  unArchiveProperty
);

propertyRoutes.patch(
  '/:id/feature',
  authenticate,
  isSuspended,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminRequireRole('PROPERTY'),
  markAsFeatureProperty
);

propertyRoutes.delete(
  '/:id/unfeature',
  authenticate,
  isSuspended,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminRequireRole('PROPERTY'),
  unmarkAsFeatureProperty
);

propertyRoutes.delete(
  '/:id',
  authenticate,
  isSuspended,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminRequireRole('PROPERTY'),
  deleteProperty
);

propertyRoutes.delete(
  '/:id/archive',
  authenticate,
  isSuspended,
  archiveProperty
);

propertyRoutes.get(
  '/allarchive',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  getAllArchivedProperties
);

export default propertyRoutes;







// import express from 'express';
// import publicRoutes from './public.routes';
// import userRoutes from './user.routes';
// import adminRoutes from './admin.routes';

// const propertyRoutes = express.Router();

// // Mount sub-routers
// propertyRoutes.use('/', publicRoutes);
// propertyRoutes.use('/', userRoutes);
// propertyRoutes.use('/', adminRoutes);

// export default propertyRoutes;