const mongoose = require('mongoose');

const studentregisterSchema = new mongoose.Schema({
  university: {
    type: String,
    required: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  studentName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  rollno: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true
  },
  contactPhone: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true
  },
  currentSem: {
    type: String,
    required: true
  },
 
  adress: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  
}, {
  timestamps: true
});

module.exports = mongoose.model('StudentRegister', studentregisterSchema); 