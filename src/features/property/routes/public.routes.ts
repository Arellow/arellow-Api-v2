import express from 'express';
import { getProperties, getTopPerforming, getAffordableProperties, singleProperty } from '../controllers/properties';
import { getAllStates } from '../controllers/seedPropImages';

const router = express.Router();

// Public routes
router.get('/', getProperties);
// router.get('/all', getProperties); 
router.get('/seed', getAllStates);
router.get('/leaderboard', getTopPerforming);
router.get('/affordable', getAffordableProperties);
router.get('/:id/detail', singleProperty);

export default router;