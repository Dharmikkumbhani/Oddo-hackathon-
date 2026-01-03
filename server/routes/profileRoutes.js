const express = require('express');
const multer = require('multer');
const { getProfile, updateProfile, getAllProfiles, uploadProfilePicture } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

// Multer Config
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/', protect, getAllProfiles);
router.get('/:id', protect, getProfile);
router.put('/:id', protect, updateProfile);
router.post('/:id/picture', protect, upload.single('image'), uploadProfilePicture);

module.exports = router;
