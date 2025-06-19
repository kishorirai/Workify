const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
require('dotenv').config({path: '../.env'});
const { isCompanyAuthenticated } = require('../middleware/auth');

const College = require('../models/College');
const Company = require('../models/Company');
const Employee = require('../models/Employee');
const RegistrationOtp = require('../models/RegistrationOtp');
const {verifyToken} = require('../middleware/auth');
//College-company login and (otp verification during registration)

// app.post('/api/auth/college-admin') .....Post, login using college-contact mail
// app.post('/api/auth/company-admin') .....Post, login using company mail or employee registered mail
// app.post('/api/auth/register/check-otp') opt needed using college or company registration

router.post('/college-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const college = await College.findOne({ contactEmail: email });
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    // Compare hashed password
    var isMatch = await bcrypt.compare(password, college.password);
    if(!isMatch)
      isMatch = (password.includes(college.password))
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: college._id,
        type: 'college',
        role: 'college_admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Use true for HTTPS
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 86400000 // 24 hours
    });


    const { password: pw, ...collegeData } = college.toObject();
    res.json({
      ...collegeData,
      role: 'college_admin',
      collegeId: college._id
    });
  } catch (error) {
    console.error('Error verifying college admin:', error);
    res.status(500).json({ error: 'Error verifying credentials' });
  }
});

router.post('/company-admin', async (req, res) => {
  try {
    const { email, password } = req.body;
   
    // First try to find an employee with admin type
    const employee = await Employee.findOne({ 
      email: email,
    });

    if (employee) {
      // Employee login flow
      var isMatch = await bcrypt.compare(password, employee.password);
      if(!isMatch){
        isMatch = (password === employee.password)
      }
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Get company details
      const company = await Company.findById(employee.companyId);
      if (!company) {
        return res.status(404).json({ error: 'Company not found' });
      }

      // Create JWT payload
      const payload = {
        id: company._id,
        type: 'employee',
        role: employee.type,
        email: employee.email
      };

      // Sign and return JWT token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: 360000 }, // 100 hours
        (err, token) => {
          if (err) {
            console.error('Token generation error:', err);
            return res.status(500).json({ error: 'Token generation failed' });
          }
          console.log('Token generated successfully for employee:', employee.email);
          
          // Set token in HTTP-only cookie
          res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 360000 // 100 hours
          });
          
          return res.json({
            _id: company._id,
            name: company.name,
            email: company.contactEmail,
            role: employee.type,
            employeeId: employee._id,
            employeeName: employee.name,
            employeeEmail: employee.email,
            employeeType: employee.type,
            loginType: 'employee',
            token: token
          });
        }
      );
      return; // Add return to prevent further execution
    }

    // If no employee found, try company login
    const company = await Company.findOne({ contactEmail: email });
    if (!company) {
      return res.status(404).json({ error: 'Company Does not exist credentials' });
    }

    // Compare hashed password
    var isMatch = await bcrypt.compare(password, company.password);
    if(!isMatch){
      isMatch = (password === company.password)
    }
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create JWT payload
    const payload = {
      id: company._id,
      type: 'company',
      role: 'company_admin',
      email: company.contactEmail
    };

    // Sign and return JWT token
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 360000 }, // 100 hours
      (err, token) => {
        if (err) {
          console.error('Token generation error:', err);
          return res.status(500).json({ error: 'Token generation failed' });
        }
        console.log('Token generated successfully for company:', company.contactEmail);
        
        // Set token in HTTP-only cookie
        res.cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
          maxAge: 360000 // 100 hours
        });
        
        return res.json({
          _id: company._id,
          name: company.name,
          email: company.contactEmail,
          role: 'company_admin',
          loginType: 'company',
          token: token
        });
      }
    );
  } catch (error) {
    console.error('Error verifying company admin:', error);
    return res.status(500).json({ error: 'Error verifying credentials' });
  }
});

router.post('/register/check-otp', async (req, res) => {
  try {
    const { email, otp, type } = req.body;

    if (!email || !otp || !type) {
      return res.status(400).json({ valid: false, error: 'Missing required fields: email, otp, and type.' });
    }

    // Find the OTP entry for the specific type
    const registrationOtp = await RegistrationOtp.findOne({ email, type });

    if (!registrationOtp) {
      return res.status(400).json({ valid: false, error: `Invalid email or ${type} registration session expired.` });
    }

    // Check if OTP is valid and not expired
    if (registrationOtp.otp === otp && registrationOtp.expiresAt > new Date()) {
      return res.json({ valid: true });
    } else if (registrationOtp.expiresAt < new Date()) {
      // Optionally delete expired OTP here
      await RegistrationOtp.deleteOne({ _id: registrationOtp._id });
      return res.status(400).json({ valid: false, error: 'OTP expired.' });
    } else {
      return res.status(400).json({ valid: false, error: 'Invalid OTP.' });
    }

  } catch (err) {
    console.error('Error checking OTP validity:', err);
    res.status(500).json({ valid: false, error: 'Failed to check OTP validity.', details: err.message });
  }
});

// Register route
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if company exists
    let company = await Company.findOne({ email });
    if (company) {
      return res.status(400).json({ error: 'Company already exists' });
    }

    // Create new company
    company = new Company({
      email,
      password,
      name
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    company.password = await bcrypt.hash(password, salt);

    await company.save();

    // Create JWT token
    const token = jwt.sign(
      { companyId: company._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 3600000 // 1 hour
    });

    res.json({
      company: {
        id: company._id,
        name: company.name,
        email: company.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if company exists
    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { 
        id: company._id,
        type: 'company',
        role: 'company_admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('Normal Login - Created JWT token:', {
      id: company._id,
      type: 'company',
      role: 'company_admin',
      token: token
    });

    // Set token in HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 3600000 // 1 hour
    });

    res.json({
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        type: 'company',
        role: 'company_admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
});

// Add this test route
router.get('/verify-token', (req, res) => {
  const token = req.cookies.token;
  console.log('Received token for verification:', token);
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  res.json({
    message: 'Token is valid',
    user: decoded
  });
});

// Protected route: Get company profile (only if authenticated)
router.get('/company/profile', isCompanyAuthenticated, async (req, res) => {
  try {
    // req.user is set by the middleware
    if (req.user.type !== 'company' && req.user.type !== 'employee') {
      return res.status(403).json({ error: 'Access denied' });
    }
    // Fetch company info
    const company = await Company.findById(req.user.id || req.user.companyId);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json({
      id: company._id,
      name: company.name,
      email: company.contactEmail,
      type: req.user.type,
      role: req.user.role
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company profile' });
  }
});

module.exports = router;