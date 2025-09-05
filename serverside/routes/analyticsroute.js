import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getMonthlyAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/getanalytics',authenticateToken,getMonthlyAnalytics)

export default router