import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import { Html5QrcodeScanner } from 'html5-qrcode';

const RiddlePage = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [riddle, setRiddle] = useState(null);
    const [loading, setLoading] = useState(true);

    const [answer, setAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(false);
    const [showError, setShowError] = useState(false);
    const [openingProblem, setOpeningProblem] = useState(false);

    // QR Scanner states
    const [showScanner, setShowScanner] = useState(false);

    const handleToggleScanner = async () => {
        if (showScanner) {
            setShowScanner(false);
            return;
        }

        try {
            // Explicitly request camera permissions before mounting the scanner
            await navigator.mediaDevices.getUserMedia({ video: true });
            setShowScanner(true);
        } catch (error) {
            console.error("Camera permission denied or error:", error);
            toast.error("Camera access is required to scan QR codes.");
        }
    };

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
                const errorMsg = error.response?.data?.error || "Failed to load riddle";
                toast.error(errorMsg);
                navigate('/contest');
            } finally {
                setLoading(false);
            }
        };
        fetchRiddle();
    }, [id, navigate]);

    useEffect(() => {
        let html5QrcodeScanner;
        if (showScanner && !isCorrect && riddle && !riddle.isSolved) {
            html5QrcodeScanner = new Html5QrcodeScanner(
                "qr-reader",
                { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
                /* verbose= */ false
            );
            html5QrcodeScanner.render(
                (decodedText) => {
                    setAnswer(decodedText);
                    setShowScanner(false);
                    setShowError(false);
                    toast.success("QR Code scanned successfully!");
                },
                (error) => {
                    // Ignore background scan errors
                }
            );
        }

        return () => {
            if (html5QrcodeScanner) {
                html5QrcodeScanner.clear().catch(error => {
                    console.error("Failed to clear scanner", error);
                });
            }
        };
    }, [showScanner, isCorrect, riddle]);

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
            const msg = error.response?.data?.error || "Error verifying answer";
            toast.error(msg);
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
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4 px-2 sm:px-4">
            <Navbar activeTab="RIDDLE" />

            {/* Navigation / Actions */}
            <div className="w-full max-w-[1000px] mb-2 text-[13px] flex justify-start">
                <button onClick={() => navigate('/contest')} className="text-[#0000cc] hover:underline font-bold px-2 sm:px-0">
                    ← Back to All Riddles
                </button>
            </div>

            {/* Main Content */}
            <div className="w-full max-w-[1000px] bg-white border border-[#b9b9b9] p-4 sm:p-8 shadow-sm">
                <div className="text-center mb-6 sm:mb-8 border-b border-[#eee] pb-4 sm:pb-6">
                    <h2 className="text-[20px] sm:text-[22px] font-normal mb-1">{riddle.title}</h2>
                </div>

                <div className="text-[14px] leading-relaxed text-[#333] max-w-[800px] mx-auto">
                    <p className="mb-6 whitespace-pre-wrap">
                        {riddle.description}
                    </p>

                    {!riddle.isSolved && (
                        <div className="mt-8 p-4 sm:p-6 bg-[#f9f9f9] border border-[#e1e1e1] rounded-sm">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-bold text-[14px] text-[#222]">Submit Riddle Answer:</h3>
                                <button
                                    type="button"
                                    onClick={handleToggleScanner}
                                    className="text-[#0000cc] hover:underline text-[13px] font-bold"
                                >
                                    {showScanner ? "Close Scanner" : "Scan QR Code"}
                                </button>
                            </div>

                            {showScanner && (
                                <div className="mb-4">
                                    <div id="qr-reader" className="w-full max-w-[400px] mx-auto border border-[#b9b9b9] bg-white"></div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) => {
                                        setAnswer(e.target.value);
                                        setShowError(false);
                                    }}
                                    disabled={isCorrect}
                                    placeholder="Enter your answer here..."
                                    className="flex-1 border border-[#b9b9b9] px-3 py-2 text-[13px] outline-none focus:border-[#888] w-full"
                                />
                                <button
                                    type="submit"
                                    disabled={isCorrect || !answer.trim()}
                                    className="bg-[#e1e1e1] hover:bg-[#d1d1d1] border border-[#b9b9b9] px-6 py-2 text-[13px] font-bold cursor-pointer disabled:opacity-50 w-full sm:w-auto mt-2 sm:mt-0"
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