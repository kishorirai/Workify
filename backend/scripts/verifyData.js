require('dotenv').config({path: '../.env'});
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Internship = require('../models/Internship');
const Interview = require('../models/Interview');
const CollegeStudent = require('../models/collegeStudent.model');
const Company = require('../models/Company');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus_connect';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('\nVerifying Database Contents:');
    console.log('------------------------');
    console.log(`Students: ${await CollegeStudent.countDocuments()}`);
    console.log(`Companies: ${await Company.countDocuments()}`);
    console.log(`Interviews: ${await Interview.countDocuments()}`);
    console.log(`Internships: ${await Internship.countDocuments()}`);
    console.log(`Jobs: ${await Job.countDocuments()}`);
    console.log('------------------------');

    // Get some sample data
    const sampleInternship = await Internship.findOne().populate('studentId').populate('companyId');
    const sampleJob = await Job.findOne().populate('studentId').populate('companyId');

    if (sampleInternship) {
      console.log('\nSample Internship:');
      console.log('-----------------');
      console.log(`Student: ${sampleInternship.studentId.name}`);
      console.log(`Company: ${sampleInternship.companyId.name}`);
      console.log(`Title: ${sampleInternship.title}`);
      console.log(`Status: ${sampleInternship.status}`);
    }

    if (sampleJob) {
      console.log('\nSample Job:');
      console.log('-----------');
      console.log(`Student: ${sampleJob.studentId.name}`);
      console.log(`Company: ${sampleJob.companyId.name}`);
      console.log(`Title: ${sampleJob.title}`);
      console.log(`Status: ${sampleJob.status}`);
    }

    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  }); 