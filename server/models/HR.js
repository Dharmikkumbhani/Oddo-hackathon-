const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const HR = sequelize.define('HR', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  profilePicture: {
    type: DataTypes.STRING, 
    allowNull: true // URL from ImageKit
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
});

module.exports = HR;
