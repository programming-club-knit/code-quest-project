import React, { useState, useEffect } from 'react';
import AdminNavbar from '../../components/AdminNavbar';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const AdminDashboard = () => {
    const [contestStatus, setContestStatus] = useState('loading...');
    const [timeoutMinutes, setTimeoutMinutes] = useState(30);
    const [penaltyMinutes, setPenaltyMinutes] = useState(15);

    const stats = {
        totalTeams: 156,
        verifiedTeams: 142,
        pendingTeams: 14,
        totalSubmissions: 3421,
        activeProblems: 5,
        activeRiddles: 10
    };

    const fetchStatus = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/system/status`, { withCredentials: true });
            setContestStatus(res.data.contestStatus);
            if (res.data.timeoutMinutes) setTimeoutMinutes(res.data.timeoutMinutes);
            if (res.data.penaltyMinutes) setPenaltyMinutes(res.data.penaltyMinutes);
        } catch (error) {
            console.error('Error fetching contest status', error);
            toast.error('Failed to get contest status');
            setContestStatus('error');
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    const updateStatus = async (newStatus) => {
        try {
            await axios.put(`${API_BASE_URL}/system/status`, {
                status: newStatus
            }, { withCredentials: true });
            toast.success(`Contest status updated to: ${newStatus}`);
            setContestStatus(newStatus);
        } catch (error) {
            console.error('Error updating status', error);
            toast.error('Failed to update contest status');
        }
    };

    const updateTimers = async () => {
        try {
            await axios.put(`${API_BASE_URL}/system/status`, {
                timeoutMinutes: Number(timeoutMinutes),
                penaltyMinutes: Number(penaltyMinutes)
            }, { withCredentials: true });
            toast.success('Penalty timers updated successfully');
        } catch (error) {
            toast.error('Failed to update timers');
        }
    };

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4">
            <AdminNavbar activeTab="DASHBOARD" />

            {/* Main Content Area */}
            <div className="w-full max-w-[1200px] flex gap-4">

                {/* Stats Grid */}
                <div className="flex-1 grid grid-cols-3 gap-4">
                    <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm p-4 text-center">
                        <div className="text-[#888] font-bold mb-2 uppercase">Total Teams</div>
                        <div className="text-3xl text-[#cc0000]">{stats.totalTeams}</div>
                    </div>
                    <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm p-4 text-center">
                        <div className="text-[#888] font-bold mb-2 uppercase">Verified Teams</div>
                        <div className="text-3xl text-[#00a900]">{stats.verifiedTeams}</div>
                    </div>
                    <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm p-4 text-center">
                        <div className="text-[#888] font-bold mb-2 uppercase">Pending Teams</div>
                        <div className="text-3xl text-[#ff8c00]">{stats.pendingTeams}</div>
                    </div>
                    <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm p-4 text-center">
                        <div className="text-[#888] font-bold mb-2 uppercase">Total Submissions</div>
                        <div className="text-3xl text-[#0000cc]">{stats.totalSubmissions}</div>
                    </div>
                    <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm p-4 text-center">
                        <div className="text-[#888] font-bold mb-2 uppercase">Active Problems</div>
                        <div className="text-3xl text-[#333]">{stats.activeProblems}</div>
                    </div>
                    <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm p-4 text-center">
                        <div className="text-[#888] font-bold mb-2 uppercase">Active Riddles</div>
                        <div className="text-3xl text-[#333]">{stats.activeRiddles}</div>
                    </div>
                </div>

                {/* Sidebar area */}
                <div className="w-[300px] flex flex-col gap-4">
                    <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm">
                        <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 rounded-t-[1px]">
                            Contest Controls
                        </div>
                        <div className="p-3 flex flex-col gap-3 text-center">
                            <div className="font-bold text-sm">
                                Status: <span className="uppercase text-[#0000cc]">{contestStatus}</span>
                            </div>

                            {contestStatus === 'not_started' && (
                                <button onClick={() => updateStatus('running')} className="bg-[#00a900] text-white py-2 rounded-sm font-bold hover:bg-[#008f00] cursor-pointer">
                                    Start Contest
                                </button>
                            )}

                            {(contestStatus === 'running' || contestStatus === 'paused') && (
                                <div className="flex gap-2 w-full">
                                    {contestStatus === 'running' ? (
                                        <button onClick={() => updateStatus('paused')} className="flex-1 bg-[#ff8c00] text-white py-2 rounded-sm font-bold hover:bg-[#e67e00] cursor-pointer">
                                            Pause
                                        </button>
                                    ) : (
                                        <button onClick={() => updateStatus('running')} className="flex-1 bg-[#00a900] text-white py-2 rounded-sm font-bold hover:bg-[#008f00] cursor-pointer">
                                            Resume
                                        </button>
                                    )}
                                    <button onClick={() => updateStatus('ended')} className="flex-1 bg-[#cc0000] text-white py-2 rounded-sm font-bold hover:bg-[#b00000] cursor-pointer">
                                        End
                                    </button>
                                </div>
                            )}

                            {contestStatus === 'ended' && (
                                <button onClick={() => updateStatus('not_started')} className="bg-[#555] text-white py-2 rounded-sm font-bold hover:bg-[#333] cursor-pointer">
                                    Reset to Not Started
                                </button>
                            )}

                            <hr className="my-2 border-[#ccc]" />
                            <div className="text-left flex flex-col gap-2">
                                <div>
                                    <label className="text-[12px] font-bold">Timeout to Unlock 3rd (mins):</label>
                                    <input type="number" className="w-full border border-[#ccc] px-2 py-1 mt-1 text-[13px]" value={timeoutMinutes} onChange={e => setTimeoutMinutes(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-[12px] font-bold">Strict Action Time Limit (mins):</label>
                                    <input type="number" className="w-full border border-[#ccc] px-2 py-1 mt-1 text-[13px]" value={penaltyMinutes} onChange={e => setPenaltyMinutes(e.target.value)} />
                                </div>
                                <button onClick={updateTimers} className="bg-[#e4e4e4] border border-[#b9b9b9] hover:bg-[#d0d0d0] px-[12px] py-[4px] mt-1 text-[#222] font-semibold text-[12px] rounded-sm transition-colors">
                                    Save Timers
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm">
                        <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 rounded-t-[1px]">
                            Quick Actions
                        </div>
                        <div className="p-3 flex flex-col gap-2">
                            <button className="text-left text-[#0000cc] hover:underline">→ Manage Contest Settings</button>
                            <button className="text-left text-[#0000cc] hover:underline">→ Add New Problem</button>
                            <button className="text-left text-[#0000cc] hover:underline">→ Re-judge Submissions</button>
                            <button className="text-left text-[#0000cc] hover:underline">→ Export Leaderboard (CSV)</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;