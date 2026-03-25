import Riddle from '../../models/Riddle.js';
import Team from '../../models/Team.js'; // Might be needed later to track solved riddles

export const getActiveRiddles = async (req, res) => {
    try {
        let team = await Team.findById(req.team.teamId);

        let riddles = await Riddle.find({ isActive: true }).select('-answer');

        if (!team.riddleSequence || team.riddleSequence.length === 0) {
            team.riddleSequence = riddles.map(r => r._id).sort(() => Math.random() - 0.5);
            await team.save();
        }

        const sequenceMap = new Map();
        team.riddleSequence.forEach((id, index) => {
            sequenceMap.set(id.toString(), index);
        });

        riddles.sort((a, b) => {
            const aIndex = sequenceMap.get(a._id.toString()) ?? Number.MAX_SAFE_INTEGER;
            const bIndex = sequenceMap.get(b._id.toString()) ?? Number.MAX_SAFE_INTEGER;
            return aIndex - bIndex;
        });

        const solvedIds = team.solvedRiddles.map(id => id.toString());
        const riddlesWithStatus = riddles.map(riddle => ({
            ...riddle.toObject(),
            isSolved: solvedIds.includes(riddle._id.toString())
        }));

        res.status(200).json(riddlesWithStatus);
    } catch (error) {
        console.error('Error fetching riddles:', error);
        res.status(500).json({ error: 'Failed to fetch riddles' });
    }
};

export const getRiddleById = async (req, res) => {
    try {
        const { id } = req.params;
        const riddle = await Riddle.findOne({ _id: id, isActive: true }).select('-answer');

        if (!riddle) {
            return res.status(404).json({ error: 'Riddle not found or inactive' });
        }

        const team = await Team.findById(req.team.teamId);
        const isSolved = team.solvedRiddles.includes(id);

        res.status(200).json({ ...riddle.toObject(), isSolved });
    } catch (error) {
        console.error('Error fetching riddle:', error);
        res.status(500).json({ error: 'Failed to fetch riddle' });
    }
};

export const solveRiddle = async (req, res) => {
    try {
        const { id } = req.params;
        const { answer } = req.body;

        if (!answer) {
            return res.status(400).json({ error: 'Answer is required' });
        }

        const riddle = await Riddle.findById(id);
        if (!riddle || !riddle.isActive) {
            return res.status(404).json({ error: 'Riddle not found or inactive' });
        }

        const isCorrect = riddle.answer.toLowerCase().trim() === answer.toLowerCase().trim();

        if (isCorrect) {
            const team = await Team.findById(req.team.teamId);
            if (!team.solvedRiddles.includes(id)) {
                team.solvedRiddles.push(id);
                await team.save();
            }
            return res.status(200).json({ correct: true, message: 'Correct answer!' });
        } else {
            return res.status(200).json({ correct: false, message: 'Incorrect answer. Try again.' });
        }
    } catch (error) {
        console.error('Error solving riddle:', error);
        res.status(500).json({ error: 'Failed to verify answer' });
    }
};
