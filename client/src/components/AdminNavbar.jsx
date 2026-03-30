import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminNavbar = ({ activeTab, maxWidth = "1200px" }) => {
    const navigate = useNavigate();

    // Default global tabs for admin
    let tabs = [
        { name: 'DASHBOARD', path: '/admin/dashboard' },
        { name: 'TEAMS', path: '/admin/teams' },
        { name: 'RIDDLES', path: '/admin/riddles' },
        { name: 'PROBLEMS', path: '/admin/problems' },
        { name: 'SUBMISSIONS', path: '/admin/submissions' },
        { name: 'LEADERBOARD', path: '/admin/leaderboard' },
    ];

    const handleLogout = () => {
        // Here you would clear admin auth tokens/state
        navigate('/admin/login');
    };

    return (
        <div className="w-full flex flex-col items-center mb-4">
            {/* Top Navbar / Header */}
            <div className="w-full flex flex-col md:flex-row items-center md:items-end justify-between pb-2 mb-2 gap-4 md:gap-0" style={{ maxWidth }}>
                <div className="flex items-center justify-center flex-wrap gap-4 w-full md:w-auto">
                    <img src="/logo.png" alt="CodeQuest Logo" className="h-12 md:h-16 object-contain" />
                    <div className="h-10 md:h-12 w-px bg-[#b9b9b9] hidden md:block"></div>
                    <img src="/knitlogo.png" alt="KNIT Logo" className="h-10 md:h-14 object-contain" />
                    <span className="ml-2 px-2 py-1 bg-[#cc0000] text-white text-[11px] font-bold rounded-sm tracking-widest whitespace-nowrap">ADMIN PANEL</span>
                </div>
                <div className="text-[13px] text-center md:text-right w-full md:w-auto">
                    <span className="text-[#cc0000] font-bold">Adminstrator</span>
                    <span className="mx-2 text-[#b9b9b9]">|</span>
                    <button onClick={handleLogout} className="text-[#0000cc] hover:underline hover:text-[#0000ff]">Logout</button>
                </div>
            </div>

            {/* Tab Menu */}
            <div className="w-full overflow-x-auto" style={{ maxWidth }}>
                <div className="border border-[#b9b9b9] bg-white rounded-sm mb-1 min-w-max">
                    <div className="flex text-[13px] font-bold">
                        {tabs.map((tab, index) => {
                            const isActive = tab.name === activeTab;
                            return (
                                <button
                                    key={tab.name}
                                    onClick={() => {
                                        if (!isActive) {
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

export default AdminNavbar;
