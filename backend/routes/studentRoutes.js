const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const { imageUpload } = require('../middleware/uploadMiddleware');

// Get student profile
router.get('/:studentId', authMiddleware, studentController.getStudentProfile);

// Update student profile
router.put('/:studentId', authMiddleware, studentController.updateStudentProfile);

// Upload profile picture (memory upload)
router.post(
  '/:studentId/profile-pic',
  authMiddleware,
  imageUpload.single('profilePic'),
  studentController.uploadProfilePic
);

// Get profile picture
router.get('/:studentId/profile-pic', authMiddleware, studentController.getProfilePic);

module.exports = router;