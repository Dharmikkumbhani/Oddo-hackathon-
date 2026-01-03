import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/authService';
import { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus } from '../services/leaveService';
import axios from 'axios';

const Leave = () => {
    const [showModal, setShowModal] = useState(false);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);

    // New Leave Form State - Defaulting to 'Paid Time Off'
    const [newLeave, setNewLeave] = useState({
        leaveType: 'Paid Time Off',
        startDate: '',
        endDate: ''
    });

    const [isAdminOrHR, setIsAdminOrHR] = useState(false);

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
            setIsAdminOrHR(currentUser.role === 'Admin' || currentUser.role === 'HR');
            fetchData(currentUser);
            fetchProfile(currentUser);
        }
    }, []);

    const fetchData = async (currentUser) => {
        try {
            setLoading(true);
            if (currentUser.role === 'Admin' || currentUser.role === 'HR') {
                const data = await getAllLeaves();
                setLeaves(data);
            } else {
                const data = await getMyLeaves();
                setLeaves(data);
            }
        } catch (error) {
            console.error("Error fetching leaves:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchProfile = async (currentUser) => {
        try {
            const userStr = localStorage.getItem('user');
            const token = JSON.parse(userStr).token;

            const response = await axios.get('http://localhost:5001/api/profile/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
        } catch (error) {
            console.error("Error fetching profile:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewLeave({ ...newLeave, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await applyLeave(newLeave);
            setShowModal(false);
            setNewLeave({ leaveType: 'Paid Time Off', startDate: '', endDate: '' }); // Reset
            fetchData(user);
        } catch (error) {
            console.error("Error applying for leave:", error);
            alert("Failed to apply for leave");
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateLeaveStatus(id, { status, adminComment: 'Actioned by Admin' });
            fetchData(user);
        } catch (error) {
            console.error("Error updating status:", error);
            alert(error.response?.data?.message || "Failed to update status");
        }
    };

    // Allocation logic
    const allocation = {
        paid: profile?.paidLeaveBalance ?? 24,
        sick: profile?.sickLeaveBalance ?? 7
    };

    // Calculate duration display
    const getDuration = () => {
        if (newLeave.startDate && newLeave.endDate) {
            const start = new Date(newLeave.startDate);
            const end = new Date(newLeave.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            return diffDays.toFixed(2);
        }
        return "00.00";
    };

    if (!user) return <div className="p-10">Loading User...</div>;

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Time Off</h1>
                        </div>
                    </div>

                    {/* NEW Button */}
                    <div className="bg-white p-4 rounded-lg border shadow-sm flex items-center justify-between">
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-md font-medium transition-colors shadow-sm"
                        >
                            NEW
                        </button>
                    </div>
                </div>

                {/* Balance Cards (Top Section) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="text-blue-500 font-medium mb-2">Paid Leave Balance</h3>
                        <p className="text-3xl font-bold text-gray-800">{allocation.paid} <span className="text-sm text-gray-500 font-normal">Days Available</span></p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                        <h3 className="text-blue-500 font-medium mb-2">Sick Leave Balance</h3>
                        <p className="text-3xl font-bold text-gray-800">{allocation.sick} <span className="text-sm text-gray-500 font-normal">Days Available</span></p>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border shadow-sm overflow-hidden min-h-[400px]">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    {isAdminOrHR && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    {isAdminOrHR && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan={isAdminOrHR ? 6 : 4} className="text-center py-8">Loading...</td></tr>
                                ) : leaves.length === 0 ? (
                                    <tr><td colSpan={isAdminOrHR ? 6 : 4} className="text-center py-8 text-gray-500">No leave requests found</td></tr>
                                ) : (
                                    leaves.map(leave => (
                                        <tr key={leave.id} className="hover:bg-gray-50 transition-colors">
                                            {isAdminOrHR && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {leave.Employee?.name || 'Unknown'}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">{leave.leaveType}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.startDate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{leave.endDate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                            ${leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                        leave.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {leave.status}
                                                </span>
                                            </td>
                                            {isAdminOrHR && (
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                                                    {leave.status === 'Pending' ? (
                                                        <>
                                                            <button onClick={() => handleStatusUpdate(leave.id, 'Approved')} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-xs font-medium">Approve</button>
                                                            <button onClick={() => handleStatusUpdate(leave.id, 'Rejected')} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-xs font-medium">Reject</button>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs italic">Actioned</span>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="flex justify-between items-center px-6 py-4 border-b">
                                <h3 className="text-lg font-semibold text-gray-800">Time off Type Request</h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-3 items-center gap-4">
                                    <label className="text-sm font-medium text-gray-600">Employee</label>
                                    <div className="col-span-2 text-blue-500 font-medium">[{user.name}]</div>
                                </div>

                                <div className="grid grid-cols-3 items-center gap-4">
                                    <label className="text-sm font-medium text-gray-600">Time Off Type</label>
                                    <select
                                        name="leaveType"
                                        value={newLeave.leaveType}
                                        onChange={handleInputChange}
                                        className="col-span-2 w-full p-2 border rounded-md text-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                                    >
                                        <option value="Paid Time Off">Paid Time Off</option>
                                        <option value="Sick Leave">Sick Leave</option>
                                        <option value="Unpaid Leave">Unpaid Leave</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-3 items-center gap-4">
                                    <label className="text-sm font-medium text-gray-600">Validity Period</label>
                                    <div className="col-span-2 flex items-center gap-2">
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={newLeave.startDate}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border rounded-md text-sm cursor-pointer"
                                            required
                                        />
                                        <span className="text-gray-400">To</span>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={newLeave.endDate}
                                            onChange={handleInputChange}
                                            className="w-full p-2 border rounded-md text-sm cursor-pointer"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 items-center gap-4">
                                    <label className="text-sm font-medium text-gray-600">Allocation</label>
                                    <div className="col-span-2 text-blue-500 font-medium">
                                        {getDuration()} <span className="text-gray-500 text-sm">Days</span>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                                    <button
                                        type="submit"
                                        className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-md font-medium transition-colors"
                                    >
                                        Submit
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium transition-colors"
                                    >
                                        Discard
                                    </button>
                                </div>

                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Leave;
