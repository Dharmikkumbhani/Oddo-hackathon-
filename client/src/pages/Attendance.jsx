import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { getAllProfiles } from '../services/profileService';
import { getCurrentUser } from '../services/authService';
import { Search, X, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

const Attendance = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const { isCheckedIn } = useOutletContext();
    const user = getCurrentUser();
    // Navbar, logout, toggleCheckIn handled by Layout

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
    }, []);

    const getRandomStatus = (empId) => {
        // Deterministic random so it doesn't flicker on re-render
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
            return isCheckedIn ? 'present' : 'absent';
        }
        return emp.status || getRandomStatus(emp.id);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'present': return 'bg-green-500';
            case 'leave': return 'bg-blue-400';
            case 'absent': return 'bg-yellow-400';
            default: return 'bg-gray-300';
        }
    };

    const Sidebar = () => (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Employee Details</h2>
                    <button onClick={() => setSelectedEmployee(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                        <X className="h-6 w-6 text-gray-500" />
                    </button>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4">
                        {selectedEmployee?.name?.charAt(0).toUpperCase()}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 text-center">{selectedEmployee?.name}</h3>
                    <p className="text-blue-600 font-medium">{selectedEmployee?.category || selectedEmployee?.role || 'Employee'}</p>
                </div>

                <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-3 text-gray-700 mb-2">
                            <Mail className="h-5 w-5 text-gray-400" />
                            <span className="font-medium">Email</span>
                        </div>
                        <p className="text-gray-900 ml-8 break-all">{selectedEmployee?.email}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-3 text-gray-700 mb-2">
                            <Phone className="h-5 w-5 text-gray-400" />
                            <span className="font-medium">Phone</span>
                        </div>
                        <p className="text-gray-900 ml-8">{selectedEmployee?.phone || 'N/A'}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-3 text-gray-700 mb-2">
                            <Briefcase className="h-5 w-5 text-gray-400" />
                            <span className="font-medium">Department</span>
                        </div>
                        <p className="text-gray-900 ml-8">{selectedEmployee?.department || 'General'}</p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl">
                        <div className="flex items-center gap-3 text-gray-700 mb-2">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <span className="font-medium">Location</span>
                        </div>
                        <p className="text-gray-900 ml-8">{selectedEmployee?.location || 'Remote'}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-down">
            {/* Search and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <button className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all w-full sm:w-auto">
                    NEW
                </button>

                <div className="relative w-full sm:w-96">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search employees..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow shadow-sm"
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
                            className="bg-white rounded-xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-gray-100 relative overflow-hidden group"
                        >
                            {/* Status Indicator */}
                            <div className={`absolute top-4 right-4 h-3 w-3 rounded-full ${getStatusColor(getStatusForEmployee(emp))} ring-2 ring-white z-10`}></div>

                            <div className="p-6 flex flex-col items-center">
                                <div className="h-20 w-20 rounded-full bg-gray-200 mb-4 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                                    {/* Avatar Placeholder */}
                                    <div className="h-full w-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-xl font-bold">
                                        {emp.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 text-center mb-1 group-hover:text-blue-600 transition-colors">{emp.name}</h3>
                                <p className="text-sm text-gray-500 text-center truncate w-full px-2">{emp.role || 'Employee'}</p>
                            </div>
                            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                                <span>{emp.department || 'General'}</span>
                                <span>{emp.employeeId || `EMP-${emp.id}`}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Details Sidebar (Backdrop and Panel) */}
            {selectedEmployee && (
                <>
                    <div
                        className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-40 transition-opacity"
                        onClick={() => setSelectedEmployee(null)}
                    ></div>
                    <Sidebar />
                </>
            )}
        </div>
    );
};

export default Attendance;
