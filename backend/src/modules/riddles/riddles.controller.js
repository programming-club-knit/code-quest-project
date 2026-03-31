import Riddle from '../../models/Riddle.js';
import Problem from '../../models/Problem.js';
import Team from '../../models/Team.js';
import System from '../../models/System.js';

async function syncPenaltyState(team, system) {
    if (!system || !system.contestStartTime) return false;
    const now = new Date();
    let updated = false;

    if (team.penaltyUnlock && team.penaltyUnlock.triggered) {
        const penaltyId = team.penaltyUnlock.riddleId;
        if (!penaltyId) return false;

        const isPermanentlyLocked = team.permanentlyLockedRiddles.includes(penaltyId);

        if (!isPermanentlyLocked) {
            const diffMins = (now - team.penaltyUnlock.triggeredAt) / 60000;
            const penaltyLimit = system.penaltyMinutes || 15;

            if (diffMins >= penaltyLimit) {
                let fullySolved = false;
                if (team.solvedRiddles.includes(penaltyId)) {
                    // Find the dynamically mapped problem for this team and riddle
                    const riddleIndex = team.riddleSequence.findIndex(id => id.toString() === penaltyId.toString());
                    let targetProblemId = null;
                    if (riddleIndex !== -1 && team.problemSequence && team.problemSequence.length > 0) {
                        targetProblemId = team.problemSequence[riddleIndex % team.problemSequence.length];
                    }

                    if (targetProblemId && team.solvedProblems.includes(targetProblemId)) {
                        fullySolved = true;
                    }
                }

                if (!fullySolved) {
                    team.permanentlyLockedRiddles.push(penaltyId);
                    updated = true;
                }
            }
        }
    }
    return updated;
}

export const getActiveRiddles = async (req, res) => {
    try {
        const system = await System.findOne({});
        let team = await Team.findById(req.team.teamId);

        let riddles = await Riddle.find({ isActive: true }).select('-answer');

        const activeIds = riddles.map(r => r._id.toString());
        const currentSeqIds = (team.riddleSequence || []).map(id => id.toString());

        let newIds = activeIds.filter(id => !currentSeqIds.includes(id));
        const validSeqIds = currentSeqIds.filter(id => activeIds.includes(id));

        let shouldSave = false;

        if (validSeqIds.length !== currentSeqIds.length) {
            shouldSave = true;
        }

        if (newIds.length > 0) {
            for (let i = newIds.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newIds[i], newIds[j]] = [newIds[j], newIds[i]];
            }
            validSeqIds.push(...newIds);
            shouldSave = true;
        }

        if (shouldSave || !team.riddleSequence) {
            team.riddleSequence = validSeqIds;
            await team.save();
        }

        const penaltyUpdated = await syncPenaltyState(team, system);
        if (penaltyUpdated) {
            await team.save();
        }

        const solvedIds = team.solvedRiddles.map(id => id.toString());
        const lockedIds = team.permanentlyLockedRiddles.map(id => id.toString());

        const isPenaltyActive = team.penaltyUnlock && team.penaltyUnlock.triggered &&
            !lockedIds.includes(team.penaltyUnlock.riddleId?.toString()) &&
            !solvedIds.includes(team.penaltyUnlock.riddleId?.toString());

        const unlockedCount = 2 + team.solvedRiddles.length + team.permanentlyLockedRiddles.length + (isPenaltyActive ? 1 : 0);

        const sequenceMap = new Map();
        team.riddleSequence.forEach((id, index) => {
            sequenceMap.set(id.toString(), index);
        });

        let canUnlockPenalty = false;
        if (system && system.contestStatus === 'running' && team.solvedRiddles.length === 0 && (!team.penaltyUnlock || !team.penaltyUnlock.triggered)) {
            const diffMins = (new Date() - system.contestStartTime) / 60000;
            const timeoutLimit = system.timeoutMinutes || 10;
            if (diffMins >= timeoutLimit && team.riddleSequence.length >= 3) {
                canUnlockPenalty = true;
            }
        }

        let penaltyDeadline = null;
        if (isPenaltyActive) {
            penaltyDeadline = new Date(team.penaltyUnlock.triggeredAt.getTime() + (system.penaltyMinutes || 15) * 60000);
        }

        const riddlesWithStatus = riddles.map((riddle) => {
            const rId = riddle._id.toString();
            const index = sequenceMap.get(rId) ?? Number.MAX_SAFE_INTEGER;

            let status = 'locked';
            if (solvedIds.includes(rId)) {
                status = 'solved';
            } else if (lockedIds.includes(rId)) {
                status = 'permanently_locked';
            } else if (index < unlockedCount) {
                status = 'unlocked';
            }

            return {
                ...riddle.toObject(),
                title: index !== Number.MAX_SAFE_INTEGER ? `Riddle ${index + 1}` : riddle.title,
                status,
                isSolved: status === 'solved',
                isPenaltyTarget: isPenaltyActive && rId === team.penaltyUnlock.riddleId?.toString()
            };
        });

        riddlesWithStatus.sort((a, b) => {
            const aIndex = sequenceMap.get(a._id.toString()) ?? Number.MAX_SAFE_INTEGER;
            const bIndex = sequenceMap.get(b._id.toString()) ?? Number.MAX_SAFE_INTEGER;
            return aIndex - bIndex;
        });

        // The user wants to see the locked riddles in the UI to know they exist
        const visibleRiddles = riddlesWithStatus;

        // Note: we're returning { riddles, canUnlockPenalty, penaltyDeadline } here
        res.status(200).json({
            riddles: visibleRiddles,
            canUnlockPenalty,
            penaltyDeadline: penaltyDeadline?.toISOString()
        });
    } catch (error) {
        console.error('Error fetching riddles:', error);
        res.status(500).json({ error: 'Failed to fetch riddles' });
    }
};

