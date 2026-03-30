import Problem from '../../models/Problem.js';
import Submission from '../../models/Submission.js';
import Team from '../../models/Team.js';
import { submitCodeToJudge0, getStatusMessage } from '../../utils/judge0.js';

const executeAgainstTestCases = async ({ code, languageId, testCases, problem }) => {
    const results = [];
    let allTestsPassed = true;
    let hasJudgeError = false;
    let firstError = null;

    for (const testCase of testCases) {
        if (!testCase?.input && testCase?.input !== '') {
            allTestsPassed = false;
            const invalidInput = {
                input: '',
                expectedOutput: testCase?.expectedOutput?.substring?.(0, 100) || '',
                actualOutput: 'Invalid test case input',
                status: 'Invalid Test Case',
                statusId: 13,
                isHidden: testCase?.isHidden,
                passed: false
            };
            results.push(invalidInput);
            if (!firstError) firstError = invalidInput;
            continue;
        }

        if (typeof testCase?.expectedOutput !== 'string') {
            allTestsPassed = false;
            const invalidOutput = {
                input: testCase?.input?.substring?.(0, 100) || '',
                expectedOutput: '',
                actualOutput: 'Invalid expected output',
                status: 'Invalid Test Case',
                statusId: 13,
                isHidden: testCase?.isHidden,
                passed: false
            };
            results.push(invalidOutput);
            if (!firstError) firstError = invalidOutput;
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

            const testResult = {
                input: testCase.input.substring(0, 100),
                expectedOutput: testCase.expectedOutput.substring(0, 100),
                actualOutput: result.stdout?.substring(0, 100) || result.stderr?.substring(0, 100) || 'No output',
                status: getStatusMessage(result.status.id),
                statusId: result.status.id,
                isHidden: testCase.isHidden,
                passed: result.status.id === 3,
                executionTime: result.time,
                memory: result.memory
            };

            results.push(testResult);

            if (result.status.id !== 3) {
                allTestsPassed = false;
                if (!firstError) {
                    firstError = testResult;
                }
            }
        } catch (error) {
            allTestsPassed = false;
            hasJudgeError = true;
            const judgeError = {
                input: testCase.input.substring(0, 100),
                expectedOutput: testCase.expectedOutput.substring(0, 100),
                actualOutput: 'Error',
                status: 'Judge Error',
                statusId: 13,
                isHidden: testCase.isHidden,
                passed: false,
                error: error.message
            };
            results.push(judgeError);

            if (!firstError) {
                firstError = {
                    status: 'Judge Error',
                    message: error.message
                };
            }
        }
    }

    const verdict = allTestsPassed ? 'Accepted' : (hasJudgeError ? 'Judge Error' : 'Wrong Answer');
    return { results, allTestsPassed, hasJudgeError, firstError, verdict };
};

export const getActiveProblemsByRiddle = async (req, res) => {
    try {
        const { riddleId } = req.query;

        if (riddleId) {
            const teamId = req.team.teamId;
            const team = await Team.findById(teamId);

            // 1. Ensure problemSequence exists and is up to date
            const allActiveProblems = await Problem.find({ isActive: true }).select('_id');
            const activeProblemIds = allActiveProblems.map(p => p._id.toString());
            const currentProbSeq = (team.problemSequence || []).map(id => id.toString());

            let newProbIds = activeProblemIds.filter(id => !currentProbSeq.includes(id));
            const validProbSeqIds = currentProbSeq.filter(id => activeProblemIds.includes(id));

            let shouldSaveProb = false;

            if (validProbSeqIds.length !== currentProbSeq.length) {
                shouldSaveProb = true;
            }

            if (newProbIds.length > 0) {
                for (let i = newProbIds.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newProbIds[i], newProbIds[j]] = [newProbIds[j], newProbIds[i]];
                }
                validProbSeqIds.push(...newProbIds);
                shouldSaveProb = true;
            }

            if (shouldSaveProb || !team.problemSequence) {
                team.problemSequence = validProbSeqIds;
                await team.save();
            }

            // 2. Find the index of this riddle in the team's randomized riddleSequence
            const riddleIndex = team.riddleSequence.findIndex(id => id.toString() === riddleId.toString());

            let targetProblemId = null;

            if (riddleIndex !== -1 && team.problemSequence.length > 0) {
                // Map the riddle index to the problem index using modulo in case there are fewer problems than riddles
                targetProblemId = team.problemSequence[riddleIndex % team.problemSequence.length];
            } else if (team.problemSequence.length > 0) {
                // Fallback constraint
                targetProblemId = team.problemSequence[0];
            }

            if (targetProblemId) {
                const problem = await Problem.findById(targetProblemId).select('-testCases');
                return res.status(200).json([problem]); // Wrap in array because frontend expects data[0]
            } else {
                return res.status(200).json([]);
            }
        }

        // If no riddleId is requested, return all active problems
        const problems = await Problem.find({ isActive: true })
            .select('-testCases')
            .sort({ createdAt: 1 });

        res.status(200).json(problems);
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
};

