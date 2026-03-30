import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const ContestPage = () => {
    const navigate = useNavigate();
    const [riddles, setRiddles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [contestStatus, setContestStatus] = useState('loading');
    const [canUnlockPenalty, setCanUnlockPenalty] = useState(false);
    const [penaltyDeadline, setPenaltyDeadline] = useState(null);
    const [contestEndTime, setContestEndTime] = useState(null);
    const [timeLeft, setTimeLeft] = useState('');

    const fetchContestData = async () => {
        try {
            const statusRes = await axios.get(`${import.meta.env.VITE_API_URL}/system/status`, {
                withCredentials: true
            });
            setContestStatus(statusRes.data.contestStatus);

            if (statusRes.data.contestStartTime && statusRes.data.contestDurationMinutes && statusRes.data.contestStatus === 'running') {
                const start = new Date(statusRes.data.contestStartTime);
                const end = new Date(start.getTime() + statusRes.data.contestDurationMinutes * 60000);
                setContestEndTime(end);
            }

            if (statusRes.data.contestStatus === 'running' || statusRes.data.contestStatus === 'ended') {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/riddles`, {
                    withCredentials: true
                });
                setRiddles(data.riddles || []);
                setCanUnlockPenalty(data.canUnlockPenalty || false);
                setPenaltyDeadline(data.penaltyDeadline || null);
            }
        } catch (error) {
            console.error("Error fetching contest data", error);
            toast.error("Could not load contest data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContestData();
    }, []);

    const handleUnlockPenalty = async () => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/riddles/penalty-unlock`, {}, {
                withCredentials: true
            });
            toast.success(res.data.message);
            fetchContestData(); // reload riddles
        } catch (error) {
            toast.error(error.response?.data?.error || "Error unlocking item");
        }
    };

    useEffect(() => {
        if (!contestEndTime) return;

        const interval = setInterval(() => {
            const now = new Date();
            const diff = contestEndTime - now;

            if (diff <= 0) {
                setTimeLeft('00:00:00');
                clearInterval(interval);
            } else {
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24).toString().padStart(2, '0');
                const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
                const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
                setTimeLeft(`${h}:${m}:${s}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [contestEndTime]);

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4">
            <Navbar activeTab="CONTEST" />

            {/* Main Content Area */}
            <div className="w-full max-w-[1000px] flex gap-4 items-start">

                {/* Riddles List */}
                <div className="flex-1 bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm">
                    <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 rounded-t-[1px]">
                        Problems
                    </div>
                    <div className="p-0">
                        {loading ? (
                            <div className="p-12 flex justify-center items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0000cc]"></div>
                            </div>
                        ) : contestStatus === 'not_started' ? (
                            <div className="p-12 text-center text-[#333] font-bold text-lg">
                                ⏳ The contest has not started yet! Please wait.
                            </div>
                        ) : contestStatus === 'paused' ? (
                            <div className="p-12 text-center text-[#ff8c00] font-bold text-lg">
                                ⏸️ The contest is currently paused.
                            </div>
                        ) : riddles.length === 0 ? (
                            <div className="p-4 text-center text-[#888]">No active riddles found.</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-[#b9b9b9] bg-[#f9f9f9] text-[#222]">
                                        <th className="py-2 px-3 font-normal border-r border-[#eee] w-[50px] text-center">#</th>
                                        <th className="py-2 px-3 font-normal border-r border-[#eee]">Name</th>
                                        <th className="py-2 px-3 font-normal border-r border-[#eee] w-[80px] text-center">Points</th>
                                        <th className="py-2 px-3 font-normal w-[120px] text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {riddles.map((riddle, index) => (
                                        <tr key={riddle._id} className="hover:bg-[#f5f5f5] border-b border-[#eee]">
                                            <td className="py-2 px-3 border-r border-[#eee] text-center font-bold text-[#333]">
                                                {String.fromCharCode(65 + index)}
                                            </td>
                                            <td className="py-2 px-3 border-r border-[#eee]">
                                                {riddle.status === 'permanently_locked' ? (
                                                    <span className="text-[#888] line-through font-bold text-left cursor-not-allowed" title="Failed to solve in time">
                                                        {riddle.title}
                                                    </span>
                                                ) : (
                                                    <button
                                                        onClick={() => navigate(`/riddle/${riddle._id}`)}
                                                        className="text-[#0000cc] hover:underline font-bold text-left"
                                                    >
                                                        {riddle.title}
                                                        {riddle.isPenaltyTarget && <span className="ml-2 text-[10px] bg-[#cc0000] text-white px-[4px] py-[2px] rounded-sm font-normal">PENALTY</span>}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="py-2 px-3 border-r border-[#eee] text-center text-[#444]">
                                                {riddle.points}
                                            </td>
                                            <td className="py-2 px-3 text-center text-[12px]">
                                                {riddle.status === 'solved' ? (
                                                    <span className="text-[#00a900] font-bold">Solved</span>
                                                ) : riddle.status === 'permanently_locked' ? (
                                                    <span className="text-[#cc0000] font-bold">Locked</span>
                                                ) : (
                                                    <span className="text-[#888]">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {canUnlockPenalty && (
                            <div className="p-4 border-t border-[#b9b9b9] bg-[#fff8e1] flex flex-col items-center">
                                <p className="text-[13px] text-[#555] mb-2 text-center">
                                    You haven't solved any riddle yet. You can unlock the next riddle, but it comes with a strict time limit!
                                </p>
                                <button
                                    onClick={handleUnlockPenalty}
                                    className="bg-[#ff8c00] text-white px-4 py-2 text-[13px] font-bold rounded-sm border border-[#e67e00] hover:bg-[#e67e00] cursor-pointer"
                                >
                                    Force Unlock Next Riddle
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-[280px] flex flex-col gap-4">
                    <div className="bg-white border border-[#b9b9b9] shadow-sm rounded-sm">
                        <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#222] font-bold py-[6px] px-3 text-[13px]">
                            Contest Information
                        </div>
                        <div className="p-3 text-[13px] text-[#333]">
                            {timeLeft && (
                                <div className="mb-3 border-b border-[#eee] pb-3">
                                    <div className="font-bold text-[#888] mb-1 uppercase text-xs">Time Remaining</div>
                                    <div className="text-2xl font-mono text-[#cc0000]">{timeLeft}</div>
                                </div>
                            )}
                            <p className="mb-2"><strong>Name:</strong> CodeQuest 2026 Finals</p>
                            <p className="mb-2"><strong>Duration:</strong> 3 hours</p>
                            <p className={`mb-2 font-bold ${contestStatus === 'running' ? 'text-[#00a900]' :
                                contestStatus === 'paused' ? 'text-[#ff8c00]' :
                                    contestStatus === 'ended' ? 'text-[#cc0000]' : 'text-[#888]'
                                }`}>
                                <strong>Status:</strong> {contestStatus.toUpperCase().replace('_', ' ')}
                            </p>
                            {penaltyDeadline && (
                                <p className="mb-2 text-[#cc0000]">
                                    <strong>Penalty Deadline:</strong><br />
                                    {new Date(penaltyDeadline).toLocaleTimeString()}
                                </p>
                            )}
                            <hr className="my-2 border-[#eee]" />
                            <p className="text-[#666] leading-relaxed">
                                Solve the riddle to unlock the corresponding coding challenge. Your time penalty includes incorrect coding submissions, not riddle attempts.
                            </p>
                        </div>
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

export default ContestPage;