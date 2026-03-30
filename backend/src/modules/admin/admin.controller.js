import Team from '../../models/Team.js';
import Riddle from '../../models/Riddle.js';
import Problem from '../../models/Problem.js';

// -- TEAM MANAGEMENT --

export const getAllTeams = async (req, res) => {
    try {
        const teams = await Team.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(teams);
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({ message: 'Server error fetching teams.' });
    }
};

export const verifyTeam = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch all active riddles to shuffle for the team
        const activeRiddles = await Riddle.find({ isActive: true }).select('_id');
        const shuffledRiddles = activeRiddles.map(r => r._id).sort(() => Math.random() - 0.5);

        const team = await Team.findByIdAndUpdate(id, {
            isVerified: true,
            $setOnInsert: { riddleSequence: shuffledRiddles } // Update iff not exists, wait, findByIdAndUpdate doesn't work this way directly.
        }, { new: true });

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        // If it's empty, set it
        if (!team.riddleSequence || team.riddleSequence.length === 0) {
            team.riddleSequence = shuffledRiddles;
            await team.save();
        }

        res.status(200).json({ message: 'Team verified successfully', team });
    } catch (error) {
        console.error('Error verifying team:', error);
        res.status(500).json({ message: 'Failed to verify team.' });
    }
};

export const unverifyTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findByIdAndUpdate(id, { isVerified: false }, { new: true });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        res.status(200).json({ message: 'Team unverified successfully', team });
    } catch (error) {
        console.error('Error unverifying team:', error);
        res.status(500).json({ message: 'Failed to unverify team.' });
    }
};

export const disqualifyTeam = async (req, res) => {
    try {
        const { id } = req.params;
        const team = await Team.findByIdAndUpdate(id, { isDisqualified: true }, { new: true });
        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }
        res.status(200).json({ message: 'Team marked as disqualified.', team });
    } catch (error) {
        res.status(400).json({ error });
    }
};

// -- RIDDLE MANAGEMENT --

export const createRiddle = async (req, res) => {
    try {
        const { title, description, answer, isActive } = req.body;
        const newRiddle = new Riddle({
            title, description, answer, isActive
        });
        await newRiddle.save();
        res.status(201).json({ message: 'Riddle created successfully', riddle: newRiddle });
    } catch (error) {
        console.error('Error creating riddle:', error);
        res.status(500).json({ message: 'Failed to create riddle.' });
    }
};

export const getAllRiddles = async (req, res) => {
    try {
        const riddles = await Riddle.find().sort({ createdAt: -1 });
        res.status(200).json(riddles);
    } catch (error) {
        console.error('Error fetching riddles:', error);
        res.status(500).json({ message: 'Failed to fetch riddles.' });
    }
};

export const updateRiddle = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await Riddle.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Riddle not found.' });
        res.status(200).json({ message: 'Riddle updated successfully', riddle: updated });
    } catch (error) {
        console.error('Error updating riddle:', error);
        res.status(500).json({ message: 'Failed to update riddle.' });
    }
};

export const deleteRiddle = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Riddle.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Riddle not found.' });
        res.status(200).json({ message: 'Riddle deleted successfully.' });
    } catch (error) {
        console.error('Error deleting riddle:', error);
        res.status(500).json({ message: 'Failed to delete riddle.' });
    }
};

// -- PROBLEM MANAGEMENT --

export const createProblem = async (req, res) => {
    try {
        const { testCases = [] } = req.body;
        const visibleExamples = testCases.filter((tc) => !tc.isHidden);
        if (!testCases.length || !visibleExamples.length) {
            return res.status(400).json({ message: 'At least one non-hidden test case is required as an example.' });
        }

        const newProblem = new Problem(req.body);
        await newProblem.save();
        res.status(201).json({ message: 'Problem created successfully', problem: newProblem });
    } catch (error) {
        console.error('Error creating problem:', error);
        res.status(500).json({ message: 'Failed to create problem.' });
    }
};

export const getAllProblems = async (req, res) => {
    try {
        const problems = await Problem.find().populate('riddleId', 'title').sort({ createdAt: -1 });
        res.status(200).json(problems);
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ message: 'Failed to fetch problems.' });
    }
};

export const updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        if (Array.isArray(req.body.testCases)) {
            const visibleExamples = req.body.testCases.filter((tc) => !tc.isHidden);
            if (!req.body.testCases.length || !visibleExamples.length) {
                return res.status(400).json({ message: 'At least one non-hidden test case is required as an example.' });
            }
        }

        const updated = await Problem.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Problem not found.' });
        res.status(200).json({ message: 'Problem updated successfully', problem: updated });
    } catch (error) {
        console.error('Error updating problem:', error);
        res.status(500).json({ message: 'Failed to update problem.' });
    }
};

export const deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Problem.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: 'Problem not found.' });
        res.status(200).json({ message: 'Problem deleted successfully.' });
    } catch (error) {
        console.error('Error deleting problem:', error);
        res.status(500).json({ message: 'Failed to delete problem.' });
    }
};

// -- DASHBOARD ANALYTICS --

import Submission from '../../models/Submission.js';

export const getDashboardAnalytics = async (req, res) => {
    try {
        const [
            totalTeams,
            verifiedTeams,
            totalSubmissions,
            activeProblems,
            activeRiddles
        ] = await Promise.all([
            Team.countDocuments(),
            Team.countDocuments({ isVerified: true }),
            Submission.countDocuments(),
            Problem.countDocuments(),
            Riddle.countDocuments({ isActive: true })
        ]);

        res.status(200).json({
            totalTeams,
            verifiedTeams,
            pendingTeams: totalTeams - verifiedTeams,
            totalSubmissions,
            activeProblems,
            activeRiddles
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ message: 'Failed to fetch analytics.' });
    }
};
