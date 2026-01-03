import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Circle } from 'lucide-react';

const Navbar = ({ user, handleLogout, isCheckedIn, toggleCheckIn }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Determine active tab
    const isActive = (path) => location.pathname === path;

    return (
        <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left: Company Logo */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <span className="font-bold text-xl text-gray-800 tracking-tight">Dayflow</span>
                    </div>

                    {/* Center: Navigation Links */}
                    <div className="hidden md:flex space-x-8">
                        <button
                            onClick={() => navigate('/attendance')}
                            className={`${isActive('/attendance') || isActive('/dashboard')
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                        >
                            Employees
                        </button>
                        <button
                            onClick={() => navigate('/attendance-records')} // Placeholder
                            className={`${isActive('/attendance-records')
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                        >
                            Attendance
                        </button>
                        <button
                            onClick={() => navigate('/leaves')}
                            className={`${isActive('/leaves')
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                        >
                            Time Off
                        </button>
                    </div>

                    {/* Right: Status & Profile */}
                    <div className="flex items-center space-x-6">
                        {/* Check-in Indicator */}
                        <div className="flex items-center" title={isCheckedIn ? "Checked In" : "Click to Check In"}>
                            <button onClick={toggleCheckIn} className="focus:outline-none transition-transform active:scale-95 p-1 rounded-full hover:bg-gray-50">
                                <Circle
                                    className={`h-4 w-4 fill-current ${isCheckedIn ? 'text-green-500 drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]' : 'text-red-500 drop-shadow-[0_0_4px_rgba(239,68,68,0.6)]'}`}
                                />
                            </button>
                        </div>

                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 focus:outline-none"
                            >
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md transform hover:scale-105 transition-all">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                            </button>

                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-2xl py-2 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-200 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-xs text-gray-500 uppercase tracking-wider">Signed in as</p>
                                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                    </div>

                                    <div className="px-4 py-3">
                                        <button
                                            onClick={toggleCheckIn}
                                            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold transition-colors ${isCheckedIn ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                        >
                                            {isCheckedIn ? 'Check Out' : 'Check In ->'}
                                        </button>
                                        <div className="mt-2 text-center">
                                            <p className="text-xs text-gray-400">Since 09:00 AM</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 my-1"></div>

                                    <button
                                        onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                                    >
                                        <User className="h-4 w-4 mr-3 text-gray-400" /> My Profile
                                    </button>
                                    <button
                                        onClick={() => { handleLogout(); setShowProfileMenu(false); }}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                                    >
                                        <LogOut className="h-4 w-4 mr-3 text-red-400" /> Log Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
