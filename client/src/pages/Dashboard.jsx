import React from 'react';
import { getCurrentUser, logout } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './dashboards/AdminDashboard';
import HRDashboard from './dashboards/HRDashboard';
import EmployeeDashboard from './dashboards/EmployeeDashboard';

const Dashboard = () => {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderDashboard = () => {
    switch (user?.role) {
      case 'Admin':
        return <AdminDashboard user={user} />;
      case 'HR':
        return <HRDashboard user={user} />;
      case 'Employee':
        return <EmployeeDashboard user={user} />;
      default:
        // Default to Employee view or a generic view if role is missing
        return <EmployeeDashboard user={user} />;
    }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Dayflow</h1>
        <div className="flex gap-4">
             <button
              onClick={() => navigate('/profile')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              My Profile
            </button>
            <button 
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
            >
              Logout
            </button>
        </div>
      </div>
      
      {renderDashboard()}

      <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-2">My Info</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-100 rounded">
                <span className="text-gray-500 text-xs uppercase tracking-wider">Employee ID</span>
                <p className="font-mono font-bold">{user?.employeeId || 'N/A'}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded">
                <span className="text-gray-500 text-xs uppercase tracking-wider">Role</span>
                <p className="font-bold">{user?.role || 'Guest'}</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
