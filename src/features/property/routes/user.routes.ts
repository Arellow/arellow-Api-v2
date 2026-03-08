import express from 'express';
import authenticate, { isSuspended } from '../../../middlewares/auth.middleware';
import {
  getPropertiesByUser,
  getArchivedPropertiesByUser,
  getLikedPropertiesByUser,
  likeProperty,
  unLikeProperty,
  shareProperty
} from '../controllers/properties';

const router = express.Router();

// User-specific routes
router.use(authenticate); // all routes below require auth

router.get('/user', getPropertiesByUser);
router.get('/user/archive', getArchivedPropertiesByUser);
router.get('/liked', getLikedPropertiesByUser);
router.post('/:id/like', isSuspended, likeProperty);
router.delete('/:id/like', isSuspended, unLikeProperty);
router.post('/:id/share', shareProperty);

export default router;