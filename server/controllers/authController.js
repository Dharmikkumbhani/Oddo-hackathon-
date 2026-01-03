const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { Op } = require('sequelize');

const generateEmployeeID = async (companyName, fullName, year) => {
  // 1. Company Initials (First 2 letters of company name or initials of words)
  let companyInitials = companyName.substring(0, 2).toUpperCase();
  const words = companyName.split(' ');
  if (words.length > 1) {
      companyInitials = (words[0][0] + words[1][0]).toUpperCase();
  }

  // 2. Name Initials (First 2 letters of First Name + First 2 letters of Last Name)
  // Logic: "JODO -> First two letters of the employee's first name and last name"
  // Example: John Doe -> JO + DO
  let nameInitials = "XX";
  const nameParts = fullName.trim().split(' ');
  if (nameParts.length >= 2) {
      const first = nameParts[0].substring(0, 2).toUpperCase();
      const last = nameParts[nameParts.length - 1].substring(0, 2).toUpperCase();
      nameInitials = first + last;
  } else if (nameParts.length === 1) {
       nameInitials = nameParts[0].substring(0, 2).toUpperCase() + "XX"; // Fallback
  }

  // 3. Serial Number
  // Count users in this company with this joining year
  const count = await User.count({
      where: {
          companyName: companyName,
          joiningYear: year
      }
  });
  const serial = count + 1;
  const serialStr = String(serial).padStart(4, '0');

  return {
      fullId: `${companyInitials}${nameInitials}${year}${serialStr}`,
      serial: serial
  };
};

// Register (Sign Up)
exports.register = async (req, res) => {
  try {
    const { companyName, name, email, phone, password, role } = req.body;

    // Check if user exists
    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate Employee ID
    const year = new Date().getFullYear();
    const { fullId, serial } = await generateEmployeeID(companyName, name, year);

    // Initial user is Admin if they provide CompanyName (Assumption for signup flow)
    // Or we rely on 'role' field passed from frontend. 
    // The prompt says "Sign Up" page -> HR Officer can register new user? 
    // The prompt image says "Sign Up Page" -> Company Name. This implies creating a NEW Company Account (Admin).
    
    user = await User.create({
      companyName,
      name,
      email,
      phone,
      password: hashedPassword,
      employeeId: fullId,
      role: role || 'Admin', // Default to Admin for this signup flow
      joiningYear: year,
      serialNumber: serial
    });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Login (Sign In)
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Identifier can be Email or EmployeeID
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { employeeId: identifier }
        ]
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.employeeId,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
