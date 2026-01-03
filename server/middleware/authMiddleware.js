const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const HR = require('../models/HR');
const Employee = require('../models/Employee');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            let user;
            if (decoded.role === 'Admin') {
                user = await Admin.findByPk(decoded.id);
            } else if (decoded.role === 'HR') {
                user = await HR.findByPk(decoded.id);
            } else {
                user = await Employee.findByPk(decoded.id);
            }

            if (!user) {
                 return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Attach user and role to request
            req.user = user.toJSON(); // Convert to plain object
            req.user.role = decoded.role; // Ensure role is present

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
