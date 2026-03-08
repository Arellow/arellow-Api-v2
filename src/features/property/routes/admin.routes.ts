import express from 'express';
import authenticate, { isSuspended, requireRole, adminRequireRole } from '../../../middlewares/auth.middleware';
import { UserRole } from '../../../../generated/prisma/enums';
import { multipleupload } from '../../../middlewares/multer';
import { validateSchema } from '../../../middlewares/propertyParsingAndValidation';
import { parsePropertyBody } from '../../../utils/parseJson';
import { changeStatusSchema, createPropertySchema } from './property.validate';
import {
  approveProperty,
  rejectProperty,
  statusProperty,
  unArchiveProperty,
  archiveProperty,
  markAsFeatureProperty,
  unmarkAsFeatureProperty,
  deleteProperty,
  getAllProperties,
  getAllArchivedProperties
} from '../controllers/properties';
import { createProperty } from '../controllers/createProperty.controller';
import { updateProperty } from '../controllers/updateProperty.controller';

const router = express.Router();

const adminMiddlewares = [
  authenticate,
  isSuspended,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminRequireRole('PROPERTY')
];

// Admin property actions
router.get('/all', adminMiddlewares, getAllProperties);
router.get('/allarchive', adminMiddlewares, getAllArchivedProperties);

router.post(
  '/createproperty',
  ...adminMiddlewares,
  multipleupload,
  parsePropertyBody,
  validateSchema(createPropertySchema),
  createProperty
);

router.patch(
  '/:propertyId/update',
  ...adminMiddlewares,
  multipleupload,
  parsePropertyBody,
  validateSchema(createPropertySchema),
  updateProperty
);

router.patch('/:id/status', validateSchema(changeStatusSchema), ...adminMiddlewares, statusProperty);
router.patch('/:id/approve', ...adminMiddlewares, approveProperty);
router.patch('/:id/reject', ...adminMiddlewares, rejectProperty);

router.patch('/:id/unarchive', ...adminMiddlewares, unArchiveProperty);
router.delete('/:id/archive', ...adminMiddlewares, archiveProperty);

router.patch('/:id/feature', ...adminMiddlewares, markAsFeatureProperty);
router.delete('/:id/unfeature', ...adminMiddlewares, unmarkAsFeatureProperty);

router.delete('/:id', ...adminMiddlewares, deleteProperty);

export default router;