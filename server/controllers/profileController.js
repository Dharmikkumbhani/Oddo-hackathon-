const Employee = require('../models/Employee');
const Admin = require('../models/Admin');
const HR = require('../models/HR');
const Attendance = require('../models/Attendance');

const findUserByRole = async (id, role) => {
    if (role === 'Admin') return await Admin.findByPk(id);
    if (role === 'HR') return await HR.findByPk(id);
    return await Employee.findByPk(id);
};

exports.getProfile = async (req, res) => {
    try {
        let user;
        const isMe = req.params.id === 'me';
        if (isMe) {
            user = await findUserByRole(req.user.id, req.user.role);
        } else {
            user = await Employee.findByPk(req.params.id);
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        let profileData = user.toJSON();

        // Security filtering
        if (req.user.role !== 'Admin' && (!isMe || req.user.role !== 'Employee')) {
            const isOwner = isMe || (req.user.id === user.id && req.user.role === 'Employee');
            if (!isOwner && req.user.role !== 'HR') {
                delete profileData.salaryDetails;
                delete profileData.yearlyWage;
            }
        }

        res.json(profileData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllProfiles = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const users = await Employee.findAll({
            attributes: ['id', 'name', 'email', 'department', 'location', 'phone', 'employeeId'],
            include: [{
                model: Attendance,
                required: false,
                where: { date: today },
                attributes: ['status']
            }]
        });

        const profiles = users.map(user => {
            const u = user.toJSON();
            const att = u.Attendances && u.Attendances[0];
            u.status = att ? att.status : 'Absent';
            delete u.Attendances;
            return u;
        });

        res.json(profiles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        let user;
        const isMe = req.params.id === 'me';

        if (isMe) {
            user = await findUserByRole(req.user.id, req.user.role);
        } else {
            user = await Employee.findByPk(req.params.id);
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update Permission Check:
        // Admin: Can update any profile
        // HR: Can update any profile? Or just Employees? Let's assume HR can update Employees.
        // User: Can update own profile

        const isOwner = (isMe || req.user.id === user.id);
        const isAdmin = req.user.role === 'Admin';
        const isHR = req.user.role === 'HR';

        if (!isAdmin && !isHR && !isOwner) {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }

        const {
            name, phone, location, about, interests, skills, certifications,
            jobPosition, loveJob,
            department, manager, salaryDetails, joiningYear, serialNumber, companyName, employeeId
        } = req.body;

        console.log(`[UPDATE PROFILE] User: ${user.id} Role: ${req.user.role}`);

        // Common Fields (Anyone with write access)
        if (phone !== undefined) user.phone = phone;
        if (location !== undefined) user.location = location;
        if (about !== undefined) user.about = about;
        if (interests !== undefined) user.interests = interests;

        // JSON Fields
        if (Array.isArray(skills)) {
            user.skills = skills;
            user.changed('skills', true);
        }

        if (Array.isArray(certifications)) {
            user.certifications = certifications;
            user.changed('certifications', true);
        }

        if (name !== undefined) user.name = name;
        if (jobPosition !== undefined) user.jobPosition = jobPosition;
        if (loveJob !== undefined) user.loveJob = loveJob;

        // Elevated Privileges (Admin or HR)
        if (isAdmin || isHR) {
            if (department !== undefined) user.department = department;
            if (manager !== undefined) user.manager = manager;

            if (salaryDetails !== undefined) {
                user.salaryDetails = salaryDetails;
                user.changed('salaryDetails', true);
            }
            if (joiningYear !== undefined) user.joiningYear = joiningYear;
            if (serialNumber !== undefined) user.serialNumber = serialNumber;
            if (companyName !== undefined) user.companyName = companyName;
            if (employeeId !== undefined) user.employeeId = employeeId;
        }

        await user.save();
        console.log('[UPDATE SUCCESS] User saved.');

        res.json(user);
    } catch (error) {
        console.error('[UPDATE ERROR]', error);
        res.status(500).json({ message: 'Server Error' });
    }
};
