const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');

// These routes assume you have session-based auth, e.g., Passport.js
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  if (req.user) return next();
  res.status(401).json({ success: false, message: 'Not authenticated' });
}

router.get('/my', ensureAuthenticated, applicationController.listMyApplications);
router.post('/:jobId/apply', ensureAuthenticated, applicationController.applyToJob);

module.exports = router;