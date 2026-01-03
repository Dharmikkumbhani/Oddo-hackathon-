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

const LeaveRequest = require('../models/LeaveRequest');
const { Op } = require('sequelize');

const ImageKit = require("imagekit");

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_ENDPOINT_URL
});

exports.uploadProfilePicture = async (req, res) => {
    try {
        const userId = req.params.id === 'me' ? req.user.id : req.params.id;

        // Check permissions (Same logic as update)
        if (req.user.role !== 'Admin' && req.user.role !== 'HR' && parseInt(userId) !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileBuffer = req.file.buffer;
        const fileName = `profile-${userId}-${Date.now()}`;

        imagekit.upload({
            file: fileBuffer, //required
            fileName: fileName, //required
            folder: '/employee_profiles'
        }, async (error, result) => {
            if (error) {
                console.error("ImageKit Error:", error);
                return res.status(500).json({ message: "Image upload failed", error: error.message });
            }

            // Update user profile
            let user;
            // Determine which model to use based on the target user's role
            // But here we only have userId.
            // If the requester is editing their own profile ('me'), we know the role.
            // If editing someone else, it's likely an Employee.
            
            if (req.params.id === 'me') {
                 user = await findUserByRole(req.user.id, req.user.role);
            } else {
                 // Assuming we are editing an email employee
                 user = await Employee.findByPk(userId);
            }
            
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // Check if the model has the field (Admin/HR might not)
            if (user.dataValues.profilePicture === undefined && req.user.role !== 'Employee') {
                 // For now, simpler: Only Employees have profile pictures in this design?
                 // Or we need to add profilePicture to Admin/HR models too.
                 // Let's assume for now we only support Employee pictures as per instruction.
                 // But if I am an Admin, looking at my profile, and upload... it might fail if field missing.
                 
                 // However, let's stick to the most likely cause:
                 // The user says "photos become invisible". 
                 // If I am an Employee, I upload, it says success. 
                 // If the column didn't exist, it would 500.
                 // If it 200s, it thinks it saved.
            }
            
            user.profilePicture = result.url;
            await user.save();

            res.json({ message: 'Profile picture updated', url: result.url });
        });

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
            }, {
                model: LeaveRequest,
                required: false,
                where: {
                    status: 'Approved',
                    startDate: { [Op.lte]: today },
                    endDate: { [Op.gte]: today }
                },
                attributes: ['status']
            }]
        });

        const profiles = users.map(user => {
            const u = user.toJSON();
            const att = u.Attendances && u.Attendances[0];
            const leave = u.LeaveRequests && u.LeaveRequests[0];

            if (leave) {
                u.status = 'Leave';
            } else if (att) {
                u.status = att.status;
            } else {
                u.status = 'Absent';
            }

            delete u.Attendances;
            delete u.LeaveRequests;
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
            name, email, phone, location, about, interests, skills, certifications,
            jobPosition, loveJob,
            department, manager, salaryDetails, joiningYear, serialNumber, companyName, employeeId
        } = req.body;

        console.log(`[UPDATE PROFILE] User: ${user.id} Role: ${req.user.role}`);

        // Common Fields (Anyone with write access)
        if (email !== undefined) user.email = email;
        if (companyName !== undefined) user.companyName = companyName;
        if (phone !== undefined) user.phone = phone;
        if (location !== undefined) user.location = location;
        if (about !== undefined) user.about = about;
        if (interests !== undefined) user.interests = interests;
        
        // Personal Info
        if (req.body.dob !== undefined) user.dob = req.body.dob;
        if (req.body.address !== undefined) user.address = req.body.address;
        if (req.body.nationality !== undefined) user.nationality = req.body.nationality;
        if (req.body.personalEmail !== undefined) user.personalEmail = req.body.personalEmail;
        if (req.body.gender !== undefined) user.gender = req.body.gender;
        if (req.body.maritalStatus !== undefined) user.maritalStatus = req.body.maritalStatus;

        // Bank Info
        if (req.body.bankName !== undefined) user.bankName = req.body.bankName;
        if (req.body.bankAccount !== undefined) user.bankAccount = req.body.bankAccount;
        if (req.body.ifscCode !== undefined) user.ifscCode = req.body.ifscCode;
        if (req.body.panNo !== undefined) user.panNo = req.body.panNo;
        if (req.body.uanNo !== undefined) user.uanNo = req.body.uanNo;

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
