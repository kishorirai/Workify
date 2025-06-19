const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  // Login and basic info
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // College relationship
  college: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },

  // College info
  department: String,
  batch: String,
  joiningYear: Number,
  graduationYear: Number,

  // Academic info
  degree: String,
  major: String,
  year: String,
  gpa: String,
  cgpa: { type: Number, min: 0, max: 10 },
  expectedGraduation: String,

  // Scores
  campusScore: { type: Number, min: 0, max: 10, default: 6.5 },

  // Career & job profile
  title: String,
  careerObjective: String,
  portfolioUrl: String,
  githubUrl: String,
  linkedinUrl: String,

  // Contact
  phone: String,
  location: String,

  // Personal info
  studentId: String,
  dateOfBirth: String,
  gender: String,
  nationality: String,

  // Skills and technologies
  skills: [{ type: String, trim: true }],
  programmingLanguages: [String],
  technologies: [String],

  // Resume
  resume: String,

  // Projects
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    startDate: Date,
    endDate: Date,
    link: String
  }],

  // Achievements
  achievements: [{
    title: String,
    description: String,
    date: Date,
    issuer: String
  }],

  // Certifications
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    link: String
  }],

  // Extracurricular
  extracurricular: [{
    activity: String,
    role: String,
    achievement: String
  }],

  // Research
  research: [{
    title: String,
    role: String,
    year: Number,
    description: String
  }],

  // Hackathons
  hackathons: [{
    name: String,
    year: Number,
    achievement: String,
    description: String
  }],

  // Saved jobs (for job portal)
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],

  // Profile picture (support both Buffer and fallback URL)
  profilePic: {
    data: Buffer,
    contentType: String,
  },
  profileImage: {
    type: String,
    default: 'https://plus.unsplash.com/premium_photo-1738637233381-6f857ce13eb9?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3R1ZGVudCUyMHByb2ZpbGUlMjBhbmltYXRlZHxlbnwwfHwwfHx8MA%3D%3D'
  },

  // Verifications
  verified: { type: Boolean, default: false },
  isCollegeVerified: { type: Boolean, default: false },
  isSalesVerified: { type: Boolean, default: false },

  // Password reset fields
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  // Timestamps
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);