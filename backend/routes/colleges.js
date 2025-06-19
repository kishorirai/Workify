const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const College = require('../models/College');
const CollegeStudent = require('../models/collegeStudent.model');
const RegistrationOtp = require('../models/RegistrationOtp');
const {emailTransport} = require('../config/email');
const cloudinary = require('../config/cloudinary');
const {isCollegeAuthenticated,isCollegeAdmin} = require('../middleware/auth');
// app.get('/api/college/:collegeId/student/:studentId') ..... Get a single student by ID and college
// app.put('/api/college/:collegeId/student/:studentId') .....Put endpoint for updating college student profiles
// app.post('/api/college/register/initiate') .....Post Initiate college registration: send OTP
// app.post('/api/college/register/verify') Post, Verify OTP and complete college registration
// app.get('/api/colleges/:id') ..... Get college by Id
// app.get('/api/colleges') ..... Get all colleges
// app.get('/api/colleges/email/:email') .....Get college by college official email

router.get('/:collegeId/student/:studentId', async (req, res) => {
  try {
    
    const student = await CollegeStudent.findOne({
      _id: req.params.studentId,
      college: req.params.collegeId
    });
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (err) {
    console.error('Error fetching student:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:collegeId/student/:studentId',isCollegeAuthenticated,isCollegeAdmin, async (req, res) => {
  try {
    
    const student = await CollegeStudent.findOneAndUpdate(
      {
        _id: req.params.studentId,
        college: req.params.collegeId
      },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (err) {
    console.error('Error updating student:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/register/initiate', async (req, res) => {
  try {
    const {
      name,
      code,
      location,
      website,
      contactEmail,
      contactPhone,
      placementOfficer,
      departments,
      establishedYear,
      campusSize
    } = req.body;

    if (!name || !code || !location || !contactEmail || !contactPhone || !placementOfficer || !departments || !establishedYear || !campusSize) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check for duplicate code or email in College
    const existing = await College.findOne({ $or: [ { code }, { contactEmail } ] });
    if (existing) {
      return res.status(409).json({ error: 'College with this code or email already exists' });
    }

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    // Remove any previous OTP for this email (for the same type, college)
    await RegistrationOtp.deleteMany({ email: contactEmail, type: 'college' });

    // Store OTP and college info with the new schema structure
    await RegistrationOtp.create({
      email: contactEmail,
      otp,
      expiresAt,
      type: 'college', // Specify the type of registration
      data: { // Store the college info in the generic data field
        name,
        code,
        location,
        website,
        contactEmail,
        contactPhone,
        placementOfficer,
        departments,
        establishedYear,
        campusSize
      }
    });

    // Send OTP email
    await emailTransport.sendMail({
      from: process.env.EMAIL_SENDER,
      to: contactEmail,
      subject: 'Your College Registration OTP',
      text: `Your OTP for college registration is: ${otp}\nThis OTP is valid for 5 minutes.`
    });

    res.json({ message: 'OTP sent to email.' });
  } catch (err) {
    console.error('Error initiating college registration:', err);
    res.status(500).json({ error: 'Failed to initiate registration', details: err.message });
  }
});

router.post('/register/verify', async (req, res) => {
  try {
    const { email, otp, password, confirmPassword } = req.body;

    if (!email || !otp || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Missing required fields: email, otp, password, and confirm password.' });
    }

    // Find the OTP entry
    const registrationOtp = await RegistrationOtp.findOne({ email, type: 'college' });

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
    const collegeInfo = registrationOtp.data; // Get college info from the generic data field
    const newCollege = new College({
      ...collegeInfo,
      password: hashedPassword // Use the hashed password
    });

    await newCollege.save();

    // Delete the used OTP entry
    await RegistrationOtp.deleteOne({ _id: registrationOtp._id });

    const { password: pw, ...collegeData } = newCollege.toObject();
    res.status(201).json({ message: 'College registered successfully!', college: collegeData });

  } catch (err) {
    console.error('Error verifying OTP and registering college:', err);
    res.status(500).json({ error: 'Failed to complete registration', details: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    res.json(college);
  } catch (error) {
    console.error('Error fetching college:', error);
    res.status(500).json({ error: 'Failed to fetch college details' });
  }
});

router.get('/', async (req, res) => {
  try {
    let limit = req.query.limit || 10;
    const colleges = await College.find().sort({ name: 1 }).limit(limit).offset(req.query.offset || 0);
    if (colleges.length === 0) {
      res.json("no college in database")
    }
    res.json(colleges);
  } catch (error) {
    console.error('Error fetching colleges:', error);
    res.status(500).json({ 
      error: 'Failed to fetch colleges',
      details: error.message 
    });
  }
});

router.get('/email/:email', async (req, res) => {
  try {
    const college = await College.findOne({ contactEmail: req.params.email });
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    res.json(college);
  } catch (error) {
    res.status(500).json({ error: 'Failed to find college' });
  }
});

// Edit college information
router.put('/:id/edit',isCollegeAuthenticated,isCollegeAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, code, location, website, contactEmail, contactPhone,
      placementOfficer, departments, establishedYear, campusSize,
      profileImage
    } = req.body;

    // Check if this is an image-only update
    const isImageOnlyUpdate = Object.keys(req.body).length === 1 && req.body.profileImage;

    if (isImageOnlyUpdate) {
      try {
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(profileImage, {
          folder: 'college_profiles',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' }
          ]
        });

        // Update college with Cloudinary URL
        const updatedCollege = await College.findByIdAndUpdate(
          id,
          { $set: { profileImage: result.secure_url } },
          { new: true }
        ).select('-password');

        return res.json(updatedCollege);
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        return res.status(500).json({ error: 'Failed to upload image' });
      }
    }

    // Validate required fields for full profile update
    if (!name || !code || !location || !contactEmail || !contactPhone || !establishedYear || !campusSize) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate data types
    if (isNaN(establishedYear) || isNaN(campusSize)) {
      return res.status(400).json({ error: 'Established year and campus size must be numbers' });
    }

    // Check if college exists
    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    // Check for duplicate code or email
    const existingCollege = await College.findOne({
      $or: [
        { code: code, _id: { $ne: id } },
        { contactEmail: contactEmail, _id: { $ne: id } }
      ]
    });

    if (existingCollege) {
      return res.status(400).json({ error: 'College code or email already exists' });
    }

    // Prepare update data
    const updateData = {
      name,
      code,
      location,
      website,
      contactEmail,
      contactPhone,
      placementOfficer,
      departments,
      establishedYear,
      campusSize
    };

    // Update college information
    const updatedCollege = await College.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json(updatedCollege);
  } catch (error) {
    console.error('Error updating college:', error);
    res.status(500).json({ error: 'Failed to update college information' });
  }
});

module.exports = router;