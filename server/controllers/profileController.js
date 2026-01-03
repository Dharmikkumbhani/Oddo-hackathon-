const Employee = require('../models/Employee');
const Admin = require('../models/Admin');
const HR = require('../models/HR');
const Attendance = require('../models/Attendance');

// Helper to find user by ID and Role
const findUserByRole = async (id, role) => {
    if (role === 'Admin') return await Admin.findByPk(id);
    if (role === 'HR') return await HR.findByPk(id);
    return await Employee.findByPk(id);
};

// Get Profile
// GET /api/profile/:id (or /me)
exports.getProfile = async (req, res) => {
    try {
        let user;
        const isMe = req.params.id === 'me';

        if (isMe) {
            // Use logged-in user's role
            user = await findUserByRole(req.user.id, req.user.role);
        } else {
            // If viewing someone else, we assume it's an Employee profile
            // (Admins/HRs viewing employees)
            user = await Employee.findByPk(req.params.id);
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let profileData = user.toJSON();
        // If retrieving an Employee profile (either by Me or by ID)
        // Check visibility rules
        // Admin sees everything.
        // Owner sees everything.
        // Others might see limited data (e.g. HR sees non-salary?)

        // Simple check: is this an Employee object? (It has 'email', 'name', etc.)
        // Admin/HR objects are simple.

        if (req.user.role !== 'Admin' && (!isMe || req.user.role !== 'Employee')) {
            // Hide salary from non-admins (unless it's their own profile?)
            // Actually, usually Employees can see their OWN salary.
            // Other employees viewing this profile? Not allowed usually.

            // Logic:
            // If Viewer is Admin: See All.
            // If Viewer is Owner (Me): See All.
            // If Viewer is HR: See Most (Maybe hide salary if policy says so, but let's allow for now)
            // If Viewer is unrelated Employee: Hide Salary.

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


// Get All Profiles
// GET /api/profile
// Get All Profiles
// GET /api/profile
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

        // Flatten status
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

// Update Profile
// PUT /api/profile/:id
exports.updateProfile = async (req, res) => {
    try {
        let user;
        const isMe = req.params.id === 'me';

        if (isMe) {
            user = await findUserByRole(req.user.id, req.user.role);
            // Since Admin/HR models are simple, we probably only update Employee profiles here.
            // But let's allow updating what exists.
        } else {
            user = await Employee.findByPk(req.params.id);
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check permissions
        // Admin can update anyone. User can only update themselves.
        if (req.user.role !== 'Admin' && (!isMe || req.user.id !== user.id)) {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }

        // If it's an Admin/HR account, they only have username/password, so most of these fields won't apply.
        // We will just try to update fields if they exist on the body.

        // Only Employee model has these fields clearly defined in our setup.
        // We can just iterate allowed fields.

        const {
            name,
            phone,
            location,
            about,
            interests,
            skills,
            certifications,
            // Admin only fields
            department,
            manager,
            role,
            salaryDetails,
            joiningYear,
            serialNumber,
            companyName,
            employeeId
        } = req.body;

        // Generic updates (if model supports them)
        if (phone !== undefined) user.phone = phone;
        if (location !== undefined) user.location = location;
        if (about !== undefined) user.about = about;
        if (interests !== undefined) user.interests = interests;
        if (skills !== undefined) user.skills = skills;
        if (certifications !== undefined) user.certifications = certifications;
        if (name !== undefined) user.name = name;

        // Admin only updates
        if (req.user.role === 'Admin') {
            if (department !== undefined) user.department = department;
            if (manager !== undefined) user.manager = manager;
            // role update is tricky since we split tables. skipping for now.
            if (salaryDetails !== undefined) user.salaryDetails = salaryDetails;
            if (joiningYear !== undefined) user.joiningYear = joiningYear;
            if (serialNumber !== undefined) user.serialNumber = serialNumber;
            if (companyName !== undefined) user.companyName = companyName;
            if (employeeId !== undefined) user.employeeId = employeeId;
        }

        await user.save();

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
