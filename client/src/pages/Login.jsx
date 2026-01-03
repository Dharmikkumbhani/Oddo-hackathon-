import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginUser } from '../services/authService';
import logo from '../assets/logo.jpg';

const Login = () => {
  const [formData, setFormData] = useState({
    role: 'Employee', // Default
    identifier: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginUser(formData);
      window.location.href = '/attendance';
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100"
    >
      <div className="flex flex-col items-center mb-8">
        <div className="h-16 w-16 mb-4 rounded-full overflow-hidden shadow-lg border-2 border-white">
             <img src={logo} alt="Emplify Logo" className="h-full w-full object-cover" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Emplify</h2>
        <p className="text-gray-500 text-sm">HR Management System</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="role">
            Select Role
          </label>
          <div className="relative">
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white appearance-none cursor-pointer"
            >
              <option value="Employee">Employee</option>
              <option value="HR">HR Officer</option>
              <option value="Admin">Admin</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="identifier">
            Login Id / Email
          </label>
          <input
            type="text"
            id="identifier"
            name="identifier"
            value={formData.identifier}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            placeholder="Enter ID or Email"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            placeholder="Enter Password"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#E855E9] hover:bg-[#d04ad1] text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-purple-200"
        >
          SIGN IN
        </button>
      </form>

      <div className="mt-6 text-center">
        {/* Registration is now restricted to HR/Admin within the app */}
      </div>
    </motion.div>
  );
};

export default Login;
