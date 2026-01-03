const express = require('express');
const { getProfile, updateProfile, getAllProfiles } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/', protect, getAllProfiles);
router.get('/:id', protect, getProfile);
router.put('/:id', protect, updateProfile);

module.exports = router;
