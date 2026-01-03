import React from 'react';
import { getCurrentUser, logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button 
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name || 'User'}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">Employee ID</p>
            <p className="font-mono font-bold text-lg">{user?.employeeId || 'N/A'}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">Role</p>
            <p className="font-bold text-lg">{user?.role || 'Guest'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
