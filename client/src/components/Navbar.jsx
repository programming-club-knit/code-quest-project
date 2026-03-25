import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ activeTab, maxWidth = "1000px" }) => {
    const navigate = useNavigate();

    // Default global tabs
    let tabs = [
        { name: 'HOME', path: '/dashboard' },
        { name: 'CONTEST', path: '/contest' },
        { name: 'SUBMISSIONS', path: '/submissions' },
        { name: 'LEADERBOARD', path: '/leaderboard' },
    ];

    // If we're on a Riddle or Problem page, insert it before Team Profile
    // if (activeTab === 'RIDDLE') {
    //     tabs.push({ name: 'RIDDLE', path: '#' });
    // } else if (activeTab === 'PROBLEM') {
    //     tabs.push({ name: 'PROBLEM', path: '#' });
    // }

    tabs.push({ name: 'TEAM PROFILE', path: '/profile' });

    return (
        <div className="w-full flex flex-col items-center mb-4">
            {/* Top Navbar / Header */}
            <div className="w-full flex items-end justify-between pb-2 mb-2" style={{ maxWidth }}>
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="CodeQuest Logo" className="h-16 object-contain" />
                    <div className="h-12 w-px bg-[#b9b9b9]"></div>
                    <img src="/knitlogo.png" alt="KNIT Logo" className="h-14 object-contain" />
                </div>
                <div className="text-[13px]">
                    <span className="text-[#0000cc] font-bold">Team_Name</span>
                    <span className="mx-2 text-[#b9b9b9]">|</span>
                    <button className="text-[#0000cc] hover:underline hover:text-[#0000ff]">Logout</button>
                </div>
            </div>

            {/* Tab Menu */}
            <div className="w-full" style={{ maxWidth }}>
                <div className="border border-[#b9b9b9] bg-white rounded-sm mb-1">
                    <div className="flex text-[13px] font-bold">
                        {tabs.map((tab, index) => {
                            const isActive = tab.name === activeTab;
                            return (
                                <button
                                    key={tab.name}
                                    onClick={() => {
                                        if (!isActive && tab.path !== '#') {
                                            navigate(tab.path);
                                        }
                                    }}
                                    className={`px-4 py-2 ${isActive
                                        ? 'text-[#333] border-r border-[#b9b9b9] bg-[#e1e1e1]'
                                        : 'text-[#0000cc] hover:bg-[#e1e1e1] border-r border-[#b9b9b9]'
                                        } ${index === tabs.length - 1 ? 'border-r-0' : ''}`}
                                >
                                    {tab.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Navbar;