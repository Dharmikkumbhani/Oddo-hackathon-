const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const HR = require('../models/HR');
const Employee = require('../models/Employee');
const { Op } = require('sequelize');

const generateEmployeeID = async (companyName, fullName, year) => {
  // 1. Company Initials
  let companyInitials = companyName.substring(0, 2).toUpperCase();
  const words = companyName.split(' ');
  if (words.length > 1) {
      companyInitials = (words[0][0] + words[1][0]).toUpperCase();
  }

  // 2. Name Initials
  let nameInitials = "XX";
  const nameParts = fullName.trim().split(' ');
  if (nameParts.length >= 2) {
      const first = nameParts[0].substring(0, 2).toUpperCase();
      const last = nameParts[nameParts.length - 1].substring(0, 2).toUpperCase();
      nameInitials = first + last;
  } else if (nameParts.length === 1) {
       nameInitials = nameParts[0].substring(0, 2).toUpperCase() + "XX";
  }

  // 3. Serial Number
  const count = await Employee.count({
      where: {
          companyName: companyName,
          joiningYear: year
      }
  });
  const serial = count + 1;
  const serialStr = String(serial).padStart(4, '0');

  return {
      fullId: `${nameInitials}${year}${serialStr}`,
      serial: serial
  };
};

// Register (Creates a new Employee)
exports.register = async (req, res) => {
  try {
    const { companyName, name, email, phone, password } = req.body;
    // NOTE: 'role' is ignored here because Sign Up is strictly for Employees now.

    // Check if employee exists
    let employee = await Employee.findOne({ where: { email } });
    if (employee) {
      return res.status(400).json({ message: 'Employee already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const year = new Date().getFullYear();
    const { fullId, serial } = await generateEmployeeID(companyName, name, year);

    employee = await Employee.create({
      companyName,
      name,
      email,
      phone,
      password: hashedPassword,
      employeeId: fullId,
      joiningYear: year,
      serialNumber: serial
    });

    // Automatically log them in as Employee
    const token = jwt.sign({ id: employee.id, role: 'Employee' }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({
      token,
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        role: 'Employee'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Login (Handles Admin, HR, Employee)
exports.login = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;
    console.log(`Login Attempt: Role=${role}, Identifier=${identifier}`);

    let user;
    let dbRole = role;

    if (role === 'Admin') {
       user = await Admin.findOne({ where: { username: identifier } });
    } else if (role === 'HR') {
       user = await HR.findOne({ where: { username: identifier } });
    } else {
       // Employee: identifier can be Email or EmployeeID
       dbRole = 'Employee';
       user = await Employee.findOne({
          where: {
            [Op.or]: [
              { email: identifier },
              { employeeId: identifier }
            ]
          }
       });
    }

    if (!user) {
      console.log('❌ User not found in database');
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('❌ Password mismatch');
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    console.log('✅ Login Successful');
    const token = jwt.sign({ id: user.id, role: dbRole }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name || user.username, // Admin/HR have username, Employee has name
        email: user.email || user.username,
        employeeId: user.employeeId || 'N/A',
        role: dbRole
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
