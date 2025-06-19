const Feedback = require('../models/Feedback');

// Give feedback (student gives to company/organization)
exports.giveFeedback = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { company, type, rating, feedback } = req.body;
    const sentiment = rating >= 4 ? "Positive" : "Constructive";
    const newFeedback = new Feedback({
      student: studentId,
      company,
      type,
      rating,
      feedback,
      sentiment,
      direction: 'given',
      to: company
    });
    await newFeedback.save();
    res.status(201).json({ success: true, feedback: newFeedback });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get feedback received by student (from companies/mock interviewers)
exports.getReceivedFeedback = async (req, res) => {
  try {
    const studentId = req.user.id;
    // "received" feedbacks are those where this student is the recipient
    const feedbacks = await Feedback.find({ student: studentId, direction: 'received' }).sort({ date: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get feedback given by student
exports.getGivenFeedback = async (req, res) => {
  try {
    const studentId = req.user.id;
    const feedbacks = await Feedback.find({ student: studentId, direction: 'given' }).sort({ date: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH: Edit feedback (student can only edit their own given feedback)
exports.editFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const studentId = req.user.id;
    const { company, type, rating, feedback } = req.body;
    const sentiment = rating >= 4 ? "Positive" : "Constructive";

    // Only allow editing of feedback given by the student
    const fb = await Feedback.findOne({ _id: feedbackId, student: studentId, direction: 'given' });
    if (!fb) return res.status(404).json({ success: false, message: 'Feedback not found or permission denied' });

    fb.company = company || fb.company;
    fb.type = type || fb.type;
    fb.rating = rating || fb.rating;
    fb.feedback = feedback || fb.feedback;
    fb.sentiment = sentiment;
    await fb.save();

    res.json({ success: true, feedback: fb });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE: Delete feedback (student can only delete their own given feedback)
exports.deleteFeedback = async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const studentId = req.user.id;

    // Only allow deleting feedback given by the student
    const fb = await Feedback.findOneAndDelete({ _id: feedbackId, student: studentId, direction: 'given' });
    if (!fb) return res.status(404).json({ success: false, message: 'Feedback not found or permission denied' });

    res.json({ success: true, message: 'Feedback deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};