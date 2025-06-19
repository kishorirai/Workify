const mongoose = require('mongoose');
const { Schema } = mongoose;

const internshipSchema = new Schema({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'CollegeStudent',
    required: true
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  interviewId: {
    type: Schema.Types.ObjectId,
    ref: 'Interview'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
  },
  stipend: {
    type: Number,
    required: true
  },
  mode: {
    type: String,
    enum: ['remote', 'onsite', 'hybrid'],
  },
  status: {
    type: String,
    enum: ['offered', 'accepted', 'rejected', 'completed'],
    default: 'offered'
  },
  feedback: {
    technicalScore: Number,
    communicationScore: Number,
    problemSolvingScore: Number,
    overallScore: Number,
    comments: String,
    date: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Internship', internshipSchema); 