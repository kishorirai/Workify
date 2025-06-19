const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const College = require('../models/College');
const Student = require('../models/Student');
const Company = require('../models/Company');

// Find user by email
router.get('/find-user/:email', async (req, res) => {
  try {
    const { email } = req.params;
    
    // Search in all user collections
    const college = await College.findOne({ contactEmail: email });
    if (college) {
      const locationParts = [];
      if (college.location) {
        const parts = college.location.split(',').map(part => part.trim());
        parts.forEach(part => {
          if (part && !locationParts.includes(part)) {
            locationParts.push(part);
          }
        });
      }
      const location = locationParts.length > 0 ? locationParts.join(', ') : null;
      
      return res.json({
        found: true,
        user: {
          id: college._id,
          email: college.contactEmail,
          name: college.name,
          type: 'college',
          location: location,
          locationParts: locationParts
        }
      });
    }
    
    const student = await Student.findOne({ email: email });
    if (student) {
      return res.json({
        found: true,
        user: {
          id: student._id,
          email: student.email,
          name: student.name,
          type: 'student'
        }
      });
    }
    
    const company = await Company.findOne({ contactEmail: email });
    if (company) {
      const locationParts = [];
      if (company.location) {
        const parts = company.location.split(',').map(part => part.trim());
        parts.forEach(part => {
          if (part && !locationParts.includes(part)) {
            locationParts.push(part);
          }
        });
      }
      const location = locationParts.length > 0 ? locationParts.join(', ') : null;
      
      return res.json({
        found: true,
        user: {
          id: company._id,
          email: company.contactEmail,
          name: company.name,
          type: 'company',
          location: location,
          locationParts: locationParts
        }
      });
    }
    
    res.json({ found: false, message: 'User not found' });
  } catch (error) {
    console.error('Error finding user:', error);
    res.status(500).json({ message: 'Error finding user' });
  }
});

// Search users by name
router.get('/search-users/:query', async (req, res) => {
  console.log('Search route hit:', req.params.query); // Debug log
  try {
    const { query } = req.params;
    const { type } = req.query;
    
    console.log('Searching for:', query, 'Type:', type); // Debug log
    
    if (!query || query.length < 2) {
      return res.json({ results: [] });
    }
    
    const searchRegex = new RegExp(query, 'i');
    const results = [];
    
    // Search colleges
    if (!type || type === 'college') {
      const colleges = await College.find({ 
        name: searchRegex 
      }).limit(15).select('_id name contactEmail location');
      
      console.log('Found colleges:', colleges.length); // Debug log
      
      colleges.forEach(college => {
        const locationParts = [];
        if (college.location) {
          const parts = college.location.split(',').map(part => part.trim());
          parts.forEach(part => {
            if (part && !locationParts.includes(part)) {
              locationParts.push(part);
            }
          });
        }
        
        const location = locationParts.length > 0 ? locationParts.join(', ') : null;
        
        results.push({
          id: college._id,
          email: college.contactEmail,
          name: college.name,
          type: 'college',
          location: location,
          locationParts: locationParts
        });
      });
    }
    
    // Search companies
    if (!type || type === 'company') {
      const companies = await Company.find({ 
        name: searchRegex 
      }).limit(15).select('_id name contactEmail location');
      
      console.log('Found companies:', companies.length); // Debug log
      
      companies.forEach(company => {
        const locationParts = [];
        if (company.location) {
          const parts = company.location.split(',').map(part => part.trim());
          parts.forEach(part => {
            if (part && !locationParts.includes(part)) {
              locationParts.push(part);
            }
          });
        }
        
        const location = locationParts.length > 0 ? locationParts.join(', ') : null;
        
        results.push({
          id: company._id,
          email: company.contactEmail,
          name: company.name,
          type: 'company',
          location: location,
          locationParts: locationParts
        });
      });
    }
    
    // Search students
    if (!type || type === 'student') {
      const students = await Student.find({ 
        name: searchRegex 
      }).limit(15).select('_id name email');
      
      console.log('Found students:', students.length); // Debug log
      
      students.forEach(student => {
        results.push({
          id: student._id,
          email: student.email,
          name: student.name,
          type: 'student'
        });
      });
    }
    
    console.log('Total results:', results.length); // Debug log
    res.json({ results });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ message: 'Error searching users' });
  }
});

// Get notifications for a user
router.get('/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const notifications = await Notification.find({
      recipient: userId,
      recipientModel: userType.charAt(0).toUpperCase() + userType.slice(1)
    })
    .populate('sender', 'name email contactEmail')
    .sort({ createdAt: -1 })
    .limit(limit);
    
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
});

// Mark all notifications as read for a user
router.patch('/:userType/:userId/read-all', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    
    const result = await Notification.updateMany(
      {
        recipient: userId,
        recipientModel: userType.charAt(0).toUpperCase() + userType.slice(1),
        read: false
      },
      { read: true }
    );
    
    res.json({ 
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Error updating notifications' });
  }
});

// Create a new notification
router.post('/', async (req, res) => {
  try {
    const { 
      sender, 
      senderModel, 
      recipientEmail, 
      recipientType, 
      title, 
      message, 
      type, 
      priority,
      category,
      actionUrl, 
      actionText,
      metadata,
      expiresAt 
    } = req.body;
    
    // Find recipient by email
    let recipientId;
    let recipientModel;
    
    if (recipientType === 'college') {
      const college = await College.findOne({ contactEmail: recipientEmail });
      if (!college) {
        return res.status(404).json({ message: 'College not found with this email' });
      }
      recipientId = college._id;
      recipientModel = 'College';
    } else if (recipientType === 'student') {
      const student = await Student.findOne({ email: recipientEmail });
      if (!student) {
        return res.status(404).json({ message: 'Student not found with this email' });
      }
      recipientId = student._id;
      recipientModel = 'Student';
    } else if (recipientType === 'company') {
      const company = await Company.findOne({ contactEmail: recipientEmail });
      if (!company) {
        return res.status(404).json({ message: 'Company not found with this email' });
      }
      recipientId = company._id;
      recipientModel = 'Company';
    } else {
      return res.status(400).json({ message: 'Invalid recipient type' });
    }
    
    const notification = new Notification({
      sender,
      senderModel,
      recipient: recipientId,
      recipientModel,
      title,
      message,
      type: type || 'info',
      priority: priority || 'normal',
      category: category || 'general',
      actionUrl,
      actionText,
      metadata,
      expiresAt
    });
    
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification' });
  }
});

// Delete a notification
router.delete('/:notificationId', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    const notification = await Notification.findByIdAndDelete(notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

// Get unread count for a user
router.get('/:userType/:userId/unread-count', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    
    const count = await Notification.countDocuments({
      recipient: userId,
      recipientModel: userType.charAt(0).toUpperCase() + userType.slice(1),
      read: false
    });
    
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Error getting unread count' });
  }
});

// Get sent messages for a user
router.get('/sent/:userType/:userId', async (req, res) => {
  try {
    const { userType, userId } = req.params;
    console.log('Fetching sent messages for:', { userType, userId });

    // Validate user type
    if (!['college', 'company', 'student'].includes(userType)) {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    // Find all notifications where the user is the sender
    const notifications = await Notification.find({
      sender: userId,
      senderModel: userType.charAt(0).toUpperCase() + userType.slice(1)
    })
    .populate('recipient', 'name email contactEmail')
    .sort({ createdAt: -1 });

    console.log(`Found ${notifications.length} sent messages`);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching sent messages:', error);
    res.status(500).json({ message: 'Error fetching sent messages' });
  }
});

module.exports = router; 