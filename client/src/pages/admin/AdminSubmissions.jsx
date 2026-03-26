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

    if (loading) return <div className="p-10 text-center">Loading Submissions...</div>;

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4">
            <AdminNavbar activeTab="SUBMISSIONS" />

            <div className="w-full max-w-[1200px]">
                <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm">
                    <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 rounded-t-[1px] flex justify-between items-center">
                        <span>All Global Submissions <span className="text-[#cc0000] ml-2 text-[11px] font-normal">● LIVE</span></span>
                        <div className="flex gap-2">
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
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubmissions.map((sub, index) => (
                                    <tr key={sub._id} className={`border-b border-[#eee] ${index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}`}>
                                        <td className="py-[6px] px-2 text-[#0000cc] hover:underline cursor-pointer">
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
        </div>
    );
};

export default AdminSubmissions;