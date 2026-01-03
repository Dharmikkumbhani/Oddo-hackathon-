import React, { useState, useEffect } from 'react';
import { getAttendance } from '../services/attendanceService';
import { getCurrentUser } from '../services/authService';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AttendanceRecords = () => {
    const user = getCurrentUser();
    const isAdmin = user?.role === 'Admin' || user?.role === 'HR';
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    // Admin state: Day view
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Employee state: Month view
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    useEffect(() => {
        fetchRecords();

        // Listen for Navbar toggle
        const handleUpdate = () => fetchRecords();
        window.addEventListener('attendanceUpdated', handleUpdate);
        return () => window.removeEventListener('attendanceUpdated', handleUpdate);
    }, [selectedDate, selectedMonth, isAdmin]);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            let params = {};

            if (isAdmin) {
                // Fetch for specific date
                params.date = selectedDate.toISOString().split('T')[0];
            } else {
                // Fetch for specific month
                const yyyy = selectedMonth.getFullYear();
                const mm = String(selectedMonth.getMonth() + 1).padStart(2, '0');
                params.month = `${yyyy}-${mm}`;
            }

            const data = await getAttendance(params);
            setRecords(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Handlers for date nav
    const prevDate = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() - 1);
        setSelectedDate(d);
    };
    const nextDate = () => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + 1);
        setSelectedDate(d);
    };

    const prevMonth = () => {
        const d = new Date(selectedMonth);
        d.setMonth(d.getMonth() - 1);
        setSelectedMonth(d);
    };
    const nextMonth = () => {
        const d = new Date(selectedMonth);
        d.setMonth(d.getMonth() + 1);
        setSelectedMonth(d);
    };

    const formatDate = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    const formatMonth = (d) => d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

    // Calculate Stats for Employee View
    const getStats = () => {
        const total = records.length; // Approximate working days based on records found
        const present = records.filter(r => r.status === 'Present').length;
        const leaves = records.filter(r => r.status === 'Leave').length;
        return { total, present, leaves };
    };

    const stats = getStats();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-down">
            {/* Header / Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-800">Attendance Log</h2>
                </div>

                <div className="flex items-center bg-gray-50 rounded-lg p-1 border border-gray-200">
                    <button onClick={isAdmin ? prevDate : prevMonth} className="p-2 hover:bg-white rounded shadow-sm transition"><ChevronLeft size={20} /></button>
                    <div className="px-4 font-semibold w-56 text-center select-none">
                        {isAdmin ? formatDate(selectedDate) : formatMonth(selectedMonth)}
                    </div>
                    <button onClick={isAdmin ? nextDate : nextMonth} className="p-2 hover:bg-white rounded shadow-sm transition"><ChevronRight size={20} /></button>
                </div>
            </div>

            {/* Stats (Employee Only) */}
            {!isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium">Total Days Recorded</p>
                        <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium">Days Present</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">{stats.present}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-sm font-medium">Leaves Taken</p>
                        <p className="text-3xl font-bold text-red-500 mt-2">{stats.leaves}</p>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Work Hours</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extra Hours</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center text-gray-500">Loading...</td></tr>
                        ) : records.map((record) => (
                            <tr key={record.id} className="hover:bg-gray-50 transition">
                                {isAdmin && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs mr-3">
                                                {record.Employee?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{record.Employee?.name || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{record.Employee?.department || ''}</div>
                                            </div>
                                        </div>
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {new Date(record.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm
                                        ${record.status === 'Present' ? 'bg-green-100 text-green-700 border border-green-200' :
                                          record.status === 'Leave' ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' :
                                          record.status === 'Holiday' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                                          record.status === 'Absent' ? 'bg-red-100 text-red-700 border border-red-200' :
                                          record.status === 'Half-day' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                          'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                                        {record.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                    {record.workHours || '0'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                    {record.extraHours || '0'}
                                </td>
                            </tr>
                        ))}
                        {!loading && records.length === 0 && (
                            <tr>
                                <td colSpan={isAdmin ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                                    No attendance records found for this period.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AttendanceRecords;
