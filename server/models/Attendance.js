const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Employee = require('./Employee');

const Attendance = sequelize.define('Attendance', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    employeeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Employee,
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATEONLY, // YYYY-MM-DD
        allowNull: false,
    },
    checkIn: {
        type: DataTypes.DATE, // Full timestamp
    },
    checkOut: {
        type: DataTypes.DATE, // Full timestamp
    },
    status: {
        type: DataTypes.ENUM('Present', 'Absent', 'Leave'),
        defaultValue: 'Absent'
    },
    workHours: {
        type: DataTypes.FLOAT, // Hours as decimal
        defaultValue: 0
    },
    extraHours: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    }
});

// Associations
Employee.hasMany(Attendance, { foreignKey: 'employeeId' });
Attendance.belongsTo(Employee, { foreignKey: 'employeeId' });

module.exports = Attendance;
