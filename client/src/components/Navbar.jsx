import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 px-8 py-3 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-8">
                <div className="text-xl font-bold font-serif text-gray-800">Company Logo</div>
                <div className="hidden md:flex gap-6 text-gray-600 font-medium">
                    <a href="#" className="hover:text-black">Employees</a>
                    <a href="#" className="hover:text-black">Attendance</a>
                    <a href="#" className="hover:text-black">Time Off</a>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full bg-red-500"></div>
                <button
                    onClick={handleLogout}
                    className="w-8 h-8 rounded bg-blue-300 hover:bg-red-400 transition-colors"
                    title="Logout"
                ></button>
            </div>
        </nav>
    );
};

export default Navbar;
