const User = require('../models/User');

// Get Profile
// GET /api/profile/:id (or /me)
exports.getProfile = async (req, res) => {
    try {
        const userId = req.params.id === 'me' ? req.user.id : req.params.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Security: Only Admin can see salaryDetails. 
        // If strict compliance with "Salary Info tab Should only be visible to Admin":
        let profileData = user.toJSON();

        if (req.user.role !== 'Admin') {
            delete profileData.salaryDetails;
            delete profileData.yearlyWage;
            // Also potentially hide other sensitive fields if defined in future
        }

        res.json(profileData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update Profile
// PUT /api/profile/:id
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.params.id === 'me' ? req.user.id : req.params.id;
        let user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check permissions
        // Admin can update anyone. User can only update themselves.
        if (req.user.role !== 'Admin' && req.user.id !== user.id) {
            return res.status(403).json({ message: 'Not authorized to update this profile' });
        }

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

        // fields allowed for everyone to update on their own profile
        user.phone = phone || user.phone;
        user.location = location || user.location;
        user.about = about || user.about;
        user.interests = interests || user.interests;
        user.skills = skills || user.skills;
        user.certifications = certifications || user.certifications;
        user.name = name || user.name; // Usually name is editable?

        // Admin only updates
        if (req.user.role === 'Admin') {
            if (department) user.department = department;
            if (manager) user.manager = manager;
            if (role) user.role = role;
            if (salaryDetails) user.salaryDetails = salaryDetails;
            if (joiningYear) user.joiningYear = joiningYear;
            if (serialNumber) user.serialNumber = serialNumber;
            if (companyName) user.companyName = companyName;
            if (employeeId) user.employeeId = employeeId;
            // Handle other fields like email if needed, but email usually requires verification
        }

        await user.save();

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
