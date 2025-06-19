const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  status: {
    type: String,
    enum: [
      'applied',
      'under_review',
      'interview_scheduled',
      'offer_received',
      'rejected'
    ],
    default: 'applied'
  },
  appliedDate: { type: Date, default: Date.now },
  coverLetter: String,
  experience: String,
  availability: String,
  nextStep: String,
  nextStepDate: Date,
  interview: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Interview',
    default: null
  }
}, {
  timestamps: true
});

delete mongoose.models.Application;
module.exports = mongoose.model('StudentApplication', applicationSchema);