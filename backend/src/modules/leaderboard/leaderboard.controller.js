import Team from '../../models/Team.js';
import Submission from '../../models/Submission.js';
import Problem from '../../models/Problem.js';

export const getLeaderboard = async (req, res) => {
    try {
        // Fetch all verified teams
        const teams = await Team.find({ isVerified: true, isDisqualified: false }).select('_id teamName');
        const activeProblems = await Problem.find({ isActive: true }).select('_id title points');

        // Setup point mapping
        const problemPoints = {};
        activeProblems.forEach(p => {
            problemPoints[p._id.toString()] = p.points;
        });

        // Setup leaderboards array
        const leaderboard = [];

        for (const team of teams) {
            // Find earliest 'Accepted' submission for each unique problem for this team
            // Using aggregate
            const acceptedSubmissions = await Submission.aggregate([
                { $match: { teamId: team._id, verdict: 'Accepted' } },
                { $sort: { createdAt: 1 } },
                {
                    $group: {
                        _id: '$problemId',
                        firstSolvedAt: { $first: '$createdAt' },
                        submissionId: { $first: '$_id' }
                    }
                }
            ]);

            let totalScore = 0;
            let latestSolveTime = 0; // we will use absolute ms epoch time. Alternatively, max solve time.

            const problemsSolvedByTeam = {};

            for (const sub of acceptedSubmissions) {
                const pId = sub._id.toString();
                if (problemPoints[pId]) {
                    totalScore += problemPoints[pId];
                    problemsSolvedByTeam[pId] = true;
                    const solveTimeNum = new Date(sub.firstSolvedAt).getTime();
                    if (solveTimeNum > latestSolveTime) {
                        latestSolveTime = solveTimeNum;
                    }
                }
            }

            leaderboard.push({
                teamId: team._id,
                teamName: team.teamName,
                score: totalScore,
                latestSolveTime,
                problems: problemsSolvedByTeam // to display on UI if needed
            });
        }

        // Sort leaderboard: score DESC, latestSolveTime ASC
        leaderboard.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.latestSolveTime - b.latestSolveTime;
        });

        // Add rank
        let rank = 1;
        leaderboard.forEach((entry, index) => {
            if (index > 0) {
                const prev = leaderboard[index - 1];
                if (entry.score === prev.score && entry.latestSolveTime === prev.latestSolveTime) {
                    entry.rank = prev.rank;
                } else {
                    entry.rank = rank;
                }
            } else {
                entry.rank = rank;
            }
            rank++;
        });

        res.status(200).json({
            leaderboard,
            problems: activeProblems.map(p => ({ id: p._id, title: p.title }))
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};