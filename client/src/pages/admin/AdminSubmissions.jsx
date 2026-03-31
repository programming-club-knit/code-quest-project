import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminNavbar from '../../components/AdminNavbar';

const languageMap = {
    54: 'GNU C++20',
    62: 'Java 17',
    71: 'Python 3',
    63: 'Node.js'
};

const AdminSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTeam, setSearchTeam] = useState('');
    const [searchProblem, setSearchProblem] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    const fetchSubmissions = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/submissions`, {
                withCredentials: true
            });
            setSubmissions(data);
        } catch (error) {
            console.error('Failed to fetch admin submissions', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const getVerdictStyle = (verdict) => {
        if (!verdict) return 'text-[#888] font-bold';
        if (verdict === 'Accepted') return 'text-[#00a900] font-bold';
        if (verdict.includes('error') || verdict.includes('Error')) return 'text-[#888] font-bold';
        return 'text-[#cc0000] font-bold';
    };

    const filteredSubmissions = submissions.filter(sub => {
        const tMatch = sub.teamId?.teamName?.toLowerCase().includes(searchTeam.toLowerCase());
        const pMatch = sub.problemId?.title?.toLowerCase().includes(searchProblem.toLowerCase());
        return tMatch && pMatch;
    });

    if (loading) return (
        <div className="flex bg-[#f3f3f3] items-center justify-center min-h-screen text-[14px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0000cc]"></div>
        </div>
    );

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4 px-2 sm:px-4">
            <AdminNavbar activeTab="SUBMISSIONS" />

            <div className="w-full max-w-[1200px] mt-4">
                <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm">
                    <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 rounded-t-[1px] flex flex-col sm:flex-row justify-between items-center gap-2">
                        <span>All Global Submissions <span className="text-[#cc0000] ml-2 text-[11px] font-normal">● LIVE</span></span>
                        <div className="flex gap-2 flex-wrap justify-center">
                            <input
                                type="text"
                                placeholder="Filter by team..."
                                value={searchTeam}
                                onChange={(e) => setSearchTeam(e.target.value)}
                                className="text-[12px] px-2 py-1 border border-[#ccc] focus:outline-none"
                            />
                            <input
                                type="text"
                                placeholder="Filter by problem..."
                                value={searchProblem}
                                onChange={(e) => setSearchProblem(e.target.value)}
                                className="text-[12px] px-2 py-1 border border-[#ccc] focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-[#b9b9b9] text-[#222]">
                                    <th className="py-2 px-2 font-bold min-w-[80px]">#</th>
                                    <th className="py-2 px-2 font-bold min-w-[140px]">When</th>
                                    <th className="py-2 px-2 font-bold text-left">Team</th>
                                    <th className="py-2 px-2 font-bold text-left">Problem</th>
                                    <th className="py-2 px-2 font-bold">Lang</th>
                                    <th className="py-2 px-2 font-bold">Verdict</th>
                                    <th className="py-2 px-2 font-bold w-[80px]">Time</th>
                                    <th className="py-2 px-2 font-bold w-[80px]">Memory</th>
                                    <th className="py-2 px-2 font-bold min-w-[80px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubmissions.map((sub, index) => (
                                    <tr key={sub._id} className={`border-b border-[#eee] ${index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}`}>
                                        <td className="py-[6px] px-2 text-[#0000cc] hover:underline cursor-pointer" onClick={() => setSelectedSubmission(sub)}>
                                            {sub._id.substring(sub._id.length - 8)}
                                        </td>
                                        <td className="py-[6px] px-2 text-[#888]">
                                            {new Date(sub.createdAt).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })}
                                        </td>
                                        <td className="py-[6px] px-2 text-[#0000cc] font-bold hover:underline cursor-pointer text-left">
                                            {sub.teamId?.teamName || 'Unknown Team'}
                                        </td>
                                        <td className="py-[6px] px-2 text-[#0000cc] hover:underline cursor-pointer text-left">
                                            {sub.problemId?.title || 'Unknown Problem'}
                                        </td>
                                        <td className="py-[6px] px-2">
                                            {languageMap[sub.languageId] || sub.languageId}
                                        </td>
                                        <td className={`py-[6px] px-2 ${getVerdictStyle(sub.verdict)}`}>
                                            {sub.verdict}
                                        </td>
                                        <td className="py-[6px] px-2 text-[#222]">{sub.executionTime ? `${sub.executionTime} ms` : '-'}</td>
                                        <td className="py-[6px] px-2 text-[#222]">{sub.memory ? `${sub.memory} KB` : '-'}</td>
                                        <td className="py-[6px] px-2">
                                            <button className="text-[#0000cc] hover:underline whitespace-nowrap" onClick={() => setSelectedSubmission(sub)}>View Code</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredSubmissions.length === 0 && (
                            <div className="p-4 text-center text-gray-500">No submissions found.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Submission Code Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white border border-[#b9b9b9] rounded-sm shadow-lg w-full max-w-3xl flex flex-col max-h-[90vh]">
                        <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] px-4 py-2 flex justify-between items-center text-[#333]">
                            <h2 className="font-bold text-[14px]">
                                Code Submission - {selectedSubmission.teamId?.teamName}
                            </h2>
                            <button
                                onClick={() => setSelectedSubmission(null)}
                                className="text-xl font-bold text-[#cc0000] hover:text-[#990000] leading-none"
                            >&times;</button>
                        </div>

                        <div className="p-4 flex-1 overflow-y-auto w-full text-[13px]">
                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p><strong>Problem:</strong> {selectedSubmission.problemId?.title}</p>
                                    <p><strong>Language:</strong> {languageMap[selectedSubmission.languageId]}</p>
                                </div>
                                <div className="text-right">
                                    <p><strong>Verdict:</strong> <span className={getVerdictStyle(selectedSubmission.verdict)}>{selectedSubmission.verdict}</span></p>
                                    <p><strong>Time/Mem:</strong> {selectedSubmission.executionTime || '-'}ms / {selectedSubmission.memory || '-'}KB</p>
                                </div>
                            </div>

                            <h3 className="font-bold mb-2 border-b border-[#ccc] pb-1">Submitted Code:</h3>
                            <pre className="bg-[#1e1e1e] text-[#d4d4d4] p-3 rounded overflow-x-auto text-[12px] font-mono whitespace-pre-wrap break-all">
                                <code>{selectedSubmission.code || 'No code available'}</code>
                            </pre>

                            {selectedSubmission.results && selectedSubmission.results.length > 0 && (
                                <div className="mt-4">
                                    <h3 className="font-bold mb-2 border-b border-[#ccc] pb-1">Test Results:</h3>
                                    <div className="space-y-2">
                                        {selectedSubmission.results.map((res, i) => (
                                            <div key={i} className={`p-2 border rounded ${res.passed ? 'border-[#00a900] bg-[#e6ffe6]' : 'border-[#cc0000] bg-[#ffe6e6]'}`}>
                                                <p><strong>Test {i + 1}:</strong> {res.passed ? 'Passed' : 'Failed'}</p>
                                                {!res.passed && !res.isHidden && (
                                                    <div className="text-xs mt-1 grid grid-cols-2 gap-2">
                                                        <div><strong className="block text-gray-700">Input:</strong> <pre className="bg-white border p-1 rounded overflow-x-auto">{res.input}</pre></div>
                                                        <div>
                                                            <strong className="block text-gray-700">Expected:</strong> <pre className="bg-white border p-1 rounded overflow-x-auto">{res.expectedOutput}</pre>
                                                            <strong className="block text-gray-700 mt-1">Actual:</strong> <pre className="bg-white border p-1 rounded overflow-x-auto">{res.actualOutput}</pre>
                                                        </div>
                                                    </div>
                                                )}
                                                {!res.passed && res.isHidden && (
                                                    <p className="text-xs italic text-gray-500 mt-1">Hidden test case</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSubmissions;