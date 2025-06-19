const mongoose = require('mongoose');


const collegeStudentSchema = new mongoose.Schema({
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  joiningYear: {
    type: Number,
    required: true
  },
  graduationYear: {
    type: Number,
    required: true
  },
  cgpa: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  campusScore: {
    type: Number,
    required: true,
    min:0,
    max:10, 
    default:6.5,
  },
  skills: [{
    type: String,
    trim: true
  }],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    startDate: Date,
    endDate: Date,
    link: String
  }],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    issuer: String
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    link: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  resume: {
    type: String
  },
  extracurricular: [{
    activity: String,
    role: String,
    achievement: String
  }],
  research: [{
    title: String,
    role: String,
    year: Number,
    description: String
  }],
  hackathons: [{
    name: String,
    year: Number,
    achievement: String,
    description: String
  }],
  profileImage: {
    type:String,
    default:'https://plus.unsplash.com/premium_photo-1738637233381-6f857ce13eb9?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3R1ZGVudCUyMHByb2ZpbGUlMjBhbmltYXRlZHxlbnwwfHwwfHx8MA%3D%3D'
  },
  isCollegeVerified:{
    type: Boolean,
    default: false,
    required: true,
  }, 
  isSalesVerified:{
    type: Boolean, 
    default: false,
    required: true,
  }
}, {
  timestamps: true
});



// Add this to your CollegeStudent schema file (before creating the model)
collegeStudentSchema.pre('save', async function(next) {
  if (this.isModified('skills') || this.isModified('projects') || 
      this.isModified('achievements') || this.isModified('certifications') ||
      this.isModified('extracurricular') || this.isModified('research') || 
      this.isModified('hackathons') || this.isNew) {
    
    try {
      // Calculate scores from all feedback sources
      const [internships, jobs, interviews, reviews] = await Promise.all([
        mongoose.model('Internship').find({ studentId: this._id, 'feedback.overallScore': { $exists: true } }),
        mongoose.model('Job').find({ studentId: this._id, 'feedback.overallScore': { $exists: true } }),
        mongoose.model('Interview').find({ interviewee: this._id, 'feedback.overallScore': { $exists: true } }),
        mongoose.model('Review').find({ belongsTo: this._id, belongsToModel: 'CollegeStudent', 'feedback.overallScore': { $exists: true } })
      ]);

      // Extract all valid scores
      const allScores = [
        ...internships.map(i => i.feedback.overallScore),
        ...jobs.map(j => j.feedback.overallScore),
        ...interviews.map(i => i.feedback.overallScore),
        ...reviews.map(r => r.feedback.overallScore)
      ].filter(score => typeof score === 'number' && score >= 0 && score <= 10);

      // Calculate new campus score (weighted average if needed)
      let newCampusScore;
      if (allScores.length > 0) {
        const sum = allScores.reduce((total, score) => total + score, 0);
        newCampusScore = sum / allScores.length;
        
        // Round to 2 decimal places
        newCampusScore = Math.round(newCampusScore * 100) / 100;
      } else {
        // Default score if no feedback exists
        newCampusScore = 6.5;
      }

      // Ensure score stays within bounds
      this.campusScore = Math.min(Math.max(newCampusScore, 0), 10);
      
    } catch (err) {
      console.error('Error calculating campus score:', err);
      // Keep existing score if calculation fails
    }
  }
  next();
});
collegeStudentSchema.post(['findOneAndUpdate', 'updateOne', 'updateMany'], async function(result) {
  const doc = await this.model.findOne(this.getQuery());
  if (doc) await doc.save();
});

module.exports = mongoose.model('CollegeStudent', collegeStudentSchema); 
