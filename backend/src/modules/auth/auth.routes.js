import express from 'express';
import { registerTeam, loginTeam, logoutTeam, getProfile, loginAdmin, logoutAdmin } from './auth.controller.js';
import { verifyToken, verifyAdmin } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerTeam);
router.post('/login', loginTeam);
router.post('/logout', logoutTeam);

// Admin Auth
router.post('/admin/login', loginAdmin);
router.post('/admin/logout', logoutAdmin);
router.get('/admin/me', verifyAdmin, (req, res) => res.status(200).json({ admin: true, email: req.admin.email }));

// Protected route to get current team profile
router.get('/me', verifyToken, getProfile);

export default router;
