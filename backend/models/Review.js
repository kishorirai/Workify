const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  belongsTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'belongsToModel'
  },
  belongsToModel: {
    type: String,
    required: true,
    enum: ['Employee', 'Company', 'College', 'CollegeStudent']
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'reviewerModel'
  },
  reviewerModel: {
    type: String,
    required: true,
    enum: ['Employee', 'Company', 'College', 'CollegeStudent']
  },
   feedback: {
    technicalScore: Number,
    communicationScore: Number,
    problemSolvingScore: Number,
    overallScore: Number,
    comments: String,
    date: Date
  },
}, {
  timestamps: true
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
