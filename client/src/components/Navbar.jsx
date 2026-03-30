import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = ({ activeTab, maxWidth = "1000px" }) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Fallback to local storage or loading if user isn't fully set yet
    const teamName = user?.teamName || localStorage.getItem("teamName") || "Loading...";

    const handleLogout = async () => {
        try {
            await logout();
            localStorage.removeItem("teamName");
            navigate("/login");
        } catch (error) {
            console.error("Logout error", error);
            navigate("/login");
        }
    };

    let tabs = [
        { name: "HOME", path: "/dashboard" },
        { name: "CONTEST", path: "/contest" },
        { name: "SUBMISSIONS", path: "/submissions" },
        { name: "LEADERBOARD", path: "/leaderboard" },
        { name: "TEAM PROFILE", path: "/profile" },
    ];

    return (
        <div className="w-full flex flex-col items-center mb-4">
            <div className="w-full flex items-end justify-between pb-2 mb-2" style={{ maxWidth }}>
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="CodeQuest Logo" className="h-16 object-contain" />
                    <div className="h-12 w-px bg-[#b9b9b9]"></div>
                    <img src="/knitlogo.png" alt="KNIT Logo" className="h-14 object-contain" />
                </div>
                <div className="text-[13px]">
                    <span className="text-[#0000cc] font-bold">{teamName}</span>
                    <span className="mx-2 text-[#b9b9b9]">|</span>
                    <button onClick={handleLogout} className="text-[#0000cc] hover:underline hover:text-[#0000ff] cursor-pointer">Logout</button>
                </div>
            </div>

            <div className="w-full" style={{ maxWidth }}>
                <div className="border border-[#b9b9b9] bg-white rounded-sm mb-1">
                    <div className="flex text-[13px] font-bold">
                        {tabs.map((tab, index) => {
                            const isActive = tab.name === activeTab;
                            return (
                                <button
                                    key={tab.name}
                                    onClick={() => {
                                        if (!isActive && tab.path !== "#") {
                                            navigate(tab.path);
                                        }
                                    }}
                                    className={`px-4 py-2 ${isActive
                                        ? "text-[#333] border-r border-[#b9b9b9] bg-[#e1e1e1]"
                                        : "text-[#0000cc] hover:bg-[#e1e1e1] border-r border-[#b9b9b9]"
                                        } ${index === tabs.length - 1 ? "border-r-0" : ""}`}
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


