import Team from '../../models/Team.js';
import Submission from '../../models/Submission.js';
import Problem from '../../models/Problem.js';

let cachedLeaderboard = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10 * 1000; // 10 seconds

export const getLeaderboard = async (req, res) => {
    try {
        const now = Date.now();
        if (cachedLeaderboard && (now - lastCacheTime < CACHE_TTL_MS)) {
            return res.status(200).json(cachedLeaderboard);
        }

        const teams = await Team.find({ isVerified: true, isDisqualified: false }).select('_id teamName');
        const activeProblems = await Problem.find({ isActive: true }).select('_id title points');

        const problemPoints = {};
        activeProblems.forEach(p => {
            problemPoints[p._id.toString()] = p.points;
        });

        const leaderboard = [];

        for (const team of teams) {
            const allSubmissions = await Submission.find({ teamId: team._id }).sort({ createdAt: 1 });

            let totalScore = 0;
            let latestSolveTime = 0;
            const problemsSolvedByTeam = {};
            const failedCounts = {};

            const PENALTY_PER_FAIL = 15;

            for (const sub of allSubmissions) {
                const pId = sub.problemId.toString();

                if (problemsSolvedByTeam[pId]) {
                    continue;
                }

                if (sub.verdict === 'Accepted') {
                    problemsSolvedByTeam[pId] = true;

                    if (problemPoints[pId]) {
                        const baseScore = problemPoints[pId];
                        const penalty = (failedCounts[pId] || 0) * PENALTY_PER_FAIL;

                        let earnedScore = baseScore - penalty;
                        if (earnedScore < 0) earnedScore = 0;

                        totalScore += earnedScore;

                        const solveTimeNum = new Date(sub.createdAt).getTime();
                        if (solveTimeNum > latestSolveTime) {
                            latestSolveTime = solveTimeNum;
                        }
                    }
                } else if (sub.verdict === 'Failed') {
                    failedCounts[pId] = (failedCounts[pId] || 0) + 1;
                }
            }

            leaderboard.push({
                teamId: team._id,
                teamName: team.teamName,
                score: totalScore,
                latestSolveTime,
                problems: problemsSolvedByTeam
            });
        }

        leaderboard.sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.latestSolveTime - b.latestSolveTime;
        });

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

        const responsePayload = {
            leaderboard,
            problems: activeProblems.map(p => ({ id: p._id, title: p.title }))
        };

        cachedLeaderboard = responsePayload;
        lastCacheTime = now;

        res.status(200).json(responsePayload);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};
