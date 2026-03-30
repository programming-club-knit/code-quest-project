import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminNavbar from '../../components/AdminNavbar';

const AdminLeaderboard = () => {
    const [standings, setStandings] = useState([]);
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaderboard = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/leaderboard`, {
                withCredentials: true
            });
            setStandings(data.leaderboard);
            setProblems(data.problems);
        } catch (error) {
            console.error('Failed to fetch leaderboard', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const handleDisqualify = async (teamId) => {
        if (!window.confirm('Are you sure you want to disqualify this team?')) return;
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/admin/teams/${teamId}/disqualify`, {}, { withCredentials: true });
            fetchLeaderboard(); // refresh local leaderboard
        } catch (error) {
            console.error('Error disqualifying team', error);
            alert('Failed to disqualify team');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-8 min-h-screen">
            <div className="w-8 h-8 rounded-full border-4 border-[#0000cc] border-t-transparent animate-spin"></div>
        </div>
    );

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4 px-2 sm:px-4">
            <AdminNavbar activeTab="LEADERBOARD" />

            <div className="w-full max-w-[1200px]">
                <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm">
                    <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 rounded-t-[1px] flex justify-between items-center">
                        <span>Live Admin Leaderboard</span>
                        <div className="flex gap-2">
                            <span className="text-[11px] font-normal text-[#cc0000]">● LIVE (Auto-refresh)</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-[#b9b9b9] text-[#222]">
                                    <th className="py-2 px-1 font-bold w-[40px]">#</th>
                                    <th className="py-2 px-3 font-bold text-left w-[200px]">Who</th>
                                    <th className="py-2 px-1 font-bold w-[40px]">=</th>
                                    <th className="py-2 px-1 font-bold w-[80px]">Latest Solve</th>
                                    {problems.map((p, i) => (
                                        <th key={p.id} title={p.title} className="py-2 px-1 font-bold text-[#0000cc] w-[60px]">
                                            {String.fromCharCode(65 + i)}
                                        </th>
                                    ))}
                                    <th className="py-2 px-3 font-bold text-right">Admin Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {standings.map((row, i) => (
                                    <tr key={row.teamId} className={`border-b border-[#eee] ${i % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}`}>
                                        <td className="py-[6px]">{row.rank}</td>
                                        <td className="py-[6px] text-left">
                                            <span className="text-[#0000cc] font-bold hover:underline cursor-pointer">{row.teamName}</span>
                                        </td>
                                        <td className="py-[6px] font-bold">{row.score}</td>
                                        <td className="py-[6px] text-[#888]">
                                            {row.latestSolveTime > 0 ? new Date(row.latestSolveTime).toLocaleTimeString('en-US', { hour12: false }) : '-'}
                                        </td>

                                        {problems.map(p => (
                                            <td key={p.id} className="py-[6px] font-bold">
                                                {row.problems[p.id] ? (
                                                    <span className="text-[#00a900]">+</span>
                                                ) : (
                                                    <span className="text-[#888]">-</span>
                                                )}
                                            </td>
                                        ))}

                                        <td className="py-[6px] text-right pr-3">
                                            <a href="/admin/submissions" className="text-[#0000cc] hover:underline text-[11px] mr-2">Audit Submissions</a>
                                            <button
                                                onClick={() => handleDisqualify(row.teamId)}
                                                className="text-[#cc0000] hover:underline text-[11px]"
                                            >
                                                Disqualify
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLeaderboard;