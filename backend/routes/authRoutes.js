const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected
router.get('/profile', authController.protect, authController.getProfile);

module.exports = router;
