import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Editor from '@monaco-editor/react';

const languageOptions = [
    { key: 'cpp', label: 'GNU C++20 (64)', judge0Id: 54 },
    { key: 'java', label: 'Java 17', judge0Id: 62 },
    { key: 'python', label: 'Python 3', judge0Id: 71 },
    { key: 'javascript', label: 'JavaScript (Node.js)', judge0Id: 63 }
];

const outputThemeByVerdict = (verdict) => {
    if (verdict === 'Accepted') return 'text-[#0d7d31] bg-[#eaf9ee] border-[#84d9a1]';
    if (verdict === 'Judge Error') return 'text-[#8a5c00] bg-[#fff7e8] border-[#f1c36e]';
    return 'text-[#a11d1d] bg-[#fff1f1] border-[#f0a3a3]';
};

const ProblemPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [language, setLanguage] = useState('cpp');
    const [sourceCode, setSourceCode] = useState('// Write your code here\n');
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [leftActiveTab, setLeftActiveTab] = useState('description');
    const [testcaseActiveTab, setTestcaseActiveTab] = useState('testcase');

    const [runCaseIndex, setRunCaseIndex] = useState(0);
    const [submitCaseIndex, setSubmitCaseIndex] = useState(0);
    const [isResultCollapsed, setIsResultCollapsed] = useState(false);

    const selectedLanguage = useMemo(
        () => languageOptions.find((option) => option.key === language) || languageOptions[0],
        [language]
    );

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/problems/${id}`, {
                    withCredentials: true
                });
                setProblem(data);
            } catch (error) {
                console.error('Error fetching problem:', error);
                toast.error(error.response?.data?.error || 'Failed to load problem');
                navigate('/contest');
            } finally {
                setLoading(false);
            }
        };

        fetchProblem();
    }, [id, navigate]);

    const handleRun = async () => {
        if (!sourceCode.trim()) {
            toast.error('Please write code before running.');
            return;
        }

        try {
            setRunning(true);
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/problems/${id}/run`,
                {
                    code: sourceCode,
                    languageId: selectedLanguage.judge0Id
                },
                {
                    withCredentials: true
                }
            );

            setRunResult(data);
            setTestcaseActiveTab('result');
            setIsResultCollapsed(false);
            setRunCaseIndex(0);

            if (data.verdict === 'Accepted') {
                toast.success('All example test cases passed.');
            } else {
                toast.info(`Run result: ${data.verdict}`);
            }
        } catch (error) {
            console.error('Error running examples:', error);
            toast.error(error.response?.data?.error || 'Failed to run example test cases');
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!sourceCode.trim()) {
            toast.error('Please write code before submitting.');
            return;
        }

        try {
            setSubmitting(true);

            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/problems/${id}/submit`,
                {
                    code: sourceCode,
                    languageId: selectedLanguage.judge0Id
                },
                {
                    withCredentials: true
                }
            );

            setSubmitResult(data);
            setLeftActiveTab('submissions');
            setSubmitCaseIndex(0);
            if (data.verdict === 'Accepted') {
                setProblem((prev) => ({ ...prev, isSolved: true }));
            }

            if (data.verdict === 'Accepted') {
                toast.success('Accepted!');
            } else {
                toast.error(data.verdict || 'Submission failed');
            }
        } catch (error) {
            console.error('Error submitting solution:', error);
            toast.error(error.response?.data?.error || 'Failed to submit code');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f7f8fb] text-[#1f2937] flex items-center justify-center">
                <div className="text-sm text-[#6b7280]">Loading problem...</div>
            </div>
        );
    }

    if (!problem) {
        return null;
    }

    const runTotalCases = runResult?.results?.length || 0;
    const runPassedCases = runResult?.results?.filter(r => r.passed).length || 0;
    const activeRunCase = runResult?.results?.[runCaseIndex] || runResult?.results?.[0];

    const submitTotalCases = submitResult?.results?.length || 0;
    const submitPassedCases = submitResult?.results?.filter(r => r.passed).length || 0;
    const activeSubmitCase = submitResult?.results?.[submitCaseIndex] || submitResult?.results?.[0];

    const sampleCase = problem.testCases?.[0];

    return (
        <div className="min-h-screen bg-[#f7f8fb] text-[#1f2937] flex flex-col">
            <div className="min-h-[48px] py-2 md:py-0 border-b border-[#e5e7eb] bg-white px-3 flex flex-col md:flex-row items-start md:items-center justify-between text-xs gap-2 md:gap-0">
                <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto">
                    <div className="flex flex-wrap items-center gap-2 md:border-r border-[#e5e7eb] pr-0 md:pr-3">
                        <img src="/logo.png" alt="PTSC Logo" className="h-6 md:h-8 object-contain" />
                        <div className="hidden md:block h-5 w-px bg-[#d1d5db]"></div>
                        <img src="/knitlogo.png" alt="KNIT Logo" className="h-5 md:h-7 object-contain" />
                    </div>
                    <button
                        onClick={() => navigate('/contest')}
                        className="h-6 px-2 border border-[#d1d5db] rounded bg-[#f9fafb] hover:bg-[#f3f4f6] text-[#111827] mt-1 md:mt-0"
                    >
                        Back
                    </button>
                    <span className="text-[#6b7280] hidden sm:inline">Problem</span>
                    <span className="text-[#111827] font-semibold truncate w-full sm:w-auto max-w-full sm:max-w-[280px]">{problem.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] sm:text-xs">
                    <span className="text-[#6b7280] bg-[#f3f4f6] px-2 py-0.5 rounded">{problem.difficulty}</span>
                    <span className="text-[#6b7280] bg-[#f3f4f6] px-2 py-0.5 rounded">{problem.points} pts</span>
                    {problem.isSolved && <span className="text-[#16a34a] font-semibold px-2">Solved</span>}
                </div>
            </div>

            <div className="flex-1 p-2 md:p-3 overflow-hidden">
                <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-3 pb-8 md:pb-0 overflow-y-auto lg:overflow-hidden">
                    <div className="bg-white border border-[#e5e7eb] rounded-md overflow-hidden flex flex-col min-h-[400px] lg:min-h-0 lg:h-full">
                        <div className="min-h-[36px] border-b border-[#e5e7eb] flex items-center text-xs text-[#6b7280] bg-[#fafafa] flex-wrap">
                            <button
                                onClick={() => setLeftActiveTab('description')}
                                className={`px-4 py-2 sm:py-0 sm:h-full border-r border-b sm:border-b-0 border-[#e5e7eb] ${leftActiveTab === 'description' ? 'text-[#111827] bg-white font-semibold' : 'hover:bg-[#f3f4f6]'}`}
                            >
                                Description
                            </button>
                            <button
                                onClick={() => setLeftActiveTab('submissions')}
                                className={`px-4 py-2 sm:py-0 sm:h-full border-r border-[#e5e7eb] ${leftActiveTab === 'submissions' ? 'text-[#111827] bg-white font-semibold' : 'hover:bg-[#f3f4f6]'}`}
                            >
                                Submissions
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-0">
                            {leftActiveTab === 'description' ? (
                                <div className="p-4 md:p-5 text-sm leading-relaxed text-[#111827]">
                                    <h1 className="text-2xl font-semibold mb-3 text-[#111827]">{problem.title}</h1>
                                    <p className="mb-5 whitespace-pre-wrap">{problem.description}</p>

                                    <h2 className="text-sm font-semibold text-[#111827] mb-1">Input</h2>
                                    <p className="text-[#374151] whitespace-pre-wrap mb-4">{problem.inputFormat}</p>

                                    <h2 className="text-sm font-semibold text-[#111827] mb-1">Output</h2>
                                    <p className="text-[#374151] whitespace-pre-wrap mb-4">{problem.outputFormat}</p>

                                    <h2 className="text-sm font-semibold text-[#111827] mb-1">Constraints</h2>
                                    <p className="text-[#374151] whitespace-pre-wrap mb-6">{problem.constraints}</p>

                                    <h2 className="text-base font-semibold text-[#111827] mb-2">Example</h2>
                                    {sampleCase ? (
                                        <div className="space-y-3">
                                            <div className="border border-[#d1d5db] rounded-md bg-[#f9fafb] p-3">
                                                <p className="text-[#6b7280] text-xs uppercase tracking-wide mb-1">Input</p>
                                                <pre className="whitespace-pre-wrap font-mono text-sm text-[#111827]">{sampleCase.input}</pre>
                                            </div>
                                            <div className="border border-[#d1d5db] rounded-md bg-[#f9fafb] p-3">
                                                <p className="text-[#6b7280] text-xs uppercase tracking-wide mb-1">Output</p>
                                                <pre className="whitespace-pre-wrap font-mono text-sm text-[#111827]">{sampleCase.expectedOutput}</pre>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="border border-[#f3d089] rounded-md bg-[#fff8e7] p-3 text-[#8a6d3b] text-sm">
                                            No public example is configured for this problem yet.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 md:p-5 text-sm">
                                    {!submitResult ? (
                                        <div className="text-center text-[#6b7280] mt-10">
                                            Submit your solution to see results here.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className={`text-sm px-4 py-3 border rounded-md flex flex-col gap-1 ${outputThemeByVerdict(submitResult.verdict)}`}>
                                                <span className="font-bold text-base">{submitResult.verdict}</span>
                                                <span className="opacity-90">{submitPassedCases}/{submitTotalCases} testcases passed</span>
                                                <span className="opacity-90 mt-1 font-mono text-xs">Runtime: {activeSubmitCase?.executionTime || '0'} ms</span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                {submitResult.results?.map((r, index) => (
                                                    <button
                                                        key={`submit-case-${index}`}
                                                        onClick={() => setSubmitCaseIndex(index)}
                                                        className={`px-3 py-1.5 text-xs rounded border ${index === submitCaseIndex
                                                            ? 'bg-[#f3f4f6] border-[#d1d5db] text-[#111827]'
                                                            : 'bg-white border-[#e5e7eb] text-[#4b5563]'}`}
                                                    >
                                                        <span className={`mr-1 ${r.passed ? 'text-[#16a34a]' : 'text-[#ef4444]'}`}>{r.passed ? '✓' : '•'}</span>
                                                        Case {index + 1}
                                                    </button>
                                                ))}
                                            </div>

                                            {activeSubmitCase && (
                                                <div className="border border-[#e5e7eb] rounded bg-[#fafafa] p-3 space-y-3 text-xs text-[#374151]">
                                                    <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-2">
                                                        <span className="text-[#111827] font-semibold text-sm">{activeSubmitCase.status}</span>
                                                        <span className={activeSubmitCase.passed ? 'text-[#16a34a] font-semibold' : 'text-[#ef4444] font-semibold'}>
                                                            {activeSubmitCase.passed ? 'Passed' : 'Failed'}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-2 pt-1">
                                                        <div>
                                                            <p className="text-[#6b7280] mb-1 font-medium">Input</p>
                                                            <pre className="whitespace-pre-wrap font-mono bg-white border border-[#e5e7eb] p-2 rounded max-h-32 text-[11px] overflow-auto">{activeSubmitCase.input}</pre>
                                                        </div>
                                                        <div>
                                                            <p className="text-[#6b7280] mb-1 font-medium">Expected Output</p>
                                                            <pre className="whitespace-pre-wrap font-mono bg-white border border-[#e5e7eb] p-2 rounded max-h-32 text-[11px] overflow-auto">{activeSubmitCase.expectedOutput}</pre>
                                                        </div>
                                                        <div>
                                                            <p className="text-[#6b7280] mb-1 font-medium">Actual Output</p>
                                                            <pre className="whitespace-pre-wrap font-mono bg-white border border-[#e5e7eb] p-2 rounded max-h-32 text-[11px] overflow-auto">{activeSubmitCase.actualOutput}</pre>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white border border-[#e5e7eb] rounded-md overflow-hidden flex flex-col min-h-[500px] lg:min-h-0 lg:h-full">
                        <div className="min-h-[36px] border-b border-[#e5e7eb] px-3 py-2 sm:py-0 flex flex-wrap items-center justify-between gap-2 text-xs bg-[#fafafa]">
                            <div className="flex items-center gap-2 text-[#6b7280]">
                                <span className="text-[#111827] font-semibold">Code</span>
                                <select
                                    className="h-6 px-2 text-xs rounded border border-[#d1d5db] bg-white text-[#111827] outline-none"
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                >
                                    {languageOptions.map((option) => (
                                        <option key={option.key} value={option.key}>{option.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleRun}
                                    disabled={running || submitting}
                                    className="h-6 px-3 text-xs rounded border border-[#d1d5db] bg-white hover:bg-[#f3f4f6] text-[#111827] disabled:opacity-50"
                                >
                                    {running ? 'Running...' : 'Run'}
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting || running || problem.isSolved}
                                    className="h-6 px-3 text-xs rounded border border-[#15803d] bg-[#16a34a] hover:bg-[#15803d] text-white disabled:opacity-50"
                                >
                                    {problem.isSolved ? 'Solved' : (submitting ? 'Submitting...' : 'Submit')}
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 min-h-[300px] lg:min-h-[260px]">
                            <Editor
                                height="100%"
                                language={language}
                                theme="vs-light"
                                value={sourceCode}
                                onChange={(value) => setSourceCode(value || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    wordWrap: 'on',
                                    scrollBeyondLastLine: false
                                }}
                            />
                        </div>

                        <div className="h-auto lg:h-[34%] min-h-[250px] lg:min-h-[210px] border-t border-[#e5e7eb] bg-white flex flex-col">
                            <div className="min-h-[36px] py-1 border-b border-[#e5e7eb] flex flex-wrap items-center justify-between gap-2 text-xs bg-[#fafafa] px-2">
                                <div className="flex bg-[#fafafa] h-full">
                                    <button
                                        onClick={() => setTestcaseActiveTab('testcase')}
                                        className={`px-3 py-1.5 sm:py-0 sm:h-8 border-r border-[#e5e7eb] ${testcaseActiveTab === 'testcase' ? 'text-[#111827] bg-white font-semibold' : 'text-[#6b7280] hover:bg-[#f3f4f6]'}`}
                                    >
                                        Testcase
                                    </button>
                                    <button
                                        onClick={() => setTestcaseActiveTab('result')}
                                        className={`px-3 py-1.5 sm:py-0 sm:h-8 ${testcaseActiveTab === 'result' ? 'text-[#111827] bg-white font-semibold' : 'text-[#6b7280] hover:bg-[#f3f4f6]'}`}
                                    >
                                        Test Result
                                    </button>
                                </div>
                                <button
                                    onClick={() => setIsResultCollapsed((prev) => !prev)}
                                    className="h-6 px-2 border border-[#d1d5db] rounded bg-white hover:bg-[#f3f4f6] text-[#374151]"
                                >
                                    {isResultCollapsed ? 'Expand' : 'Collapse'}
                                </button>
                            </div>

                            {!isResultCollapsed && <div className="flex-1 overflow-auto p-3 text-sm">
                                {testcaseActiveTab === 'testcase' ? (
                                    <div className="space-y-4">
                                        {/* Simple static view of the first test case or list of testcases */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button className="px-3 py-1.5 text-xs rounded border bg-[#f3f4f6] border-[#d1d5db] text-[#111827]">
                                                Case 1
                                            </button>
                                        </div>
                                        {sampleCase ? (
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-[#6b7280] text-xs mb-1">Input</p>
                                                    <pre className="whitespace-pre-wrap font-mono bg-[#f9fafb] border border-[#d1d5db] p-2 rounded text-xs">{sampleCase.input}</pre>
                                                </div>
                                                <div>
                                                    <p className="text-[#6b7280] text-xs mb-1">Expected Output</p>
                                                    <pre className="whitespace-pre-wrap font-mono bg-[#f9fafb] border border-[#d1d5db] p-2 rounded text-xs">{sampleCase.expectedOutput}</pre>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-gray-500 text-xs">No sample test case available.</div>
                                        )}
                                    </div>
                                ) : (
                                    !runResult ? (
                                        <div className="h-full flex items-center justify-center text-[#6b7280] text-sm">
                                            Run your code on examples to see results here
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className={`text-xs px-3 py-2 border rounded flex items-center justify-between ${outputThemeByVerdict(runResult.verdict)}`}>
                                                <span className="font-semibold">{runResult.verdict}</span>
                                                <span>Runtime: {activeRunCase?.executionTime || '0'} ms</span>
                                            </div>

                                            <div className="text-sm font-semibold text-[#111827]">
                                                {runResult.verdict} {runPassedCases}/{runTotalCases} testcases passed
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                                {runResult.results?.map((r, index) => (
                                                    <button
                                                        key={`run-case-${index}`}
                                                        onClick={() => setRunCaseIndex(index)}
                                                        className={`px-3 py-1.5 text-xs rounded border ${index === runCaseIndex
                                                            ? 'bg-[#f3f4f6] border-[#d1d5db] text-[#111827]'
                                                            : 'bg-white border-[#e5e7eb] text-[#4b5563]'}`}
                                                    >
                                                        <span className={`mr-1 ${r.passed ? 'text-[#16a34a]' : 'text-[#ef4444]'}`}>{r.passed ? '✓' : '•'}</span>
                                                        Case {index + 1}
                                                    </button>
                                                ))}
                                            </div>

                                            {activeRunCase && (
                                                <div className="border border-[#e5e7eb] rounded bg-[#fafafa] p-3 space-y-2 text-xs text-[#374151]">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[#111827] font-semibold">{activeRunCase.status}</span>
                                                        <span className={activeRunCase.passed ? 'text-[#16a34a]' : 'text-[#ef4444]'}>
                                                            {activeRunCase.passed ? 'Passed' : 'Failed'}
                                                        </span>
                                                    </div>

                                                    <div>
                                                        <p className="text-[#6b7280] mb-1">Input</p>
                                                        <pre className="whitespace-pre-wrap font-mono bg-white border border-[#e5e7eb] p-2 rounded">{activeRunCase.input}</pre>
                                                    </div>
                                                    <div>
                                                        <p className="text-[#6b7280] mb-1">Expected Output</p>
                                                        <pre className="whitespace-pre-wrap font-mono bg-white border border-[#e5e7eb] p-2 rounded">{activeRunCase.expectedOutput}</pre>
                                                    </div>
                                                    <div>
                                                        <p className="text-[#6b7280] mb-1">Actual Output</p>
                                                        <pre className="whitespace-pre-wrap font-mono bg-white border border-[#e5e7eb] p-2 rounded">{activeRunCase.actualOutput}</pre>
                                                    </div>
                                                    <p className="text-[#6b7280] mt-2">Time: {activeRunCase.executionTime || '-'} ms | Memory: {activeRunCase.memory || '-'} KB</p>
                                                </div>
                                            )}
                                        </div>
                                    )
                                )}
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProblemPage;
