import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            toast.success('Login successful! Redirecting...');
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
        } catch (err) {
            console.error('Login error:', err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Login failed. Please check your credentials.';
            toast.error(errorMsg);
        }
    };

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            {/* Top Navbar / Header */}
            <div className="w-full max-w-[1000px] flex items-end justify-between border-b border-[#b9b9b9] pb-2 mb-8">
                {/* Left side: Logos */}
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="CodeQuest Logo" className="h-16 object-contain" />
                    <div className="h-12 w-px bg-[#b9b9b9]"></div>
                    <img src="/knitlogo.png" alt="KNIT Logo" className="h-14 object-contain" />
                </div>

                {/* Right side: Mock Navigation */}
                <div className="text-[13px] text-[#0000cc]">
                    <a href="/login" className="hover:underline hover:text-[#0000ff]">Login</a>
                    <span className="mx-2 text-[#b9b9b9]">|</span>
                    <a href="/register" className="hover:underline hover:text-[#0000ff]">Register</a>
                </div>
            </div>

            {/* Main Login Box */}
            <div className="w-[450px] bg-white border border-[#b9b9b9] text-[13px] shadow-sm tracking-wide rounded-sm">

                {/* Header */}
                <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 mb-2 rounded-t-[1px]">
                    Login into CodeQuest
                </div>

                {/* Form Container */}
                <div className="p-4 px-6 text-[#222]">
                    <form onSubmit={handleLogin}>
                        <table className="w-full">
                            <tbody>
                                <tr>
                                    <td className="py-[6px] text-right pr-4 font-bold w-[40%]">
                                        <label htmlFor="email">Team Leader Email</label>
                                    </td>
                                    <td className="py-[6px]">
                                        <input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full border border-[#ccc] focus:border-[#888] focus:outline-none focus:shadow-[0_0_3px_#aaa] px-[3px] py-[2px] transition-shadow text-[13px]"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-[6px] text-right pr-4 font-bold">
                                        <label htmlFor="password">Password</label>
                                    </td>
                                    <td className="py-[6px]">
                                        <input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full border border-[#ccc] focus:border-[#888] focus:outline-none focus:shadow-[0_0_3px_#aaa] px-[3px] py-[2px] transition-shadow text-[13px]"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td className="py-[4px] flex items-center gap-[6px]">
                                        <input
                                            type="checkbox"
                                            id="remember"
                                            className="m-0 border-[#ccc] cursor-pointer"
                                        />
                                        <label htmlFor="remember" className="text-[12px] cursor-pointer cursor-default">Remember me for a month</label>
                                    </td>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td className="py-3">
                                        <button
                                            type="submit"
                                            className="bg-[#e4e4e4] border border-[#b9b9b9] hover:bg-[#d0d0d0] px-[12px] py-[2px] text-[#222] font-semibold text-[13px] rounded-sm transition-colors active:bg-[#c0c0c0]"
                                        >
                                            Login
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </form>

                    <div className="mt-4 pt-4 border-t border-[#eee] text-center text-[12px]">
                        <div className="mb-1">
                            <a href="#" className="text-[#0000cc] hover:text-[#0000ff] hover:underline">Forgot your password?</a>
                        </div>
                        <div>
                            Don't have an account?{' '}
                            <a href="/register" className="text-[#0000cc] hover:text-[#0000ff] hover:underline">Register here</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mock Codeforces Footer styling */}
            <div className="mt-8 text-[11px] text-[#666] border-t border-[#ccc] w-[600px] text-center pt-2">
                <a href="#" className="text-[#0000cc] hover:underline mx-1">CodeQuest</a>
                by Team (c) Copyright 2026<br />
                Server time: <span>{new Date().toISOString().replace('T', ' ').split('.')[0]}</span>
            </div>
        </div>
    );
};

export default LoginPage;