import React from 'react';

const HRDashboard = ({ user }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-600">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">HR Dashboard</h2>
      <p className="mb-4">Welcome, {user?.name}. Manage leaves and recruitment here.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-semibold">
        <div className="p-4 bg-blue-50 rounded-lg text-blue-700 cursor-pointer hover:bg-blue-100">
          Pending Leave Requests
        </div>
        <div className="p-4 bg-blue-50 rounded-lg text-blue-700 cursor-pointer hover:bg-blue-100">
          Attendance Reports
        </div>
        <div className="p-4 bg-blue-50 rounded-lg text-blue-700 cursor-pointer hover:bg-blue-100">
          Onboarding
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
