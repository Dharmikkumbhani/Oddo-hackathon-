const express = require('express');
const { checkIn, checkOut, getAttendance, getTodayStatus } = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/checkin', protect, checkIn);
router.post('/checkout', protect, checkOut);
router.get('/', protect, getAttendance);
router.get('/status', protect, getTodayStatus);

module.exports = router;
