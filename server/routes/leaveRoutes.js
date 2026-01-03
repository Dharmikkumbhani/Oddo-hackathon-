const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { 
  applyLeave, 
  getMyLeaves, 
  getAllLeaves, 
  updateLeaveStatus 
} = require('../controllers/leaveController');

// Middleware to check if user is Admin or HR
const adminOrHR = (req, res, next) => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'HR')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as Admin or HR' });
    }
};

router.post('/', protect, applyLeave);
router.get('/my-leaves', protect, getMyLeaves);
router.get('/all', protect, adminOrHR, getAllLeaves); // Only Admin/HR
router.put('/:id/status', protect, adminOrHR, updateLeaveStatus); // Only Admin/HR

module.exports = router;
