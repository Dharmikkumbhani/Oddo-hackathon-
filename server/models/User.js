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
  }
});

module.exports = User;
