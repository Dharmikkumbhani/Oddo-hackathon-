const LeaveRequest = require('../models/LeaveRequest');
const Employee = require('../models/Employee');

// Apply for Leave
const applyLeave = async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employeeId = req.user.id; // User ID from auth middleware

    // Calculate days count
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leave = await LeaveRequest.create({
      employeeId,
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason
    });

    res.status(201).json({ message: 'Leave request submitted successfully', leave });
  } catch (error) {
    console.error('Apply Leave Error:', error);
    res.status(500).json({ message: 'Server error while applying for leave' });
  }
};

// Get My Leaves (Employee)
const getMyLeaves = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const leaves = await LeaveRequest.findAll({
      where: { employeeId },
      order: [['createdAt', 'DESC']]
    });
    res.json(leaves);
  } catch (error) {
    console.error('Get My Leaves Error:', error);
    res.status(500).json({ message: 'Server error retrieving leaves' });
  }
};

// Get All Leaves (Admin/HR)
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.findAll({
      include: [{
        model: Employee,
        attributes: ['name', 'department', 'employeeId']
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(leaves);
  } catch (error) {
    console.error('Get All Leaves Error:', error);
    res.status(500).json({ message: 'Server error retrieving all leaves' });
  }
};

// Update Leave Status (Admin/HR)
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    const leave = await LeaveRequest.findByPk(id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Logic to update leave balance if approved
    if (status === 'Approved' && leave.status !== 'Approved') {
      const employee = await Employee.findByPk(leave.employeeId);

      if (employee) {
        const daysToDeduct = leave.daysCount;

        if (leave.leaveType === 'Paid Time Off') {
          const currentBalance = employee.paidLeaveBalance !== null ? employee.paidLeaveBalance : 24;
          employee.paidLeaveBalance = currentBalance - daysToDeduct;
        } else if (leave.leaveType === 'Sick Leave') {
          const currentBalance = employee.sickLeaveBalance !== null ? employee.sickLeaveBalance : 7;
          employee.sickLeaveBalance = currentBalance - daysToDeduct;
        }
        // Unpaid Leave doesn't affect balances

        await employee.save();
      }
    }

    leave.status = status;
    leave.adminComment = adminComment;
    await leave.save();

    res.json({ message: `Leave request ${status}`, leave });
  } catch (error) {
    console.error('Update Leave Status Error:', error);
    res.status(500).json({ message: 'Server error updating leave status' });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
};
