import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminLogin = () => {
    const [adminId, setAdminId] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/auth/admin/login`, {
                email: adminId,
                password: password
            }, { withCredentials: true });

            toast.success('Admin login successful!');
            setTimeout(() => {
                navigate('/admin/dashboard');
            }, 1000);
        } catch (err) {
            console.error('Login error:', err);
            toast.error(err.response?.data?.error || 'Login failed.');
        }
    };

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            {/* Top Navbar / Header */}
            <div className="w-full max-w-[1000px] flex items-end justify-between border-b border-[#b9b9b9] pb-2 mb-8">
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="CodeQuest Logo" className="h-16 object-contain" />
                    <div className="h-12 w-px bg-[#b9b9b9]"></div>
                    <img src="/knitlogo.png" alt="KNIT Logo" className="h-14 object-contain" />
                </div>
            </div>

            {/* Main Login Box */}
            <div className="w-[450px] bg-white border border-[#b9b9b9] text-[13px] shadow-sm tracking-wide rounded-sm">
                <div className="border-b border-[#b9b9b9] bg-[#cc0000] text-white font-bold py-[6px] px-3 mb-2 rounded-t-[1px]">
                    Admin Login
                </div>

                <div className="p-4 px-6 text-[#222]">
                    <form onSubmit={handleLogin}>
                        <table className="w-full">
                            <tbody>
                                <tr>
                                    <td className="py-[6px] text-right pr-4 font-bold w-[40%]">
                                        <label htmlFor="adminId">Admin ID</label>
                                    </td>
                                    <td className="py-[6px]">
                                        <input
                                            id="adminId"
                                            type="text"
                                            value={adminId}
                                            onChange={(e) => setAdminId(e.target.value)}
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
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
