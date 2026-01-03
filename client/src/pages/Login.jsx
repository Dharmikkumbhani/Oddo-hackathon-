import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginUser } from '../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
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
      window.location.href = '/dashboard';
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
        <div className="w-48 h-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-500 text-sm font-medium mb-2">
          App/Web Logo
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
        <p className="text-gray-600 text-sm">
          Don't have an Account?{' '}
          <Link to="/signup" className="text-[#E855E9] font-semibold hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
