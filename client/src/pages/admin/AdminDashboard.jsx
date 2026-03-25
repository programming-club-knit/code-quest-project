import React from 'react';
import AdminNavbar from '../../components/AdminNavbar';

const AdminDashboard = () => {

    const stats = {
        totalTeams: 156,
        verifiedTeams: 142,
        pendingTeams: 14,
        totalSubmissions: 3421,
        activeProblems: 5,
        activeRiddles: 10
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