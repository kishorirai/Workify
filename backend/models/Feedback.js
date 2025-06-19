const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  company: { type: String, required: true },
  type: { type: String, required: true }, // e.g., position/role
  date: { type: Date, default: Date.now },
  rating: { type: Number, min: 1, max: 5, required: true },
  sentiment: { type: String },
  feedback: { type: String, required: true },
  direction: { type: String, enum: ['given', 'received'], required: true }, // "given" or "received"
  from: { type: String },   // Company or office that gave feedback (for received)
  to: { type: String }      // Company or office that received feedback (for given)
});

module.exports = mongoose.model('Feedback', feedbackSchema);