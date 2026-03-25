import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const RiddlePage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [riddle, setRiddle] = useState(null);
    const [loading, setLoading] = useState(true);

    const [answer, setAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [showError, setShowError] = useState(false);
    const [openingProblem, setOpeningProblem] = useState(false);

    useEffect(() => {
        const fetchRiddle = async () => {
            try {
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/riddles/${id}`, {
                    withCredentials: true
                });
                setRiddle(data);
                if (data.isSolved) {
                    setIsCorrect(true);
                }
            } catch (error) {
                console.error("Error fetching riddle:", error);
                toast.error("Failed to load riddle");
                navigate('/contest');
            } finally {
                setLoading(false);
            }
        };
        fetchRiddle();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/riddles/${id}/solve`,
                { answer },
                { withCredentials: true }
            );

            if (data.correct) {
                setIsCorrect(true);
                setShowError(false);
                toast.success("Correct answer!");
            } else {
                setIsCorrect(false);
                setShowError(true);
            }
        } catch (error) {
            console.error("Error verifying answer", error);
            toast.error("Error verifying answer");
        }
    };

    const handleProceedToProblem = async () => {
        try {
            setOpeningProblem(true);
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/problems?riddleId=${id}`, {
                withCredentials: true
            });

            if (!data || data.length === 0) {
                toast.error("No coding problem is linked to this riddle yet.");
                return;
            }

            navigate(`/problem/${data[0]._id}`);
        } catch (error) {
            console.error("Error opening problem", error);
            toast.error("Failed to open problem");
        } finally {
            setOpeningProblem(false);
        }
    };

    if (loading) {
        return (
            <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4">
                <Navbar activeTab="RIDDLE" />
                <div className="p-10 text-[#666]">Loading riddle...</div>
            </div>
        );
    }

    if (!riddle) return null;

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4">
            <Navbar activeTab="RIDDLE" />

            {/* Navigation / Actions */}
            <div className="w-full max-w-[1000px] mb-2 text-[13px] flex justify-start">
                <button onClick={() => navigate('/contest')} className="text-[#0000cc] hover:underline font-bold">
                    ← Back to All Riddles
                </button>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-[1000px] bg-white border border-[#b9b9b9] p-8 shadow-sm">
                <div className="text-center mb-8 border-b border-[#eee] pb-6">
                    <div className="text-[12px] bg-[#e1e1e1] text-[#333] px-2 py-1 mb-2 inline-block rounded-sm font-bold">
                        {riddle.difficulty}
                    </div>
                    <h2 className="text-[22px] font-normal mb-1">{riddle.title}</h2>
                    <div className="text-[12px] text-[#888]">
                        Points: {riddle.points}
                    </div>
                </div>

                <div className="text-[14px] leading-relaxed text-[#333] max-w-[800px] mx-auto">
                    <p className="mb-6 whitespace-pre-wrap">
                        {riddle.description}
                    </p>

                    {!riddle.isSolved && (
                        <div className="mt-8 p-6 bg-[#f9f9f9] border border-[#e1e1e1] rounded-sm">
                            <h3 className="font-bold text-[14px] mb-3 text-[#222]">Submit Riddle Answer:</h3>
                            <form onSubmit={handleSubmit} className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) => {
                                        setAnswer(e.target.value);
                                        setShowError(false);
                                    }}
                                    disabled={isCorrect}
                                    placeholder="Enter your answer here..."
                                    className="flex-1 border border-[#b9b9b9] px-3 py-2 text-[13px] outline-none focus:border-[#888]"
                                />
                                <button
                                    type="submit"
                                    disabled={isCorrect || !answer.trim()}
                                    className="bg-[#e1e1e1] hover:bg-[#d1d1d1] border border-[#b9b9b9] px-6 py-2 text-[13px] font-bold cursor-pointer disabled:opacity-50"
                                >
                                    Submit
                                </button>
                            </form>
                            {showError && <p className="text-[#cc0000] text-[12px] mt-2 font-bold">Incorrect answer. Try again.</p>}
                        </div>
                    )}

                    {isCorrect && (
                        <div className="mt-6 p-5 border-2 border-[#00a900] bg-[#eaffea] text-center">
                            <h3 className="text-[#00a900] font-bold text-[16px] mb-2">
                                {riddle.isSolved ? "Riddle Already Solved!" : "Answer Correct!"}
                            </h3>
                            <p className="text-[13px] mb-3">You have unlocked the coding problem for this riddle.</p>
                            <button
                                onClick={handleProceedToProblem}
                                disabled={openingProblem}
                                className="text-[14px] font-bold text-[#0000cc] hover:underline"
                            >
                                {openingProblem ? "Opening..." : "→ Proceed to Problem"}
                            </button>
                        </div>
                    )}
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

export default RiddlePage;