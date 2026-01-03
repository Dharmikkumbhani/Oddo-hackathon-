const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  employeeId: {
    type: DataTypes.STRING,
    unique: true,
  },
  role: {
    type: DataTypes.ENUM('Admin', 'Employee', 'HR'),
    defaultValue: 'Employee',
  },
  joiningYear: {
    type: DataTypes.INTEGER,
  },
  serialNumber: {
    type: DataTypes.INTEGER,
  },
  department: {
    type: DataTypes.STRING,
  },
  manager: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  },
  about: {
    type: DataTypes.TEXT,
  },
  interests: {
    type: DataTypes.JSONB, // Storing as JSON array of strings
    defaultValue: []
  },
  skills: {
    type: DataTypes.JSONB, // Storing as JSON array of strings
    defaultValue: []
  },
  certifications: {
    type: DataTypes.JSONB, // Storing as JSON array of objects/strings
    defaultValue: []
  },
  salaryDetails: {
    type: DataTypes.JSONB, // Storing detailed salary components
    defaultValue: {}
  }
});

module.exports = User;
