import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AdminNavbar from "../../components/AdminNavbar";

const AdminRiddles = () => {
    const [riddles, setRiddles] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [currentRiddleId, setCurrentRiddleId] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        answer: "",
        isActive: true
    });

    const fetchRiddles = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/riddles`, { withCredentials: true });
            setRiddles(data);
        } catch (error) {
            console.error("Error fetching riddles:", error);
            toast.error("Failed to fetch riddles");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRiddles();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleReset = () => {
        setIsEditing(false);
        setCurrentRiddleId(null);
        setFormData({ title: "", description: "", answer: "", isActive: true });
    };

    const handleEdit = (riddle) => {
        setIsEditing(true);
        setCurrentRiddleId(riddle._id);
        setFormData({
            title: riddle.title,
            description: riddle.description,
            answer: riddle.answer,
            isActive: riddle.isActive
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`${import.meta.env.VITE_API_URL}/admin/riddles/${currentRiddleId}`, formData, { withCredentials: true });
                toast.success("Riddle updated!");
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/admin/riddles`, formData, { withCredentials: true });
                toast.success("Riddle created!");
            }
            handleReset();
            fetchRiddles();
        } catch (error) {
            console.error("Error saving riddle:", error);
            toast.error(error.response?.data?.error || "Failed to save riddle");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this riddle?")) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin/riddles/${id}`, { withCredentials: true });
            toast.success("Riddle deleted!");
            fetchRiddles();
        } catch (error) {
            console.error("Error deleting riddle:", error);
            toast.error("Failed to delete riddle");
        }
    };

    const toggleStatus = async (id, currentStatus) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/admin/riddles/${id}`, { isActive: !currentStatus }, { withCredentials: true });
            toast.success("Status updated!");
            fetchRiddles();
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4">
            <AdminNavbar activeTab="RIDDLES" />

            <div className="w-full max-w-[1200px] flex gap-4 items-start">

                {/* Left col: List */}
                <div className="flex-2 bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm">
                    <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 rounded-t-[1px]">
                        Riddles List ({riddles.length})
                    </div>
                    <div className="p-4">
                        {loading ? (
                            <div className="flex justify-center p-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0000cc]"></div>
                            </div>
                        ) : (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-[#b9b9b9] text-left text-[#222]">
                                        <th className="py-2 px-2">Title</th>
                                        <th className="py-2 px-2">Answer</th>
                                        <th className="py-2 px-2">Status</th>
                                        <th className="py-2 px-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {riddles.map((r, i) => (
                                        <tr key={r._id} className={`border-b border-[#eee] ${i % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}>
                                            <td className="py-2 px-2 font-bold text-[#0000cc]">{r.title}</td>
                                            <td className="py-2 px-2"><span className="bg-[#eee] px-1 font-mono text-[11px] border border-[#ccc]">{r.answer}</span></td>
                                            <td className="py-2 px-2">
                                                <button
                                                    onClick={() => toggleStatus(r._id, r.isActive)}
                                                    className={`hover:underline ${r.isActive ? "text-[#00a900]" : "text-[#cc0000]"}`}
                                                >
                                                    {r.isActive ? "Active" : "Inactive"}
                                                </button>
                                            </td>
                                            <td className="py-2 px-2 text-right">
                                                <button onClick={() => handleEdit(r)} className="text-[#0000cc] hover:underline mr-3">Edit</button>
                                                <button onClick={() => handleDelete(r._id)} className="text-[#cc0000] hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {riddles.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="py-4 text-center text-[#666]">No riddles found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Right col: Form */}
                <div className="flex-1 bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm sticky top-[10px]">
                    <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 rounded-t-[1px]">
                        {isEditing ? "Edit Riddle" : "Create New Riddle"}
                    </div>
                    <form onSubmit={handleSubmit} className="p-4">
                        <div className="mb-3">
                            <label className="font-bold text-[#444] mb-1 block">Title:</label>
                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full border border-[#ccc] p-1" />
                        </div>
                        <div className="mb-3">
                            <label className="font-bold text-[#444] mb-1 block">Answer (exact match required):</label>
                            <input type="text" name="answer" value={formData.answer} onChange={handleInputChange} required className="w-full border border-[#ccc] p-1" />
                        </div>

                        <div className="mb-3">
                            <label className="font-bold text-[#444] mb-1 block">Description (Markdown supported):</label>
                            <textarea name="description" value={formData.description} onChange={handleInputChange} required className="w-full border border-[#ccc] p-1 h-[150px] resize-y font-mono text-[12px]"></textarea>
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
                                <span className="font-bold text-[#444]">Is Active</span>
                            </label>
                        </div>

                        <div className="flex gap-2">
                            <button type="submit" className="bg-[#e1e1e1] hover:bg-[#d1d1d1] border border-[#b9b9b9] px-4 py-1 text-[13px] font-bold flex-1">
                                {isEditing ? "Update" : "Create"}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={handleReset} className="bg-[#f0f0f0] hover:bg-[#e0e0e0] border border-[#ccc] px-4 py-1 text-[13px] flex-1">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default AdminRiddles;
