const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {emailTransport} = require('../config/email'); // Adjust this path as per your project structure

// Import your Mongoose models
const StudentRegister = require('../models/StudentRegister'); // Adjust this path
const RegistrationOtp = require('../models/RegistrationOtp'); // Adjust this path

const router = express.Router();

// Initiate student registration: send OTP
router.post('/api/student/register/initiate', async (req, res) => {
  try {
    const {
      university,
      name,
      studentName,
      rollno,
      contactEmail,
      contactPhone,
      gender,
      currentSem,
      adress,
      branch
    } = req.body;

    if (!university || !name || !studentName || !rollno || !contactEmail || !contactPhone || !gender || !currentSem || !adress || !branch) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for duplicate code or email in College
    const existing = await StudentRegister.findOne({ $or: [ { contactPhone }, { contactEmail } ] });
    if (existing) {
      return res.status(409).json({ error: 'Student with this email or phone already exists' });
    }

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Remove any previous OTP for this email (for the same type, college)
    await RegistrationOtp.deleteMany({ email: contactEmail, type: 'student' });

    // Store OTP and student info with the new schema structure
    await RegistrationOtp.create({
      email: contactEmail,
      otp,
      expiresAt,
      type: 'student', // Specify the type of registration
      data: { // Store the student info in the generic data field
        university,
        name,
        studentName,
        rollno,
        contactEmail,
        contactPhone,
        gender,
        currentSem,
        adress,
        branch
      }
    });

    // Send OTP email
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: contactEmail,
      subject: 'Your Student Registration OTP',
      text: `Your OTP for student registration is: ${otp}\nThis OTP is valid for 5 minutes.`
    });

    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    console.error('Error initiating studet registration:', err);
    res.status(500).json({ error: 'Failed to initiate registration', details: err.message });
  }
});

// Verify OTP and complete college registration
router.post('/api/student/register/verify', async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Missing required fields: email, otp, password, and confirm password.' });
    }

    // Find the OTP entry
    const registrationOtp = await RegistrationOtp.findOne({ email, type: 'student' });

    if (!registrationOtp) {
      return res.status(400).json({ error: 'Invalid email or registration session expired.' });
    }

    // Check if OTP is valid and not expired
    if (registrationOtp.otp !== otp || registrationOtp.expiresAt < new Date()) {
      // Delete the invalid/expired OTP to prevent further attempts
      await RegistrationOtp.deleteOne({ _id: registrationOtp._id });
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Validate password and confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and confirm password do not match.' });
    }

    // Optional: Add password strength validation here if needed

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the college using stored info and hashed password
    const StudentInfo = registrationOtp.data; // Get college info from the generic data field
    const newStudent = new StudentRegister({
      ...StudentInfo,
      password: hashedPassword // Use the hashed password
    });

    await newStudent.save();

    // Delete the used OTP entry
    await RegistrationOtp.deleteOne({ _id: registrationOtp._id });

    const { password: pw, ...studentData } = newStudent.toObject();
    res.status(201).json({ message: 'College registered successfully!', student: studentData });

  } catch (err) {
    console.error('Error verifying OTP and registering college:', err);
    res.status(500).json({ error: 'Failed to complete registration', details: err.message });
  }
});

module.exports = router;