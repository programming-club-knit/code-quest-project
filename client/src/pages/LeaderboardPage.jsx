import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

const LeaderboardPage = () => {
    const navigate = useNavigate();
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

    if (loading) {
        return (
            <div className="font-sans min-h-screen bg-[#f3f3f3] flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0000cc]"></div>
            </div>
        );
    }

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4">
            <Navbar activeTab="LEADERBOARD" />

            {/* Main Content Area */}
            <div className="w-full max-w-[1000px]">
                <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm">
                    <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 rounded-t-[1px]">
                        Standings
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-center border-collapse whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-[#b9b9b9] bg-[#f9f9f9] text-[#222]">
                                    <th className="py-2 px-2 font-normal border-r border-[#eee] w-[50px]">#</th>
                                    <th className="py-2 px-2 font-normal border-r border-[#eee] text-left">Who</th>
                                    <th className="py-2 px-2 font-normal border-r border-[#eee] w-[60px]">=</th>
                                    <th className="py-2 px-2 font-normal border-r border-[#eee] w-[80px]">Penalty</th>
                                    {problems.map((p, i) => (
                                        <th key={p.id} title={p.title} className="py-2 px-2 text-[#0000cc] font-normal border-r border-[#eee] min-w-[60px]">
                                            {String.fromCharCode(65 + i)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {standings.map((row) => (
                                    <tr key={row.teamId} className="hover:bg-[#f5f5f5] border-b border-[#eee]">
                                        <td className="py-2 px-2 border-r border-[#eee] text-[#333]">{row.rank}</td>
                                        <td className="py-2 px-2 border-r border-[#eee] text-left">
                                            <span className="font-bold text-[#FF8C00] cursor-pointer hover:underline">
                                                {row.teamName}
                                            </span>
                                        </td>
                                        <td className="py-2 px-2 border-r border-[#eee] font-bold">{row.score}</td>
                                        <td className="py-2 px-2 border-r border-[#eee] text-[#666]">
                                            {row.latestSolveTime > 0 ? new Date(row.latestSolveTime).toLocaleTimeString('en-US', { hour12: false }) : '-'}
                                        </td>
                                        {problems.map(p => (
                                            <td key={p.id} className="py-2 px-2 border-r border-[#eee] font-bold">
                                                {row.problems[p.id] ? (
                                                    <span className="text-[#00a900]">+</span>
                                                ) : (
                                                    <span className="text-[#888]">-</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-[11px] text-[#666] border-t border-[#ccc] w-full max-w-[1000px] text-center pt-2">
                <a href="#" className="text-[#0000cc] hover:underline mx-1">CodeQuest</a>
                by Team (c) Copyright 2026<br />
                Server time: <span>{new Date().toISOString().replace('T', ' ').split('.')[0]}</span>
            </div>
        </div>
    );
};

export default LeaderboardPage;