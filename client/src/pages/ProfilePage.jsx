import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const ProfilePage = () => {
    const navigate = useNavigate();
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
                    withCredentials: true
                });
                setTeamData(data.team);
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("Failed to load profile. Please login again.");
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    if (loading) {
        return (
            <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4">
                <Navbar activeTab="TEAM PROFILE" username="Loading..." />
                <div className="p-10 text-[#666]">Loading profile data...</div>
            </div>
        );
    }

    if (!teamData) return null;

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4 px-2 sm:px-4">
            <Navbar activeTab="TEAM PROFILE" username={teamData.teamName} />

            {/* Profile Content */}
            <div className="w-full max-w-[1000px] bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm">
                <div className="p-4 sm:p-6 text-[#333]">
                    <div className="flex justify-between items-start border-b border-[#eee] pb-4 mb-4">
                        <div className="pr-2">
                            <h1 className="text-xl sm:text-2xl font-semibold mb-1 break-words" style={{ color: teamData.isVerified ? '#00a900' : '#888' }}>
                                {teamData.teamName}
                            </h1>
                            <div className="text-[12px] text-[#666]">
                                Status: <span className={teamData.isDisqualified ? 'text-[#cc0000] font-bold line-through' : teamData.isVerified ? 'text-[#00a900] font-bold' : 'text-[#ff8c00] font-bold'}>
                                    {teamData.isDisqualified ? 'Disqualified' : (teamData.isVerified ? 'Verified' : 'Pending')}
                                </span>
                            </div>
                        </div>
                        <div className="text-right text-[12px] text-[#888] flex-shrink-0">
                            <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${teamData.teamName}&backgroundColor=e1e1e1`} alt="avatar" className="w-12 h-12 sm:w-16 sm:h-16 border border-[#b9b9b9] p-1" />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 md:gap-16">
                        {/* Leader Info */}
                        <div className="flex-1 w-full overflow-x-auto">
                            <h3 className="font-bold border-b border-[#ccc] mb-3 pb-1">Team Leader Details</h3>
                            <table className="text-[13px]">
                                <tbody>
                                    <tr>
                                        <td className="py-1 text-[#888] pr-2 sm:pr-4 align-top">Name:</td>
                                        <td className="py-1 font-semibold break-words">{teamData.teamLeaderName}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-[#888] pr-2 sm:pr-4 align-top">Email:</td>
                                        <td className="py-1 break-words">{teamData.teamLeaderEmail}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-[#888] pr-2 sm:pr-4 align-top">Branch:</td>
                                        <td className="py-1 break-words">{teamData.branch}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-[#888] pr-2 sm:pr-4 align-top">Year:</td>
                                        <td className="py-1">{teamData.year}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-[#888] pr-2 sm:pr-4 align-top">Roll No:</td>
                                        <td className="py-1 break-all">{teamData.rollNo}</td>
                                    </tr>
                                    <tr>
                                        <td className="py-1 text-[#888] pr-2 sm:pr-4 align-top">Mobile:</td>
                                        <td className="py-1 break-all">{teamData.mobileNo}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Members Info */}
                        <div className="flex-1 w-full">
                            <h3 className="font-bold border-b border-[#ccc] mb-3 pb-1">Team Members ({(teamData.teamMembers?.length || 0)}/3)</h3>
                            {!teamData.teamMembers || teamData.teamMembers.length === 0 ? (
                                <div className="text-[#888] italic">No additional members.</div>
                            ) : (
                                <ul className="list-decimal pl-5">
                                    {teamData.teamMembers.map((member, idx) => (
                                        <li key={idx} className="mb-2 break-words">
                                            <span className="font-bold text-[#444]">{member.name}</span> <br />
                                            <span className="text-[11px] text-[#666]">Roll No: {member.rollNo} | {member.email}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-[#eee] w-full overflow-x-auto">
                        <h3 className="font-bold border-b border-[#ccc] mb-3 pb-1">Contest History</h3>
                        {/* Static mapping since this isn't integrated yet */}
                        <table className="w-full text-center border-collapse min-w-[300px]">
                            <thead>
                                <tr className="border-b border-[#b9b9b9] bg-[#f9f9f9]">
                                    <th className="py-1 px-2 font-normal border-r border-[#eee] text-left">Contest</th>
                                    <th className="py-1 px-2 font-normal w-[100px]">Rank</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-[#eee] hover:bg-[#f5f5f5]">
                                    <td className="py-2 px-2 border-r border-[#eee] text-left text-[#0000cc]">CodeQuest 2026 - Round 1</td>
                                    <td className="py-2 px-2 font-bold">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 text-[11px] text-[#666] border-t border-[#ccc] w-full max-w-[1000px] text-center pt-2 pb-4">
                <a href="#" className="text-[#0000cc] hover:underline mx-1">CodeQuest</a>
                by Team (c) Copyright 2026<br />
                Server time: <span>{new Date().toISOString().replace('T', ' ').split('.')[0]}</span>
            </div>
        </div>
    );
};

export default ProfilePage;