export const getRiddleById = async (req, res) => {
    try {
        const { id } = req.params;
        const system = await System.findOne({});
        const team = await Team.findById(req.team.teamId);

        await syncPenaltyState(team, system);

        const lockedIds = team.permanentlyLockedRiddles.map(rId => rId.toString());
        if (lockedIds.includes(id)) {
            return res.status(403).json({ error: 'This riddle is permanently locked.' });
        }

        const solvedIds = team.solvedRiddles.map(rId => rId.toString());
        const isPenaltyActive = team.penaltyUnlock && team.penaltyUnlock.triggered &&
            !lockedIds.includes(team.penaltyUnlock.riddleId?.toString()) &&
            !solvedIds.includes(team.penaltyUnlock.riddleId?.toString());

        const unlockedCount = 2 + team.solvedRiddles.length + team.permanentlyLockedRiddles.length + (isPenaltyActive ? 1 : 0);
        let sequenceIndex = team.riddleSequence.findIndex(rId => rId.toString() === id.toString());

        if (sequenceIndex >= unlockedCount) {
            return res.status(403).json({ error: 'This riddle is currently locked.' });
        }

        const riddle = await Riddle.findOne({ _id: id, isActive: true }).select('-answer');

        if (!riddle) {
            return res.status(404).json({ error: 'Riddle not found or inactive' });
        }

        const isSolved = solvedIds.includes(id);
        const displayTitle = sequenceIndex !== -1 ? `Riddle ${sequenceIndex + 1}` : riddle.title;

        res.status(200).json({ ...riddle.toObject(), title: displayTitle, isSolved, status: isSolved ? 'solved' : 'unlocked' });
    } catch (error) {
        console.error('Error fetching riddle:', error);
        res.status(500).json({ error: 'Failed to fetch riddle' });
    }
};

export const triggerPenaltyUnlock = async (req, res) => {
    try {
        const system = await System.findOne({});
        if (!system || system.contestStatus !== 'running') {
            return res.status(403).json({ error: 'Contest is not running.' });
        }

        const team = await Team.findById(req.team.teamId);
        if (team.solvedRiddles.length > 0) {
            return res.status(400).json({ error: 'You have already solved a riddle, unlock conditions not met.' });
        }
        if (team.penaltyUnlock && team.penaltyUnlock.triggered) {
            return res.status(400).json({ error: 'Penalty unlock already triggered.' });
        }

        const diffMins = (new Date() - system.contestStartTime) / 60000;
        const timeoutLimit = system.timeoutMinutes || 30;

        if (diffMins < timeoutLimit) {
            return res.status(400).json({ error: `You must wait ${timeoutLimit} minutes to use this option.` });
        }

        if (team.riddleSequence.length < 3) {
            return res.status(400).json({ error: 'Not enough riddles available.' });
        }

        team.penaltyUnlock = {
            triggered: true,
            triggeredAt: new Date(),
            riddleId: team.riddleSequence[2]
        };
        await team.save();

        res.status(200).json({ message: 'Third riddle unlocked with a strict timeout!' });
    } catch (error) {
        console.error('Error triggering penalty unlock:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const solveRiddle = async (req, res) => {
    try {
        const { id } = req.params;
        const { answer } = req.body;

        const system = await System.findOne({});
        if (!system || system.contestStatus !== 'running') {
            return res.status(403).json({ error: 'Contest is not currently running. Submissions are disabled.' });
        }

        let team = await Team.findById(req.team.teamId);

        // Sync before checking
        const pUpdated = await syncPenaltyState(team, system);
        if (pUpdated) await team.save();

        if (team.permanentlyLockedRiddles.includes(id)) {
            return res.status(403).json({ error: 'This riddle is permanently locked.' });
        }

        if (!answer) {
            return res.status(400).json({ error: 'Answer is required' });
        }

        const riddle = await Riddle.findById(id);
        if (!riddle || !riddle.isActive) {
            return res.status(404).json({ error: 'Riddle not found or inactive' });
        }

        const isCorrect = riddle.answer.toLowerCase().trim() === answer.toLowerCase().trim();

        if (isCorrect) {
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
        res.status(500).json({ error: 'Server error' });
    }
};
