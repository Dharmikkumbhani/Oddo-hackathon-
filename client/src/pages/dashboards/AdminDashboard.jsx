import React from 'react';

const AdminDashboard = ({ user }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-purple-600">
      <h2 className="text-2xl font-bold mb-4 text-purple-700">Admin Dashboard</h2>
      <p className="mb-4">Welcome, {user?.name}. You have full access to the system.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-semibold">
        <div className="p-4 bg-purple-50 rounded-lg text-purple-700 cursor-pointer hover:bg-purple-100">
          Manage Employees
        </div>
        <div className="p-4 bg-purple-50 rounded-lg text-purple-700 cursor-pointer hover:bg-purple-100">
          Payroll Settings
        </div>
        <div className="p-4 bg-purple-50 rounded-lg text-purple-700 cursor-pointer hover:bg-purple-100">
          System Analytics
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
