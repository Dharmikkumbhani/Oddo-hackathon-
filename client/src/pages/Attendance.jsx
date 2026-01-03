import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { getAllProfiles } from '../services/profileService';
import { getCurrentUser } from '../services/authService';
import { Search, X, Mail, Phone, MapPin, Briefcase, Plane } from 'lucide-react';

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const { isCheckedIn } = useOutletContext();
    const user = getCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await getAllProfiles();
                setEmployees(data);
            } catch (error) {
                console.error("Failed to fetch employees", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();

        const handleUpdate = () => fetchEmployees();
        window.addEventListener('attendanceUpdated', handleUpdate);
        return () => window.removeEventListener('attendanceUpdated', handleUpdate);
    }, []);

    const getRandomStatus = (empId) => {
        const statuses = ['present', 'absent', 'leave'];
        return statuses[empId % statuses.length];
    };

    const handleCardClick = (employee) => {
        setSelectedEmployee(employee);
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusForEmployee = (emp) => {
        if (user && emp.email === user.email) {
            return isCheckedIn ? 'Present' : (emp.status || 'Absent');
        }
        return emp.status || 'Absent';
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'bg-green-500';
            case 'Leave': return 'bg-blue-400';
            case 'Absent': return 'bg-yellow-400';
            default: return 'bg-yellow-400';
        }
    };

    const Sidebar = () => (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto border border-slate-100 animate-fade-in-up">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold text-slate-800">Employee Details</h2>
                        <button onClick={() => setSelectedEmployee(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                            <X className="h-5 w-5 text-slate-500" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center mb-8">
                        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-blue-200 mb-4 ring-4 ring-blue-50">
                            {selectedEmployee?.name?.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 text-center tracking-tight mb-1">{selectedEmployee?.name}</h3>
                        <p className="text-blue-600 font-medium bg-blue-50 px-4 py-1 rounded-full text-sm">{selectedEmployee?.role || 'Employee'}</p>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="group md:col-span-2">
                                <div className="flex items-center gap-2 text-slate-500 mb-1 pl-1">
                                    <Mail className="h-3.5 w-3.5" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Email</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-800 font-medium break-all text-sm">
                                    {selectedEmployee?.email}
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex items-center gap-2 text-slate-500 mb-1 pl-1">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Phone</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-800 font-medium text-sm">
                                    {selectedEmployee?.phone || 'N/A'}
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex items-center gap-2 text-slate-500 mb-1 pl-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Location</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-800 font-medium text-sm">
                                    {selectedEmployee?.location || 'Remote'}
                                </div>
                            </div>
                            
                            <div className="group md:col-span-2">
                                <div className="flex items-center gap-2 text-slate-500 mb-1 pl-1">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    <span className="text-xs font-bold uppercase tracking-wider">Department</span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-800 font-medium text-sm">
                                    {selectedEmployee?.department || 'General'}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate(`/profile/${selectedEmployee.id}`)}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-200 transition-all transform hover:-translate-y-0.5 mt-2"
                        >
                            View Full Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-down">
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                {(user?.role === 'Admin' || user?.role === 'HR') && (
                    <button 
                        onClick={() => navigate('/signup')} 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold shadow-md shadow-blue-200 hover:shadow-lg transition-all w-full sm:w-auto text-sm"
                    >
                        + Add New Employee
                    </button>
                )}

                <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 sm:text-sm transition-all shadow-sm text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                /* Employee Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredEmployees.map((emp) => (
                        <div
                            key={emp.id}
                            onClick={() => handleCardClick(emp)}
                            className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100 relative overflow-hidden group"
                        >
                            {/* Status Indicator */}
                            <div className="absolute top-4 right-4 z-10">
                                {getStatusForEmployee(emp) === 'Leave' ? (
                                     <div className="bg-blue-100 p-1.5 rounded-full">
                                        <Plane className="h-3.5 w-3.5 text-blue-600" />
                                     </div>
                                ) : (
                                    <div className={`h-3 w-3 rounded-full ${getStatusColor(getStatusForEmployee(emp))} ring-4 ring-white shadow-sm`}></div>
                                )}
                            </div>

                            <div className="p-6 flex flex-col items-center pt-8">
                                <div className="h-20 w-20 rounded-full bg-slate-50 mb-4 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300 ring-4 ring-slate-50">
                                    {/* Avatar Placeholder */}
                                    <div className="h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                                        {emp.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 text-center mb-1 group-hover:text-blue-600 transition-colors tracking-tight">{emp.name}</h3>
                                <p className="text-sm text-slate-500 text-center w-full px-2 font-medium">{emp.role || 'Employee'}</p>
                            </div>
                            <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
                                <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {emp.department || 'General'}</span>
                                <span className="bg-white px-2 py-1 rounded border border-slate-100 text-slate-400">{emp.employeeId || 'ID'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Details Sidebar (Backdrop and Panel) */}
            {selectedEmployee && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity"
                        onClick={() => setSelectedEmployee(null)}
                    ></div>
                    <Sidebar />
                </>
            )}
        </div>
    );
};

export default Attendance;
