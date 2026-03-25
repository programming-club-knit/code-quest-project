import { Router } from 'express';
import { submitCode, getSubmissions, getSubmissionDetails } from './submissions.controller.js';
import { verifyToken } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyToken);

// Submit code for judgment
router.post('/submit', submitCode);

// Get submissions (with optional filters)
router.get('/', getSubmissions);

// Get specific submission details
router.get('/:id', getSubmissionDetails);

export default router;
