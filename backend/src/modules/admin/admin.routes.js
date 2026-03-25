import { Router } from 'express';
import { verifyAdmin } from '../../middlewares/auth.middleware.js';
import {
    getAllTeams,
    verifyTeam,
    unverifyTeam,
    disqualifyTeam,
    createRiddle,
    getAllRiddles,
    updateRiddle,
    deleteRiddle,
    createProblem,
    getAllProblems,
    updateProblem,
    deleteProblem
} from './admin.controller.js';

const router = Router();

router.use(verifyAdmin);

// Retrieve all teams for admin dashboard
router.get('/teams', getAllTeams);

// Admin Submissions
import Submission from '../../models/Submission.js';
router.get('/submissions', async (req, res) => {
    try {
        const { teamId, problemId } = req.query;
        let query = {};
        if (teamId) query.teamId = teamId;
        if (problemId) query.problemId = problemId;

        const submissions = await Submission.find(query)
            .populate('teamId', 'teamName')
            .populate('problemId', 'title')
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json(submissions);
    } catch (error) {
        console.error('Fetch all submissions error:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

// Update team status
router.put('/teams/:id/verify', verifyTeam);
router.put('/teams/:id/unverify', unverifyTeam);

// Disqualify / Delete team
router.put('/teams/:id/disqualify', disqualifyTeam);
router.delete('/teams/:id', disqualifyTeam);

// Riddle Management
router.post('/riddles', createRiddle);
router.get('/riddles', getAllRiddles);
router.put('/riddles/:id', updateRiddle);
router.delete('/riddles/:id', deleteRiddle);

// Problem Management
router.post('/problems', createProblem);
router.get('/problems', getAllProblems);
router.put('/problems/:id', updateProblem);
router.delete('/problems/:id', deleteProblem);

export default router;
