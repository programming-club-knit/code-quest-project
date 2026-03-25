import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const ContestPage = () => {
    const navigate = useNavigate();
    const [riddles, setRiddles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRiddles = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/riddles`, {
                    withCredentials: true
                });
                setRiddles(data);
            } catch (error) {
                console.error("Error fetching riddles", error);
                toast.error("Could not load contest riddles.");
            } finally {
                setLoading(false);
            }
        };
        fetchRiddles();
    }, []);

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
                            <div className="p-4 text-center text-[#888]">Loading...</div>
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
                                                <button
                                                    onClick={() => navigate(`/riddle/${riddle._id}`)}
                                                    className="text-[#0000cc] hover:underline font-bold text-left"
                                                >
                                                    {riddle.title}
                                                </button>
                                            </td>
                                            <td className="py-2 px-3 border-r border-[#eee] text-center text-[#444]">
                                                {riddle.points}
                                            </td>
                                            <td className="py-2 px-3 text-center text-[12px]">
                                                {riddle.isSolved ? (
                                                    <span className="text-[#00a900] font-bold">Solved</span>
                                                ) : (
                                                    <span className="text-[#888]">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                            <p className="mb-2"><strong>Name:</strong> CodeQuest 2026 Finals</p>
                            <p className="mb-2"><strong>Duration:</strong> 3 hours</p>
                            <p className="mb-2 text-[#00a900]"><strong>Status:</strong> Running</p>
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