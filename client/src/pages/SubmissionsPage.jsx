import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from 'axios';

const languageMap = {
    54: 'GNU C++20',
    62: 'Java 17',
    71: 'Python 3',
    63: 'Node.js'
};

const SubmissionsPage = () => {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);

    const fetchSubmissions = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/submissions`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            // The user endpoint returns the array directly
            setSubmissions(res.data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4 px-2 sm:px-4">
            <Navbar activeTab="SUBMISSIONS" />

            {/* Main Content Area */}
            <div className="w-full max-w-[1000px] mt-4">
                <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm">
                    <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 rounded-t-[1px]">
                        Status
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-center border-collapse text-[12px] min-w-[600px]">
                            <thead>
                                <tr className="border-b border-[#b9b9b9] bg-[#f9f9f9] text-[#222]">
                                    <th className="py-2 px-2 font-normal border-r border-[#eee]">When</th>
                                    <th className="py-2 px-2 font-normal border-r border-[#eee]">Who</th>
                                    <th className="py-2 px-2 font-normal border-r border-[#eee]">Problem</th>
                                    <th className="py-2 px-2 font-normal border-r border-[#eee]">Lang</th>
                                    <th className="py-2 px-2 font-normal border-r border-[#eee]">Verdict</th>
                                    <th className="py-2 px-2 font-normal border-r border-[#eee]">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.map((sub, index) => (
                                    <tr key={sub._id || index} className="hover:bg-[#f5f5f5] border-b border-[#eee]">
                                        <td className="py-2 px-2 border-r border-[#eee] text-[#666]">{formatDate(sub.createdAt)}</td>
                                        <td className="py-2 px-2 border-r border-[#eee] text-left">
                                            <a href="#" className="font-bold text-[#FF8C00] hover:underline">
                                                {sub.teamId?.teamName || 'Unknown'}
                                            </a>
                                        </td>
                                        <td className="py-2 px-2 border-r border-[#eee] text-left text-[#0000cc]">
                                            <a href="#" className="hover:underline">{sub.problemId?.title || 'Unknown'}</a>
                                        </td>
                                        <td className="py-2 px-2 border-r border-[#eee] text-[#555]">{languageMap[sub.languageId] || sub.languageId}</td>
                                        <td className={`py-2 px-2 border-r border-[#eee] font-bold ${sub.verdict === 'Accepted' ? 'text-[#00a900]' : sub.verdict.includes('Compilation') ? 'text-[#555]' : 'text-[#cc0000]'}`}>
                                            {sub.verdict}
                                        </td>
                                        <td className="py-2 px-2 border-r border-[#eee]">{sub.executionTime ? `${sub.executionTime} ms` : '-'}</td>
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

export default SubmissionsPage;