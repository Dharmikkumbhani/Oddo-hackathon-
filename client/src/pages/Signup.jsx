import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Eye, EyeOff } from 'lucide-react';
import { createEmployee } from '../services/authService';
import logo from '../assets/dayflow-logo.png';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '',
    name: '',
    email: '',
    phone: '',
    role: 'Employee'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await createEmployee(formData);
      // Redirect to attendance page
      navigate('/attendance');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100 my-8"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="h-16 w-16 mb-4 rounded-full overflow-hidden shadow-lg border-2 border-white">
             <img src={logo} alt="Dayflow Logo" className="h-full w-full object-cover" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Dayflow</h2>
        <p className="text-gray-500 text-sm">Add New Employee</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <label className="block text-gray-700 text-sm font-semibold mb-1" htmlFor="companyName">
            Company Name
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              required
            />
            <button type="button" className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors" title="Upload Logo">
              <Upload size={20} />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-1" htmlFor="phone">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>



        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 border border-blue-200">
          <p className="font-semibold">Note:</p>
          <ul className="list-disc ml-4 mt-1 space-y-1">
            <li>Employee ID will be auto-generated based on the name and joining year.</li>
            <li>Default System Password: <span className="font-mono font-bold">12341234</span></li>
            <li>The employee can change their password after their first login.</li>
          </ul>
        </div>

        <button
          type="submit"
          className="w-full bg-[#E855E9] hover:bg-[#d04ad1] text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-purple-200 mt-4"
        >
          Add Employee
        </button>
      </form>

      <div className="mt-6 text-center">
        <button 
          onClick={() => navigate('/attendance')}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          Cancel / Back to Attendance
        </button>
      </div>
    </motion.div>
  );
};

export default Signup;
