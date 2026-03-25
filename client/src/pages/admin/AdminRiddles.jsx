import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/AdminNavbar';

const AdminRiddles = () => {
    const [riddles, setRiddles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentRiddleId, setCurrentRiddleId] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'Medium',
        points: 10,
        answer: '',
        isActive: true
    });

    const fetchRiddles = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/riddles`, { withCredentials: true });
            setRiddles(data);
        } catch (error) {
            console.error('Error fetching riddles:', error);
            toast.error('Failed to load riddles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRiddles();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const openCreateModal = () => {
        setEditMode(false);
        setFormData({ title: '', description: '', difficulty: 'Medium', points: 10, answer: '', isActive: true });
        setIsModalOpen(true);
    };

    const openEditModal = (riddle) => {
        setEditMode(true);
        setCurrentRiddleId(riddle._id);
        setFormData({
            title: riddle.title,
            description: riddle.description,
            difficulty: riddle.difficulty,
            points: riddle.points,
            answer: riddle.answer,
            isActive: riddle.isActive
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await axios.put(`${import.meta.env.VITE_API_URL}/admin/riddles/${currentRiddleId}`, formData, { withCredentials: true });
                toast.success('Riddle updated!');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/admin/riddles`, formData, { withCredentials: true });
                toast.success('Riddle created!');
            }
            setIsModalOpen(false);
            fetchRiddles();
        } catch (error) {
            console.error(error);
            toast.error(editMode ? 'Failed to update riddle' : 'Failed to create riddle');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this riddle?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin/riddles/${id}`, { withCredentials: true });
            toast.success('Riddle deleted!');
            fetchRiddles();
        } catch (error) {
            console.error(error);
            toast.error('Error deleting riddle.');
        }
    };

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4">
            <AdminNavbar activeTab="RIDDLES" />

            <div className="w-full max-w-[1200px]">
                <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm">
                    <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 rounded-t-[1px] flex justify-between items-center">
                        <span>Manage Riddles</span>
                        <button onClick={openCreateModal} className="text-[#0000cc] hover:underline">+ Create New Riddle</button>
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <p className="p-4 text-center text-[#666]">Loading riddles...</p>
                        ) : riddles.length === 0 ? (
                            <p className="p-4 text-center text-[#888] italic">No riddles have been created yet.</p>
                        ) : (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-[#b9b9b9] text-left text-[#222]">
                                        <th className="py-2 px-2">Title</th>
                                        <th className="py-2 px-2">Difficulty</th>
                                        <th className="py-2 px-2">Points</th>
                                        <th className="py-2 px-2">Answer String</th>
                                        <th className="py-2 px-2">Status</th>
                                        <th className="py-2 px-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {riddles.map((r, index) => (
                                        <tr key={r._id} className={`border-b border-[#eee] ${index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}`}>
                                            <td className="py-2 px-2 font-bold text-[#0000cc]">{r.title}</td>
                                            <td className="py-2 px-2">{r.difficulty}</td>
                                            <td className="py-2 px-2">{r.points}</td>
                                            <td className="py-2 px-2 font-mono text-[11px] text-[#cc0000]">{r.answer}</td>
                                            <td className="py-2 px-2">
                                                {r.isActive
                                                    ? <span className="text-[#00a900] font-bold">Active</span>
                                                    : <span className="text-[#888] font-bold line-through">Hidden</span>}
                                            </td>
                                            <td className="py-2 px-2 text-right flex gap-3 justify-end">
                                                <button onClick={() => openEditModal(r)} className="text-[#0000cc] hover:underline">Edit</button>
                                                <button onClick={() => handleDelete(r._id)} className="text-[#cc0000] hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for Creating/Editing */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50">
                    <div className="bg-white border border-[#b9b9b9] shadow-md w-full max-w-[500px]">
                        <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 flex justify-between items-center">
                            <span>{editMode ? 'Edit Riddle' : 'Create New Riddle'}</span>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#cc0000] hover:underline">Close</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 text-[13px] flex flex-col gap-3">
                            <div>
                                <label className="font-bold text-[#444] mb-1 block">Title:</label>
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full border border-[#ccc] p-1" />
                            </div>
                            <div>
                                <label className="font-bold text-[#444] mb-1 block">Description:</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="4" className="w-full border border-[#ccc] p-1 font-mono text-[12px]"></textarea>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="font-bold text-[#444] mb-1 block">Difficulty:</label>
                                    <select name="difficulty" value={formData.difficulty} onChange={handleInputChange} className="w-full border border-[#ccc] p-1">
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="font-bold text-[#444] mb-1 block">Points:</label>
                                    <input type="number" name="points" value={formData.points} onChange={handleInputChange} required className="w-full border border-[#ccc] p-1" />
                                </div>
                            </div>
                            <div>
                                <label className="font-bold text-[#444] mb-1 block">Secret Answer/Flag:</label>
                                <input type="text" name="answer" value={formData.answer} onChange={handleInputChange} required className="w-full border border-[#ccc] p-1 font-mono" />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                                <label htmlFor="isActive" className="font-bold text-[#444]">Is Active (Visible to participants)</label>
                            </div>

                            <div className="mt-4 flex justify-end gap-2 border-t border-[#eee] pt-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-1 border border-[#ccc] bg-[#f9f9f9] hover:bg-[#e1e1e1]">Cancel</button>
                                <button type="submit" className="px-4 py-1 bg-[#cc0000] text-white font-bold hover:bg-[#a00000]">{editMode ? 'Save Changes' : 'Create Riddle'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRiddles;