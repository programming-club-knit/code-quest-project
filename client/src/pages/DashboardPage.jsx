import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

const DashboardPage = () => {
    const navigate = useNavigate();

    // Mock data for the current contest
    const currentContest = {
        name: 'CodeQuest 2026 - Round 1',
        startTime: 'Mar/28/2026 17:35',
        length: '02:00:00',
        registered: 245
    };

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4">
            <Navbar activeTab="HOME" />

            {/* Main Content Area */}
            <div className="w-full max-w-[1000px] flex gap-4">

                {/* Left Column (Main) */}
                <div className="flex-1">
                    {/* Contests Table */}
                    <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm">
                        <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 rounded-t-[1px]">
                            Current or upcoming contests
                        </div>
                        <div className="p-0">
                            <table className="w-full text-center border-collapse">
                                <thead>
                                    <tr className="border-b border-[#b9b9b9] bg-[#f9f9f9] text-[#222]">
                                        <th className="py-2 px-2 font-normal border-r border-[#eee]">Name</th>
                                        <th className="py-2 px-2 font-normal border-r border-[#eee]">Start</th>
                                        <th className="py-2 px-2 font-normal border-r border-[#eee]">Length</th>
                                        <th className="py-2 px-2 font-normal border-r border-[#eee] w-[140px]">Registration</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="hover:bg-[#f5f5f5]">
                                        <td className="py-3 px-2 border-r border-[#eee] text-left">
                                            <button onClick={() => navigate('/contest')} className="w-full flex justify-between items-center text-[#0000cc] hover:underline font-semibold pl-2 cursor-pointer">
                                                {currentContest.name}
                                                <span className="text-[#00a900] text-[10px] ml-2">Enter »</span>
                                            </button>
                                        </td>
                                        <td className="py-3 px-2 border-r border-[#eee] text-[#333] whitespace-nowrap">
                                            {currentContest.startTime}
                                        </td>
                                        <td className="py-3 px-2 border-r border-[#eee] text-[#333]">
                                            {currentContest.length}
                                        </td>
                                        <td className="py-3 px-2 border-r border-[#eee]">
                                            <span className="text-[#0000cc]">✓ Registered</span>
                                            <div className="text-[11px] text-[#666] mt-1">
                                                x{currentContest.registered}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-6 bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm p-4 text-[#333]">
                        <h2 className="text-[#0000cc] font-bold text-[16px] mb-2 border-b border-[#eee] pb-1">Announcements</h2>
                        <div className="mb-4">
                            <div className="text-[11px] text-[#666] mb-1">By Admin, Today, 10:00</div>
                            <p>Welcome to CodeQuest 2026! Please ensure your team members are fully registered and verified in your profile before the Round 1 contest begins.</p>
                        </div>
                    </div>
                </div>

                {/* Right Column (Sidebar) */}
                <div className="w-[280px] flex flex-col gap-4">
                    {/* Pay attention box */}
                    <div className="bg-white border border-[#b9b9b9] shadow-sm rounded-sm overflow-hidden">
                        <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 text-[13px]">
                            → Pay attention
                        </div>
                        <div className="p-3 text-[12px] text-[#333]">
                            <div className="mb-2 pb-2 border-b border-dashed border-[#ccc]">
                                <a href="#" className="text-[#0000cc] hover:underline block mb-1 font-semibold text-[13px]">CodeQuest Round 1</a>
                                Before contest: <span className="text-[#333] font-mono">3 days</span>
                            </div>
                        </div>
                    </div>

                    {/* Find user box */}
                    <div className="bg-white border border-[#b9b9b9] shadow-sm rounded-sm overflow-hidden">
                        <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 text-[13px]">
                            Find team
                        </div>
                        <div className="p-3">
                            <div className="flex">
                                <input type="text" className="flex-1 border border-[#ccc] px-2 py-1 text-[13px] min-w-0" placeholder="Team name" />
                                <button className="bg-[#e4e4e4] border border-[#b9b9b9] border-l-0 px-3 text-[#333] font-bold hover:bg-[#d0d0d0]">
                                    →
                                </button>
                            </div>
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

export default DashboardPage;