const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Employee = sequelize.define('Employee', {
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
  // New Fields for Profile
  jobPosition: {
    type: DataTypes.STRING,
  },
  salaryDetails: {
    type: DataTypes.JSON, // Stores { monthlyWage, config: {}, computed: {} }
    defaultValue: {},
  },
  skills: {
    type: DataTypes.JSON, // Stores Array of strings
    defaultValue: [],
  },
  certifications: {
    type: DataTypes.JSON, // Stores Array of strings
    defaultValue: [],
  },
  interests: {
    type: DataTypes.TEXT, // Changed to TEXT as we are using a textarea in UI now
  },
  loveJob: {
    type: DataTypes.TEXT, // "What I love about my job"
  },
  // Existing fields
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
  paidLeaveBalance: {
    type: DataTypes.INTEGER,
    defaultValue: 24,
  },
  sickLeaveBalance: {
    type: DataTypes.INTEGER,
    defaultValue: 7,
  },
  // Personal Info
  profilePicture: { type: DataTypes.STRING }, // URL from ImageKit
  dob: { type: DataTypes.DATEONLY },
  gender: { type: DataTypes.STRING },
  maritalStatus: { type: DataTypes.STRING },
  nationality: { type: DataTypes.STRING },
  personalEmail: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING }, // Residing Address

  // Bank/Financial Details
  bankName: { type: DataTypes.STRING },
  bankAccount: { type: DataTypes.STRING },
  ifscCode: { type: DataTypes.STRING },
  panNo: { type: DataTypes.STRING },
  uanNo: { type: DataTypes.STRING },
});

module.exports = Employee;
