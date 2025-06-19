const Application = require('../models/Application');
const Job = require('../models/Job');

// List student's applications
exports.listMyApplications = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ success: false, message: 'Not logged in' });
    const studentId = req.user._id;
    const applications = await Application.find({ student: studentId })
      .sort({ appliedDate: -1 })
      .populate('job');
    res.json({ success: true, applications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Apply to a job
exports.applyToJob = async (req, res) => {
  try {
    if (!req.user || !req.user._id) return res.status(401).json({ success: false, message: 'Not logged in' });
    const studentId = req.user._id;
    const jobId = req.params.jobId;
    const { coverLetter, experience, availability } = req.body;

    // Prevent duplicate applications
    const alreadyApplied = await Application.findOne({ student: studentId, job: jobId });
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied for this job.' });
    }

    const application = new Application({
      student: studentId,
      job: jobId,
      coverLetter, experience, availability
    });
    await application.save();

    await Job.findByIdAndUpdate(jobId, { $inc: { applicants: 1 } });

    res.json({ success: true, message: 'Application submitted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};