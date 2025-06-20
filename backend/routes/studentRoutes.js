const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const { imageUpload } = require('../middleware/uploadMiddleware');

// Profile routes using /me (token-based auth)
router.get('/me', authMiddleware, studentController.getOwnProfile);
router.put('/me', authMiddleware, studentController.updateOwnProfile);
router.post('/me/profile-pic', authMiddleware, imageUpload.single('profilePic'), studentController.uploadProfilePic);
router.get('/me/profile-pic', authMiddleware, studentController.getProfilePic);

module.exports = router;
