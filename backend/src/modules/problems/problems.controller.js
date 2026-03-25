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
        const filter = { isActive: true };

        if (riddleId) {
            filter.riddleId = riddleId;
        }

        const problems = await Problem.find(filter)
            .populate('riddleId', 'title')
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

        const problem = await Problem.findById(id).populate('riddleId', 'title');
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
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
