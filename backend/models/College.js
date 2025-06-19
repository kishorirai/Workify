const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  location: {
    type: String,
    required: true
  },
  website: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please fill a valid email address']
  },
  contactPhone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  placementOfficer: {
    name: String,
    email: String,
    phone: String
  },
  departments: [{
    name: String,
    code: String
  }],
 
  establishedYear: {
    type: Number,
    required: true
  },
  campusSize: {
    type: Number, // in acres
    required: true
  },
  profileImage: {
    type: String,
    default: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/college_profiles/default-college'
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  logo: {
    type: String,
    default: ''
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Remove password validation that checks for googleId
collegeSchema.path('password').required(true);

const College = mongoose.model('College', collegeSchema);

module.exports = College; 