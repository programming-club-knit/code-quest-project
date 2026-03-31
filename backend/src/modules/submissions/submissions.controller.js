import Submission from '../../models/Submission.js';
import Problem from '../../models/Problem.js';
import Team from '../../models/Team.js';
import System from '../../models/System.js';
import { submitCodeToJudge0, getStatusMessage } from '../../utils/judge0.js';

export const submitCode = async (req, res) => {
    try {
        const { problemId, code, languageId } = req.body;
        const teamId = req.team.teamId;

        // Check contest status
        const system = await System.findOne({});
        if (!system || system.contestStatus !== 'running') {
            return res.status(403).json({ error: 'Contest is not currently running. Submissions are disabled.' });
        }

        // Check if contest time has ended
        if (system.contestStartTime && system.contestDurationMinutes) {
            const endTime = new Date(system.contestStartTime.getTime() + system.contestDurationMinutes * 60000);
            if (new Date() > endTime) {
                return res.status(403).json({ error: 'Contest time has run out. Submissions are no longer accepted.' });
            }
        }

        const team = await Team.findById(teamId);

        // Fetch problem with test cases
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Before executing, check if problem is tied to a permanently locked riddle for this team
        if (team.permanentlyLockedRiddles && team.permanentlyLockedRiddles.length > 0) {
            // Find which riddle this problem is mapped to for THIS team
            const probIndex = team.problemSequence.findIndex(id => id.toString() === problemId.toString());
            // The mapping in getActiveProblemsByRiddle is: targetProblemId = problemSequence[riddleIndex % problemSequence.length]
            // Because multiple riddles could map to the same problem if riddles > problems, we must check ALL riddles that map here.
            let mappedRiddles = [];
            if (probIndex !== -1) {
                for (let i = 0; i < team.riddleSequence.length; i++) {
                    if (i % team.problemSequence.length === probIndex) {
                        mappedRiddles.push(team.riddleSequence[i].toString());
                    }
                }
            }

            const isLocked = mappedRiddles.some(rId => team.permanentlyLockedRiddles.map(id => id.toString()).includes(rId));

            if (isLocked) {
                return res.status(403).json({ error: 'This problem is permanently locked because you failed to solve it within the strict penalty time limit.' });
            }
        }

        if (!Array.isArray(problem.testCases) || problem.testCases.length === 0) {
            return res.status(400).json({ error: 'Problem has no test cases configured.' });
        }

        // Run against each test case using Judge0
        const results = [];
        let allTestsPassed = true;
        let hasJudgeError = false;

        for (const testCase of problem.testCases) {
            if (!testCase?.input && testCase?.input !== '') {
                allTestsPassed = false;
                results.push({
                    input: '',
                    expectedOutput: testCase?.expectedOutput?.substring?.(0, 100) || '',
                    actualOutput: 'Invalid test case input',
                    status: 'Invalid Test Case',
                    statusId: 13,
                    isHidden: testCase?.isHidden,
                    passed: false
                });
                continue;
            }

            if (typeof testCase?.expectedOutput !== 'string') {
                allTestsPassed = false;
                results.push({
                    input: testCase?.input?.substring?.(0, 100) || '',
                    expectedOutput: '',
                    actualOutput: 'Invalid expected output',
                    status: 'Invalid Test Case',
                    statusId: 13,
                    isHidden: testCase?.isHidden,
                    passed: false
                });
                continue;
            }

            try {
                const result = await submitCodeToJudge0(
                    code,
                    languageId,
                    testCase.input,
                    testCase.expectedOutput,
                    problem.timeLimit,
                    problem.memoryLimit
                );

                results.push({
                    input: testCase.input.substring(0, 100),
                    expectedOutput: testCase.expectedOutput.substring(0, 100),
                    actualOutput: result.stdout || result.stderr || '',
                    status: getStatusMessage(result.status.id),
                    statusId: result.status.id,
                    isHidden: testCase.isHidden,
                    passed: result.status.id === 3 // 3 = Accepted
                });

                if (result.status.id !== 3) {
                    allTestsPassed = false;
                }
            } catch (error) {
                allTestsPassed = false;
                hasJudgeError = true;
                results.push({
                    input: testCase.input.substring(0, 100),
                    expectedOutput: testCase.expectedOutput.substring(0, 100),
                    actualOutput: 'Error',
                    status: 'Judge Error',
                    statusId: 13,
                    isHidden: testCase.isHidden,
                    passed: false
                });
            }
        }

        const isSubmissionAccepted = allTestsPassed ? 'Accepted' : (hasJudgeError ? 'Judge Error' : 'Failed');

        // Update team solved problems if accepted and not already solved
        if (isSubmissionAccepted === 'Accepted') {
            if (!team.solvedProblems.includes(problemId)) {
                team.solvedProblems.push(problemId);
                await team.save();
            }
        }

        // Save submission to DB
        const submission = new Submission({
            teamId,
            problemId,
            code,
            languageId,
            results,
            verdict: isSubmissionAccepted,
            executionTime: results[0]?.time || 0,
            memory: results[0]?.memory || 0
        });

        await submission.save();

        res.status(200).json({
            verdict: isSubmissionAccepted,
            results,
            submissionId: submission._id
        });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ error: 'Failed to process submission' });
    }
};

export const getSubmissions = async (req, res) => {
    try {
        const { problemId } = req.query;
        const filter = { teamId: req.team.teamId }; // Only fetch the logged-in team's submissions

        if (problemId) filter.problemId = problemId;

        const submissions = await Submission.find(filter)
            .populate('problemId', 'title')
            .populate('teamId', 'teamName')
            .sort({ createdAt: -1 });

        res.status(200).json(submissions);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
};

export const getSubmissionDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const submission = await Submission.findById(id).populate('problemId').populate('teamId');

        if (!submission) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        res.status(200).json(submission);
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
};
