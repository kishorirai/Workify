const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const authMiddleware = require('../middleware/authMiddleware');

//  Get ALL their interviews
router.get('/my', authMiddleware, interviewController.getMyInterviews);


//Preparation progress 
router.patch('/:id/preparation-progress', authMiddleware, interviewController.updatePreparationProgress);

module.exports = router;