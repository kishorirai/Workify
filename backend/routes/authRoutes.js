const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Student signup route
router.post('/signup', authController.signup);

// Student login route
router.post('/login', authController.login);

// Student logout route
router.post('/logout', authController.logout);

module.exports = router;