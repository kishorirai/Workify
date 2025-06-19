const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware');

// Student gives feedback
router.post('/give', authMiddleware, feedbackController.giveFeedback);

// Student fetches feedback given
router.get('/given', authMiddleware, feedbackController.getGivenFeedback);

// Student fetches feedback received
router.get('/received', authMiddleware, feedbackController.getReceivedFeedback);

// Edit feedback (PATCH)
router.patch('/given/:id', authMiddleware, feedbackController.editFeedback);

// Delete feedback (DELETE)
router.delete('/given/:id', authMiddleware, feedbackController.deleteFeedback);

module.exports = router;