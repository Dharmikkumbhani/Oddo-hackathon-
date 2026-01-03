import React from 'react';

const EmployeeDashboard = ({ user }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-600">
      <h2 className="text-2xl font-bold mb-4 text-green-700">Employee Dashboard</h2>
      <p className="mb-4">Welcome, {user?.name}. Track your daily work here.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-semibold">
        <div className="p-4 bg-green-50 rounded-lg text-green-700 cursor-pointer hover:bg-green-100">
          Mark Attendance
        </div>
        <div className="p-4 bg-green-50 rounded-lg text-green-700 cursor-pointer hover:bg-green-100">
          Apply Leave
        </div>
        <div className="p-4 bg-green-50 rounded-lg text-green-700 cursor-pointer hover:bg-green-100">
          View Salary Slip
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
