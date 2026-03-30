import { Router } from 'express';
import { getActiveRiddles, getRiddleById, solveRiddle, triggerPenaltyUnlock } from './riddles.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// Apply auth middleware to all riddle routes
router.use(verifyToken);

router.get('/', getActiveRiddles);
router.post('/penalty-unlock', triggerPenaltyUnlock);
router.get('/:id', getRiddleById);
router.post('/:id/solve', solveRiddle);

export default router;