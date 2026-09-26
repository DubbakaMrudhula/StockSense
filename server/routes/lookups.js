import express from 'express';
import { getUoms, getLocations, getStats } from '../controllers/lookupController.js';

const router = express.Router();

router.get('/uoms', getUoms);
router.get('/locations', getLocations);
router.get('/stats', getStats);

export default router;
