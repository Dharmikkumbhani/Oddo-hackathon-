const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { Op } = require('sequelize');

// Check In
exports.checkIn = async (req, res) => {
    try {
        const userId = req.user.id;
        const date = new Date().toISOString().split('T')[0];

        // Check if already checked in
        const existing = await Attendance.findOne({
            where: { employeeId: userId, date }
        });

        if (existing) {
            return res.status(400).json({ message: 'Already checked in for today' });
        }

        const attendance = await Attendance.create({
            employeeId: userId,
            date,
            checkIn: new Date(),
            status: 'Present'
        });

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Check Out
exports.checkOut = async (req, res) => {
    try {
        const userId = req.user.id;
        const date = new Date().toISOString().split('T')[0];

        const attendance = await Attendance.findOne({
            where: { employeeId: userId, date }
        });

        if (!attendance) {
            return res.status(400).json({ message: 'Not checked in' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out' });
        }

        const checkOutTime = new Date();
        attendance.checkOut = checkOutTime;

        // Calculate hours
        const diffMs = checkOutTime - new Date(attendance.checkIn);
        const hours = diffMs / (1000 * 60 * 60);
        attendance.workHours = parseFloat(hours.toFixed(2));

        // Assuming 9 hours standard
        if (hours >= 9) {
            attendance.extraHours = parseFloat((hours - 9).toFixed(2));
        }
        else{
            attendance.extraHours = 0;  
        }
        await attendance.save();

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Attendance Records
exports.getAttendance = async (req, res) => {
    try {
        const { date, month, employeeId } = req.query;
        let where = {};

        // Role based filtering
        if (req.user.role === 'Employee') {
            where.employeeId = req.user.id;
            // Employees can see their own history
        } else {
            // Admin/HR
            if (employeeId) where.employeeId = employeeId;
        }

        // Date filtering
        if (date) {
            where.date = date;
        } else if (month) {
            // month in '2025-10' format
            const startDate = new Date(`${month}-01`);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
            where.date = {
                [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]
            };
        }

        const attendance = await Attendance.findAll({
            where,
            include: [{
                model: Employee,
                attributes: ['name', 'employeeId', 'department']
            }],
            order: [['date', 'DESC']]
        });

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get Today's Status (for Navbar)
exports.getTodayStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const date = new Date().toISOString().split('T')[0];

        const attendance = await Attendance.findOne({
            where: { employeeId: userId, date }
        });

        if (!attendance) {
            return res.json({ status: 'Absent', checkIn: null, checkOut: null });
        }

        res.json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