export const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const teamId = req.team.teamId;

        const team = await Team.findById(teamId);
        const problem = await Problem.findById(id).populate('riddleId', 'title');
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        // Check if permanently locked for this team
        if (team.permanentlyLockedRiddles && team.permanentlyLockedRiddles.length > 0) {
            const probIndex = team.problemSequence.findIndex(pId => pId.toString() === id.toString());
            let mappedRiddles = [];
            if (probIndex !== -1) {
                for (let i = 0; i < team.riddleSequence.length; i++) {
                    if (i % team.problemSequence.length === probIndex) {
                        mappedRiddles.push(team.riddleSequence[i].toString());
                    }
                }
            }

            const isLocked = mappedRiddles.some(rId => team.permanentlyLockedRiddles.map(trId => trId.toString()).includes(rId));

            if (isLocked) {
                return res.status(403).json({ error: 'This problem is permanently locked because you failed to solve the penalty in time.' });
            }
        }

        // Only send visible test cases to users
        const visibleTestCases = problem.testCases.filter(tc => !tc.isHidden);

        const response = {
            ...problem.toObject(),
            testCases: visibleTestCases
        };

        // Check if team has already solved this
        const submission = await Submission.findOne({
            teamId,
            problemId: id,
            verdict: 'Accepted'
        });

        response.isSolved = !!submission;

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ error: 'Failed to fetch problem' });
    }
};

export const submitSolution = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, languageId } = req.body;
        const teamId = req.team.teamId;

        if (!code || !languageId) {
            return res.status(400).json({ error: 'Code and language ID are required' });
        }

        // Fetch problem with all test cases
        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        if (!Array.isArray(problem.testCases) || problem.testCases.length === 0) {
            return res.status(400).json({ error: 'Problem has no test cases configured.' });
        }

        // Check if solution already accepted
        const existingAccepted = await Submission.findOne({
            teamId,
            problemId: id,
            verdict: 'Accepted'
        });

        if (existingAccepted) {
            return res.status(400).json({ error: 'Problem already solved' });
        }

        const { results, allTestsPassed, firstError, verdict } = await executeAgainstTestCases({
            code,
            languageId,
            testCases: problem.testCases,
            problem
        });

        // Save submission
        const submission = new Submission({
            teamId,
            problemId: id,
            code,
            languageId,
            results,
            verdict,
            executionTime: results[0]?.executionTime || 0,
            memory: results[0]?.memory || 0
        });

        await submission.save();

        // If accepted, add to team's solved problems
        if (allTestsPassed) {
            await Team.findByIdAndUpdate(
                teamId,
                { $addToSet: { solvedProblems: id } },
                { new: true }
            );
        }

        // Return visible results only
        const visibleResults = results.filter(r => !r.isHidden);

        res.status(200).json({
            verdict,
            results: visibleResults,
            submissionId: submission._id,
            firstError: allTestsPassed ? null : firstError
        });
    } catch (error) {
        console.error('Submission error:', error);
        res.status(500).json({ error: 'Failed to process submission' });
    }
};

export const runExamples = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, languageId } = req.body;

        if (!code || !languageId) {
            return res.status(400).json({ error: 'Code and language ID are required' });
        }

        const problem = await Problem.findById(id);
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        const exampleCases = problem.testCases.filter((tc) => !tc.isHidden);
        if (exampleCases.length === 0) {
            return res.status(400).json({ error: 'No public example test cases available for this problem.' });
        }

        const { results, allTestsPassed, firstError, verdict } = await executeAgainstTestCases({
            code,
            languageId,
            testCases: exampleCases,
            problem
        });

        res.status(200).json({
            verdict,
            results,
            firstError: allTestsPassed ? null : firstError,
            mode: 'run'
        });
    } catch (error) {
        console.error('Run examples error:', error);
        res.status(500).json({ error: 'Failed to run example test cases' });
    }
};
