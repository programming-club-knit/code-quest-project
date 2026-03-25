import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import AdminNavbar from '../../components/AdminNavbar';

const AdminProblems = () => {
    const [problems, setProblems] = useState([]);
    const [riddles, setRiddles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentProblemId, setCurrentProblemId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        inputFormat: '',
        outputFormat: '',
        constraints: '',
        riddleId: '',
        points: 100,
        difficulty: 'Medium',
        timeLimit: 2.0,
        memoryLimit: 256000,
        isActive: true,
        testCases: []
    });

    const [testCaseInput, setTestCaseInput] = useState('');
    const [testCaseExpected, setTestCaseExpected] = useState('');
    const [isTestCaseHidden, setIsTestCaseHidden] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchProblems = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/problems`, { withCredentials: true });
            setProblems(data);
        } catch (error) {
            console.error('Error fetching problems:', error);
            toast.error('Failed to load problems');
        } finally {
            setLoading(false);
        }
    };

    const fetchRiddles = async () => {
        try {
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/admin/riddles`, { withCredentials: true });
            setRiddles(data);
        } catch (error) {
            console.error('Error fetching riddles:', error);
        }
    };

    useEffect(() => {
        fetchProblems();
        fetchRiddles();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        });
    };

    const addTestCase = () => {
        if (!testCaseInput.trim() || !testCaseExpected.trim()) {
            toast.error('Please fill in both input and expected output');
            return;
        }
        setFormData({
            ...formData,
            testCases: [
                ...formData.testCases,
                {
                    input: testCaseInput,
                    expectedOutput: testCaseExpected,
                    isHidden: isTestCaseHidden
                }
            ]
        });
        setTestCaseInput('');
        setTestCaseExpected('');
        setIsTestCaseHidden(false);
    };

    const removeTestCase = (index) => {
        setFormData({
            ...formData,
            testCases: formData.testCases.filter((_, i) => i !== index)
        });
    };

    const openCreateModal = () => {
        setEditMode(false);
        setFormData({
            title: '',
            description: '',
            inputFormat: '',
            outputFormat: '',
            constraints: '',
            riddleId: '',
            points: 100,
            difficulty: 'Medium',
            timeLimit: 2.0,
            memoryLimit: 256000,
            isActive: true,
            testCases: []
        });
        setTestCaseInput('');
        setTestCaseExpected('');
        setIsTestCaseHidden(false);
        setIsModalOpen(true);
    };

    const openEditModal = (problem) => {
        setEditMode(true);
        setCurrentProblemId(problem._id);
        setFormData({
            title: problem.title,
            description: problem.description,
            inputFormat: problem.inputFormat,
            outputFormat: problem.outputFormat,
            constraints: problem.constraints,
            riddleId: problem.riddleId?._id || problem.riddleId || '',
            points: problem.points,
            difficulty: problem.difficulty,
            timeLimit: problem.timeLimit,
            memoryLimit: problem.memoryLimit,
            isActive: problem.isActive,
            testCases: problem.testCases || []
        });
        setTestCaseInput('');
        setTestCaseExpected('');
        setIsTestCaseHidden(false);
        setIsModalOpen(true);
    };

    const validateFormBeforeSubmit = () => {
        if (!formData.title.trim()) return 'Problem title is required.';
        if (!formData.description.trim()) return 'Problem description is required.';
        if (!formData.inputFormat.trim()) return 'Input format is required.';
        if (!formData.outputFormat.trim()) return 'Output format is required.';
        if (!formData.constraints.trim()) return 'Constraints are required.';
        if (!formData.riddleId) return 'Please link this problem to a riddle.';
        if (!Number.isFinite(formData.points) || formData.points <= 0) return 'Points must be greater than 0.';
        if (!Number.isFinite(formData.timeLimit) || formData.timeLimit <= 0) return 'Time limit must be greater than 0.';
        if (!Number.isFinite(formData.memoryLimit) || formData.memoryLimit <= 0) return 'Memory limit must be greater than 0.';
        if (!Array.isArray(formData.testCases) || formData.testCases.length === 0) return 'Add at least one test case.';
        if (!formData.testCases.some((tc) => !tc.isHidden)) return 'At least one test case must be public (not hidden) for example display.';
        if (testCaseInput.trim() || testCaseExpected.trim()) return 'You have an unadded test case draft. Click Add Test Case or clear it.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateFormBeforeSubmit();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        try {
            setIsSubmitting(true);
            if (editMode) {
                await axios.put(`${import.meta.env.VITE_API_URL}/admin/problems/${currentProblemId}`, formData, { withCredentials: true });
                toast.success('Problem updated!');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/admin/problems`, formData, { withCredentials: true });
                toast.success('Problem created!');
            }
            setIsModalOpen(false);
            fetchProblems();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || (editMode ? 'Failed to update problem' : 'Failed to create problem'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this problem?')) return;
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin/problems/${id}`, { withCredentials: true });
            toast.success('Problem deleted!');
            fetchProblems();
        } catch (error) {
            console.error(error);
            toast.error('Error deleting problem.');
        }
    };

    return (
        <div className="font-sans min-h-screen bg-[#f3f3f3] flex flex-col items-center py-4">
            <AdminNavbar activeTab="PROBLEMS" />

            <div className="w-full max-w-[1200px]">
                <div className="bg-white border border-[#b9b9b9] text-[13px] shadow-sm rounded-sm">
                    <div className="border-b border-[#b9b9b9] bg-[#e1e1e1] text-[#333] font-bold py-[6px] px-3 rounded-t-[1px] flex justify-between items-center">
                        <span>Manage Coding Problems</span>
                        <button onClick={openCreateModal} className="text-[#0000cc] hover:underline">+ Create New Problem</button>
                    </div>

                    <div className="p-4">
                        {loading ? (
                            <p className="p-4 text-center text-[#666]">Loading problems...</p>
                        ) : problems.length === 0 ? (
                            <p className="p-4 text-center text-[#888] italic">No problems have been created yet.</p>
                        ) : (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-[#b9b9b9] text-left text-[#222]">
                                        <th className="py-2 px-2">Title</th>
                                        <th className="py-2 px-2">Linked Riddle</th>
                                        <th className="py-2 px-2">Difficulty</th>
                                        <th className="py-2 px-2">Points</th>
                                        <th className="py-2 px-2">Test Cases</th>
                                        <th className="py-2 px-2">Time/Memory</th>
                                        <th className="py-2 px-2">Status</th>
                                        <th className="py-2 px-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {problems.map((p, index) => (
                                        <tr key={p._id} className={`border-b border-[#eee] ${index % 2 === 0 ? 'bg-white' : 'bg-[#fafafa]'}`}>
                                            <td className="py-2 px-2 font-bold text-[#0000cc]">{p.title}</td>
                                            <td className="py-2 px-2 text-[#666]">{p.riddleId?.title || 'N/A'}</td>
                                            <td className="py-2 px-2">{p.difficulty}</td>
                                            <td className="py-2 px-2">{p.points}</td>
                                            <td className="py-2 px-2 text-center">{p.testCases?.length || 0}</td>
                                            <td className="py-2 px-2 text-[11px] font-mono text-[#666]">{p.timeLimit}s / {p.memoryLimit}KB</td>
                                            <td className="py-2 px-2">
                                                {p.isActive
                                                    ? <span className="text-[#00a900] font-bold">Active</span>
                                                    : <span className="text-[#888] font-bold line-through">Hidden</span>}
                                            </td>
                                            <td className="py-2 px-2 text-right flex gap-3 justify-end">
                                                <button onClick={() => openEditModal(p)} className="text-[#0000cc] hover:underline">Edit</button>
                                                <button onClick={() => handleDelete(p._id)} className="text-[#cc0000] hover:underline">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for Creating/Editing Problems */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-sm shadow-lg w-full max-w-[700px] max-h-[90vh] overflow-y-auto border border-[#b9b9b9]">
                        <div className="sticky top-0 bg-[#e1e1e1] border-b border-[#b9b9b9] px-4 py-3 font-bold text-[#333] flex justify-between items-center">
                            <span>{editMode ? 'Edit Problem' : 'Create New Problem'}</span>
                            <button onClick={() => setIsModalOpen(false)} className="text-[#666] hover:text-[#222] text-[18px]">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-3 text-[13px]">
                            {/* Basic Problem Info */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-[#222] mb-1">Problem Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-[#b9b9b9] px-2 py-1 focus:outline-none focus:border-[#666]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-[#222] mb-1">Linked Riddle *</label>
                                    <select
                                        name="riddleId"
                                        value={formData.riddleId}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full border border-[#b9b9b9] px-2 py-1 focus:outline-none focus:border-[#666]"
                                    >
                                        <option value="">Select a Riddle</option>
                                        {riddles.map(r => (
                                            <option key={r._id} value={r._id}>{r.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Problem Description */}
                            <div>
                                <label className="block font-bold text-[#222] mb-1">Problem Description *</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    required
                                    rows="3"
                                    className="w-full border border-[#b9b9b9] px-2 py-1 focus:outline-none focus:border-[#666] font-mono text-[12px]"
                                />
                            </div>

                            {/* Input/Output Format */}
                            <div>
                                <label className="block font-bold text-[#222] mb-1">Input Format *</label>
                                <textarea
                                    name="inputFormat"
                                    value={formData.inputFormat}
                                    onChange={handleInputChange}
                                    required
                                    rows="2"
                                    className="w-full border border-[#b9b9b9] px-2 py-1 focus:outline-none focus:border-[#666] font-mono text-[12px]"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-[#222] mb-1">Output Format *</label>
                                <textarea
                                    name="outputFormat"
                                    value={formData.outputFormat}
                                    onChange={handleInputChange}
                                    required
                                    rows="2"
                                    className="w-full border border-[#b9b9b9] px-2 py-1 focus:outline-none focus:border-[#666] font-mono text-[12px]"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-[#222] mb-1">Constraints *</label>
                                <textarea
                                    name="constraints"
                                    value={formData.constraints}
                                    onChange={handleInputChange}
                                    required
                                    rows="2"
                                    className="w-full border border-[#b9b9b9] px-2 py-1 focus:outline-none focus:border-[#666] font-mono text-[12px]"
                                />
                            </div>

                            {/* Judge0 Config */}
                            <div className="grid grid-cols-2 gap-3 bg-[#f5f5f5] p-3 border border-[#e1e1e1] rounded-sm">
                                <div>
                                    <label className="block font-bold text-[#222] mb-1">Time Limit (seconds)</label>
                                    <input
                                        type="number"
                                        name="timeLimit"
                                        value={formData.timeLimit}
                                        onChange={handleInputChange}
                                        step="0.1"
                                        min="0.1"
                                        required
                                        className="w-full border border-[#b9b9b9] px-2 py-1 focus:outline-none focus:border-[#666]"
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-[#222] mb-1">Memory Limit (KB)</label>
                                    <input
                                        type="number"
                                        name="memoryLimit"
                                        value={formData.memoryLimit}
                                        onChange={handleInputChange}
                                        min="1"
                                        required
                                        className="w-full border border-[#b9b9b9] px-2 py-1 focus:outline-none focus:border-[#666]"
                                    />
                                </div>
                            </div>

                            {/* Difficulty & Points */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-[#222] mb-1">Difficulty</label>
                                    <select
                                        name="difficulty"
                                        value={formData.difficulty}
                                        onChange={handleInputChange}
                                        className="w-full border border-[#b9b9b9] px-2 py-1 focus:outline-none focus:border-[#666]"
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-[#222] mb-1">Points</label>
                                    <input
                                        type="number"
                                        name="points"
                                        value={formData.points}
                                        onChange={handleInputChange}
                                        min="1"
                                        required
                                        className="w-full border border-[#b9b9b9] px-2 py-1 focus:outline-none focus:border-[#666]"
                                    />
                                </div>
                            </div>

                            {/* Test Cases */}
                            <div className="border border-[#e1e1e1] p-3 rounded-sm bg-[#fafafa]">
                                <label className="block font-bold text-[#222] mb-2">Test Cases</label>
                                <div className="space-y-2 mb-2">
                                    <textarea
                                        placeholder="Input"
                                        value={testCaseInput}
                                        onChange={(e) => setTestCaseInput(e.target.value)}
                                        rows="2"
                                        className="w-full border border-[#b9b9b9] px-2 py-1 focus:outline-none focus:border-[#666] font-mono text-[11px]"
                                    />
                                    <textarea
                                        placeholder="Expected Output"
                                        value={testCaseExpected}
                                        onChange={(e) => setTestCaseExpected(e.target.value)}
                                        rows="2"
                                        className="w-full border border-[#b9b9b9] px-2 py-1 focus:outline-none focus:border-[#666] font-mono text-[11px]"
                                    />
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={isTestCaseHidden}
                                            onChange={(e) => setIsTestCaseHidden(e.target.checked)}
                                        />
                                        <span className="text-[12px]">Hide from users (for final validation only)</span>
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addTestCase}
                                        className="w-full bg-[#e1e1e1] hover:bg-[#d1d1d1] border border-[#b9b9b9] px-2 py-1 text-[12px] font-bold cursor-pointer"
                                    >
                                        + Add Test Case
                                    </button>
                                </div>

                                {/* Display Added Test Cases */}
                                {formData.testCases.length > 0 && (
                                    <div className="space-y-1 text-[12px]">
                                        <p className="font-bold text-[#333]">Added Test Cases ({formData.testCases.length}):</p>
                                        <p className="text-[#666]">Public examples: {formData.testCases.filter((tc) => !tc.isHidden).length}</p>
                                        {formData.testCases.map((tc, idx) => (
                                            <div key={idx} className="flex justify-between items-start bg-white p-2 border border-[#ddd] rounded-sm">
                                                <div className="flex-1 mr-2">
                                                    <p className="font-mono text-[11px] text-[#333]"><strong>Input:</strong> {tc.input.substring(0, 50)}...</p>
                                                    <p className="font-mono text-[11px] text-[#333]"><strong>Output:</strong> {tc.expectedOutput.substring(0, 50)}...</p>
                                                    {tc.isHidden && <p className="text-[#cc0000] text-[11px]">🔒 Hidden</p>}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeTestCase(idx)}
                                                    className="text-[#cc0000] hover:underline text-[11px] whitespace-nowrap"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Active Status */}
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                />
                                <span className="text-[13px] font-bold text-[#222]">Active (visible to users)</span>
                            </label>

                            {/* Form Actions */}
                            <div className="flex gap-2 justify-end pt-4 border-t border-[#e1e1e1]">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-[#e1e1e1] hover:bg-[#d1d1d1] border border-[#b9b9b9] px-4 py-2 text-[13px] font-bold cursor-pointer rounded-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-[#00a900] hover:bg-[#008800] text-white border border-[#006600] px-4 py-2 text-[13px] font-bold cursor-pointer rounded-sm disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Saving...' : (editMode ? 'Update Problem' : 'Create Problem')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProblems;
