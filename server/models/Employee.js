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
  // Removed 'role' field as table implies role
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
  }
});

module.exports = Employee;
