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
        const { id, value } = e.target;

        if (id === 'rollNo') {
            // Auto fill year and branch based on Roll No
            let branch = formData.branch;
            let year = formData.year;

            if (value && value.length >= 3) {
                // Parse year
                const batchYearStr = value.substring(0, 2);
                const batchYear = parseInt(batchYearStr, 10);

                if (!isNaN(batchYear)) {
                    // Logic: 25 -> 1st year in 2026, 24 -> 2nd year
                    // Year of study = 26 - batchYear
                    const yearOfStudy = 26 - batchYear;
                    if (yearOfStudy === 1) year = '1st Year';
                    else if (yearOfStudy === 2) year = '2nd Year';
                    else if (yearOfStudy === 3) year = '3rd Year';
                    else if (yearOfStudy === 4) year = '4th Year';
                }

                // Parse branch
                const branchCode = value.substring(2, 3);
                const branchMap = {
                    '1': 'Civil Engineering',
                    '2': 'Computer Science and Engineering',
                    '3': 'Electrical Engineering',
                    '4': 'Electronics Engineering',
                    '5': 'Mechanical Engineering',
                    '6': 'Information Technology'
                };

                if (branchMap[branchCode]) {
                    branch = branchMap[branchCode];
                }
            }

            setFormData({
                ...formData,
                [id]: value,
                branch: branch,
                year: year
            });
        } else {
            setFormData({ ...formData, [id]: value });
        }
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

    const inputClass = "w-full border border-[#ccc] focus:border-[#888] focus:outline-none focus:shadow-[0_0_3px_#aaa] px-[5px] py-[4px] sm:py-[2px] transition-shadow text-[13px]";
    const labelClass = "sm:w-[35%] sm:text-right sm:pr-4 font-bold align-top pt-1 sm:pt-2 mb-1 sm:mb-0";

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4 px-2 sm:px-4">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            {/* Top Navbar / Header */}
            <div className="w-full max-w-[1000px] flex flex-col sm:flex-row items-center sm:items-end justify-between border-b border-[#b9b9b9] pb-2 mb-8 gap-4 sm:gap-0">
                {/* Left side: Logos */}
                <div className="flex items-center gap-4">
                    <img src="/logo.png" alt="CodeQuest Logo" className="h-12 sm:h-16 object-contain" />
                    <div className="h-10 sm:h-12 w-px bg-[#b9b9b9]"></div>
                    <img src="/knitlogo.png" alt="KNIT Logo" className="h-10 sm:h-14 object-contain" />
                </div>

                {/* Right side: Navigation */}
                <div className="text-[13px] text-[#0000cc]">
                    <a href="/login" className="hover:underline hover:text-[#0000ff]">Login</a>
                    <span className="mx-2 text-[#b9b9b9]">|</span>
                    <a href="/register" className="hover:underline hover:text-[#0000ff]">Register</a>
                </div>
            </div>

            {/* Main Register Box */}
            <div className="w-full max-w-[600px] bg-white border border-[#b9b9b9] text-[13px] shadow-sm tracking-wide rounded-sm">

                {/* Header */}
                <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 mb-2 rounded-t-[1px]">
                    Register Team for CodeQuest
                </div>

                {/* Form Container */}
                <div className="p-4 px-3 sm:px-6 text-[#222]">
                    <form onSubmit={handleRegister}>
                        <div className="flex flex-col gap-3 sm:gap-2 w-full">
                            {/* Team Info */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                                <div className={labelClass}><label htmlFor="teamName">Team Name</label></div>
                                <div className="w-full sm:w-[65%]"><input id="teamName" type="text" value={formData.teamName} onChange={handleChange} required className={inputClass} /></div>
                            </div>

                            {/* Leader Info */}
                            <div className="pt-4 pb-2 border-b border-[#eee] text-[#666] font-bold mt-2">Team Leader Information</div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                                <div className={labelClass}><label htmlFor="teamLeaderName">Leader Name</label></div>
                                <div className="w-full sm:w-[65%]"><input id="teamLeaderName" type="text" value={formData.teamLeaderName} onChange={handleChange} required className={inputClass} /></div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                                <div className={labelClass}><label htmlFor="teamLeaderEmail">Email</label></div>
                                <div className="w-full sm:w-[65%]"><input id="teamLeaderEmail" type="email" value={formData.teamLeaderEmail} onChange={handleChange} required className={inputClass} /></div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                                <div className={labelClass}><label htmlFor="password">Password</label></div>
                                <div className="w-full sm:w-[65%]"><input id="password" type="password" value={formData.password} onChange={handleChange} required className={inputClass} /></div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                                <div className={labelClass}><label htmlFor="confirmPassword">Confirm Password</label></div>
                                <div className="w-full sm:w-[65%]"><input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required className={inputClass} /></div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                                <div className={labelClass}><label htmlFor="rollNo">Roll No</label></div>
                                <div className="w-full sm:w-[65%]"><input id="rollNo" type="text" value={formData.rollNo} onChange={handleChange} required className={inputClass} /></div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                                <div className={labelClass}><label htmlFor="branch">Branch</label></div>
                                <div className="w-full sm:w-[65%]"><input id="branch" type="text" value={formData.branch} onChange={handleChange} required className={inputClass} readOnly /></div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                                <div className={labelClass}><label htmlFor="year">Year</label></div>
                                <div className="w-full sm:w-[65%]"><input id="year" type="text" value={formData.year} onChange={handleChange} required className={inputClass} readOnly /></div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center">
                                <div className={labelClass}><label htmlFor="mobileNo">Mobile No</label></div>
                                <div className="w-full sm:w-[65%]"><input id="mobileNo" type="text" value={formData.mobileNo} onChange={handleChange} required className={inputClass} /></div>
                            </div>

                            {/* Team Members Info */}
                            <div className="pt-6 pb-2 border-b border-[#eee] flex justify-between items-center text-[#666] font-bold mt-2">
                                <span>Team Members (Optional, Max 3)</span>
                                {teamMembers.length < 3 && (
                                    <button type="button" onClick={addMember} className="bg-[#e4e4e4] border border-[#b9b9b9] hover:bg-[#d0d0d0] px-[8px] py-[2px] text-[#222] font-semibold text-[11px] rounded-sm transition-colors active:bg-[#c0c0c0]">
                                        + Add Member
                                    </button>
                                )}
                            </div>

                            {teamMembers.map((member, index) => (
                                <div key={index} className="py-3 border border-[#f5f5f5] bg-[#fafafa] px-3 mb-2 rounded-sm shadow-sm">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-[#444] text-[12px]">Member {index + 1}</span>
                                        <button type="button" onClick={() => removeMember(index)} className="text-[#cc0000] hover:underline text-[11px] font-semibold">Remove [x]</button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                                        <div>
                                            <div className="text-[11px] text-[#666] mb-[2px] font-semibold">Name</div>
                                            <input type="text" value={member.name} onChange={(e) => handleMemberChange(index, 'name', e.target.value)} required className={inputClass} />
                                        </div>
                                        <div>
                                            <div className="text-[11px] text-[#666] mb-[2px] font-semibold">Roll No</div>
                                            <input type="text" value={member.rollNo} onChange={(e) => handleMemberChange(index, 'rollNo', e.target.value)} className={inputClass} />
                                        </div>
                                        <div>
                                            <div className="text-[11px] text-[#666] mb-[2px] font-semibold">Email</div>
                                            <input type="email" value={member.email} onChange={(e) => handleMemberChange(index, 'email', e.target.value)} className={inputClass} />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Submit */}
                            <div className="flex flex-col sm:flex-row mt-6">
                                <div className="hidden sm:block sm:w-[35%]"></div>
                                <div className="w-full sm:w-[65%]">
                                    <button
                                        type="submit"
                                        className="bg-[#e4e4e4] border border-[#b9b9b9] hover:bg-[#d0d0d0] px-[16px] py-[6px] sm:py-[3px] text-[#222] font-bold text-[13px] rounded-sm transition-colors active:bg-[#c0c0c0] w-full sm:w-auto"
                                    >
                                        Register
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    <div className="mt-6 sm:mt-4 pt-4 border-t border-[#eee] text-center text-[12px]">
                        <div>
                            Already have a team?{' '}
                            <a href="/login" className="text-[#0000cc] hover:text-[#0000ff] hover:underline">Go to Login</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mock Codeforces Footer styling */}
            <div className="mt-8 text-[11px] text-[#666] border-t border-[#ccc] w-full max-w-[600px] text-center pt-2 pb-4">
                <a href="#" className="text-[#0000cc] hover:underline mx-1">CodeQuest</a>
                by Team (c) Copyright 2026<br />
                Server time: <span>{new Date().toISOString().replace('T', ' ').split('.')[0]}</span>
            </div>
        </div>
    );
};

export default RegisterPage;