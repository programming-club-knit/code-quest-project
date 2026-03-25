import { Router } from 'express';
import {
    getProblemById,
    getActiveProblemsByRiddle,
    submitSolution,
    runExamples
} from './problems.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

// Get all active problems (or by riddle)
router.get('/', getActiveProblemsByRiddle);

// Get specific problem details
router.get('/:id', getProblemById);

// Run only on visible example test cases
router.post('/:id/run', runExamples);

// Submit and test solution
router.post('/:id/submit', submitSolution);

export default router;
