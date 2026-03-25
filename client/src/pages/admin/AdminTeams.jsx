import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/AdminNavbar';

const AdminTeams = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTeams = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/teams`, {
                withCredentials: true
            });
            setTeams(data);
        } catch (error) {
            console.error('Error fetching teams:', error);
            toast.error('Failed to load teams');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleAction = async (id, action) => {
        let endpoint = '';
        let method = 'put';

        if (action === 'VERIFY') {
            endpoint = `/admin/teams/${id}/verify`;
        } else if (action === 'UNVERIFY') {
            endpoint = `/admin/teams/${id}/unverify`;
        } else if (action === 'DISQUALIFY') {
            if (!window.confirm('Are you sure you want to disqualify this team?')) return;
            endpoint = `/admin/teams/${id}`;
            method = 'delete';
        }

        try {
            if (method === 'put') {
                await axios.put(`${import.meta.env.VITE_API_URL}${endpoint}`, {}, { withCredentials: true });
            } else if (method === 'delete') {
                await axios.delete(`${import.meta.env.VITE_API_URL}${endpoint}`, { withCredentials: true });
            }

            toast.success(`Team successfully ${action.toLowerCase()}d!`);
            fetchTeams(); // Refresh the list
        } catch (error) {
            console.error(`Error performing ${action}:`, error);
            toast.error(`Failed to ${action.toLowerCase()} team.`);
        }
    };

    const getTeamStatus = (team) => {
        if (team.isDisqualified) return 'Disqualified';
        if (team.isVerified) return 'Verified';
        return 'Pending';
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Verified': return 'text-[#00a900] font-bold';
            case 'Pending': return 'text-[#ff8c00] font-bold';
            case 'Disqualified': return 'text-[#cc0000] font-bold line-through';
            default: return 'text-[#333]';
        }
    };

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4">
            <AdminNavbar activeTab="TEAMS" />

            <div className="w-full max-w-[1200px]">
                <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm">
                    <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 rounded-t-[1px] flex justify-between items-center">
                        <span>Manage Teams</span>
                        <span className="text-[11px] font-normal text-[#666]">Total: {teams.length}</span>
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <p className="p-4 text-center text-[#666]">Loading teams...</p>
                        ) : (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-[#b9b9b9] text-left text-[#222]">
                                        <th className="py-2 px-2">Team Name</th>
                                        <th className="py-2 px-2">Leader</th>
                                        <th className="py-2 px-2">Leader Email</th>
                                        <th className="py-2 px-2">Members</th>
                                        <th className="py-2 px-2">Status</th>
                                        <th className="py-2 px-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams.map((team, index) => {
                                        const status = getTeamStatus(team);
                                        return (
                                            <tr key={team._id} className={`border-b border-[#eee] ${index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}`}>
                                                <td className="py-2 px-2 font-bold text-[#0000cc]">{team.teamName}</td>
                                                <td className="py-2 px-2">{team.teamLeaderName}</td>
                                                <td className="py-2 px-2 text-[#0000cc]">{team.teamLeaderEmail}</td>
                                                <td className="py-2 px-2">{team.teamMembers?.length || 0}</td>
                                                <td className={`py-2 px-2 ${getStatusStyle(status)}`}>{status}</td>
                                                <td className="py-2 px-2 text-right flex gap-2 justify-end">
                                                    {status !== 'Verified' && status !== 'Disqualified' && (
                                                        <button onClick={() => handleAction(team._id, 'VERIFY')} className="text-[#00a900] hover:underline hover:text-[#007700]">Verify</button>
                                                    )}
                                                    {status === 'Verified' && (
                                                        <button onClick={() => handleAction(team._id, 'UNVERIFY')} className="text-[#ff8c00] hover:underline hover:text-[#cc7000]">Unverify</button>
                                                    )}
                                                    {status !== 'Disqualified' && (
                                                        <button onClick={() => handleAction(team._id, 'DISQUALIFY')} className="text-[#cc0000] hover:underline hover:text-[#990000]">Disqualify</button>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminTeams;