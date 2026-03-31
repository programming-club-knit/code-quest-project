import System from '../../models/System.js';

export const getSystemStatus = async (req, res) => {
    try {
        let system = await System.findOne({});
        if (!system) {
            system = new System({ contestStatus: 'not_started' });
            await system.save();
        }
        res.status(200).json(system);
    } catch (error) {
        console.error('Error fetching system status:', error);
        res.status(500).json({ message: 'Error fetching system status.' });
    }
};

export const updateSystemStatus = async (req, res) => {
    try {
        const { status, timeoutMinutes, penaltyMinutes, contestDurationMinutes, wrongSubmissionPenalty } = req.body;
        const validStatuses = ['not_started', 'running', 'paused', 'ended'];

        let system = await System.findOne({});
        if (!system) {
            system = new System({ contestStatus: status || 'not_started' });
        }

        if (status && validStatuses.includes(status)) {
            // If transitioning to 'running' from 'not_started', set start time
            if (status === 'running' && system.contestStatus === 'not_started') {
                system.contestStartTime = new Date();
            }
            system.contestStatus = status;
        }

        if (timeoutMinutes !== undefined) system.timeoutMinutes = timeoutMinutes;
        if (penaltyMinutes !== undefined) system.penaltyMinutes = penaltyMinutes;
        if (contestDurationMinutes !== undefined) system.contestDurationMinutes = contestDurationMinutes;
        if (wrongSubmissionPenalty !== undefined) system.wrongSubmissionPenalty = wrongSubmissionPenalty;

        await system.save();

        res.status(200).json({ message: `Contest updated`, system });
    } catch (error) {
        console.error('Error updating system status:', error);
        res.status(500).json({ message: 'Error updating system status.' });
    }
};