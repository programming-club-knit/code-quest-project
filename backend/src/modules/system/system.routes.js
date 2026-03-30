import { Router } from 'express';
import { getSystemStatus, updateSystemStatus } from './system.controller.js';
import { verifyAdmin } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public route to get current status (for client to know if it can access contest)
router.get('/status', getSystemStatus);

// Protected route to update status
router.put('/status', verifyAdmin, updateSystemStatus);

export default router;