import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        teamName: '',
        teamLeaderName: '',
        teamLeaderEmail: '',
        password: '',
        confirmPassword: '',
        branch: '',
        year: '',
        rollNo: '',
        mobileNo: ''
    });

    const [teamMembers, setTeamMembers] = useState([]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleMemberChange = (index, field, value) => {
        const updatedMembers = [...teamMembers];
        updatedMembers[index][field] = value;
        setTeamMembers(updatedMembers);
    };

    const addMember = () => {
        if (teamMembers.length < 3) {
            setTeamMembers([...teamMembers, { name: '', rollNo: '', email: '' }]);
        } else {
            alert('A team can have a maximum of 3 additional members.');
        }
    };

    const removeMember = (index) => {
        const updatedMembers = [...teamMembers];
        updatedMembers.splice(index, 1);
        setTeamMembers(updatedMembers);
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        const payload = {
            ...formData,
            teamMembers
        };
        delete payload.confirmPassword;

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, payload, {
                withCredentials: true
            });
            console.log('Registration successful:', response.data);
            toast.success('Registration successful! Redirecting to login...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            console.error('Registration error:', err);
            const errorMsg = err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMsg);
        }
    };

    const inputClass = "w-full border border-[#ccc] focus:border-[#888] focus:outline-none focus:shadow-[0_0_3px_#aaa] px-[3px] py-[2px] transition-shadow text-[13px]";
    const labelClass = "py-[6px] text-right pr-4 font-bold w-[35%] align-top pt-2";

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

                {/* Right side: Navigation */}
                <div className="text-[13px] text-[#0000cc]">
                    <a href="/login" className="hover:underline hover:text-[#0000ff]">Login</a>
                    <span className="mx-2 text-[#b9b9b9]">|</span>
                    <a href="/register" className="hover:underline hover:text-[#0000ff]">Register</a>
                </div>
            </div>

            {/* Main Register Box */}
            <div className="w-[600px] bg-white border border-[#b9b9b9] text-[13px] shadow-sm tracking-wide rounded-sm">

                {/* Header */}
                <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 mb-2 rounded-t-[1px]">
                    Register Team for CodeQuest
                </div>

                {/* Form Container */}
                <div className="p-4 px-6 text-[#222]">
                    <form onSubmit={handleRegister}>
                        <table className="w-full">
                            <tbody>
                                {/* Team Info */}
                                <tr>
                                    <td className={labelClass}><label htmlFor="teamName">Team Name</label></td>
                                    <td className="py-[6px]"><input id="teamName" type="text" value={formData.teamName} onChange={handleChange} required className={inputClass} /></td>
                                </tr>

                                {/* Leader Info */}
                                <tr>
                                    <td colSpan="2" className="pt-4 pb-2 border-b border-[#eee] text-[#666] font-bold">Team Leader Information</td>
                                </tr>
                                <tr>
                                    <td className={labelClass}><label htmlFor="teamLeaderName">Leader Name</label></td>
                                    <td className="py-[6px]"><input id="teamLeaderName" type="text" value={formData.teamLeaderName} onChange={handleChange} required className={inputClass} /></td>
                                </tr>
                                <tr>
                                    <td className={labelClass}><label htmlFor="teamLeaderEmail">Email</label></td>
                                    <td className="py-[6px]"><input id="teamLeaderEmail" type="email" value={formData.teamLeaderEmail} onChange={handleChange} required className={inputClass} /></td>
                                </tr>
                                <tr>
                                    <td className={labelClass}><label htmlFor="password">Password</label></td>
                                    <td className="py-[6px]"><input id="password" type="password" value={formData.password} onChange={handleChange} required className={inputClass} /></td>
                                </tr>
                                <tr>
                                    <td className={labelClass}><label htmlFor="confirmPassword">Confirm Password</label></td>
                                    <td className="py-[6px]"><input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required className={inputClass} /></td>
                                </tr>
                                <tr>
                                    <td className={labelClass}><label htmlFor="branch">Branch</label></td>
                                    <td className="py-[6px]"><input id="branch" type="text" value={formData.branch} onChange={handleChange} required className={inputClass} /></td>
                                </tr>
                                <tr>
                                    <td className={labelClass}><label htmlFor="year">Year</label></td>
                                    <td className="py-[6px]"><input id="year" type="text" value={formData.year} onChange={handleChange} required className={inputClass} /></td>
                                </tr>
                                <tr>
                                    <td className={labelClass}><label htmlFor="rollNo">Roll No</label></td>
                                    <td className="py-[6px]"><input id="rollNo" type="text" value={formData.rollNo} onChange={handleChange} required className={inputClass} /></td>
                                </tr>
                                <tr>
                                    <td className={labelClass}><label htmlFor="mobileNo">Mobile No</label></td>
                                    <td className="py-[6px]"><input id="mobileNo" type="text" value={formData.mobileNo} onChange={handleChange} required className={inputClass} /></td>
                                </tr>

                                {/* Team Members Info */}
                                <tr>
                                    <td colSpan="2" className="pt-6 pb-2 border-b border-[#eee] flex justify-between items-center text-[#666] font-bold">
                                        <span>Team Members (Optional, Max 3)</span>
                                        {teamMembers.length < 3 && (
                                            <button type="button" onClick={addMember} className="bg-[#e4e4e4] border border-[#b9b9b9] hover:bg-[#d0d0d0] px-[8px] py-[1px] text-[#222] font-semibold text-[11px] rounded-sm transition-colors active:bg-[#c0c0c0]">
                                                + Add Member
                                            </button>
                                        )}
                                    </td>
                                </tr>

                                {teamMembers.map((member, index) => (
                                    <tr key={index}>
                                        <td colSpan="2" className="py-2 border-b border-[#f5f5f5] bg-[#fafafa] px-3 pb-3">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-[#444] text-[12px]">Member {index + 1}</span>
                                                <button type="button" onClick={() => removeMember(index)} className="text-[#cc0000] hover:underline text-[11px]">Remove [x]</button>
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <div>
                                                    <div className="text-[11px] text-[#666] mb-[2px]">Name</div>
                                                    <input type="text" value={member.name} onChange={(e) => handleMemberChange(index, 'name', e.target.value)} required className={inputClass} />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] text-[#666] mb-[2px]">Roll No</div>
                                                    <input type="text" value={member.rollNo} onChange={(e) => handleMemberChange(index, 'rollNo', e.target.value)} className={inputClass} />
                                                </div>
                                                <div>
                                                    <div className="text-[11px] text-[#666] mb-[2px]">Email</div>
                                                    <input type="email" value={member.email} onChange={(e) => handleMemberChange(index, 'email', e.target.value)} className={inputClass} />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {/* Submit */}
                                <tr>
                                    <td></td>
                                    <td className="py-5 pt-8">
                                        <button
                                            type="submit"
                                            className="bg-[#e4e4e4] border border-[#b9b9b9] hover:bg-[#d0d0d0] px-[16px] py-[3px] text-[#222] font-bold text-[13px] rounded-sm transition-colors active:bg-[#c0c0c0]"
                                        >
                                            Register
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </form>

                    <div className="mt-4 pt-4 border-t border-[#eee] text-center text-[12px]">
                        <div>
                            Already have a team?{' '}
                            <a href="/login" className="text-[#0000cc] hover:text-[#0000ff] hover:underline">Go to Login</a>
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

export default RegisterPage;