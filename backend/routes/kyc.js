const express = require('express');
const router = express.Router();


const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const AWS = require('aws-sdk');
const multerS3 = require('multer-s3');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// AWS S3 Configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'private',
    key: (req, file, cb) => {
      cb(null, `documents/${Date.now()}-${file.originalname}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, JPEG, and PNG are allowed.'));
    }
  },
});


// MongoDB Schemas
const DocumentSchema = new mongoose.Schema({
  id: String,
  name: String,
  type: String,
  status: { type: String, enum: ['verified', 'pending', 'missing', 'rejected'] },
  lastUpdated: String,
  source: { type: String, enum: ['digi-kyc', 'manual'] },
  kycId: String,
  downloadUrl: String,
  userId: String, // Added to associate with user
});

const VerificationTicketSchema = new mongoose.Schema({
  id: String,
  studentName: String,
  documentType: String,
  status: { type: String, enum: ['pending', 'approved', 'rejected'] },
  uploadedFile: String, // S3 file path
  created: String,
  description: String,
  userId: String, // Added to associate with user
});

const Document = mongoose.model('Document', DocumentSchema);
const VerificationTicket = mongoose.model('VerificationTicket', VerificationTicketSchema);

// DigiLocker API Configuration
const DIGILOCKER_CONFIG = {
  BASE_URL: process.env.DIGILOCKER_BASE_URL || 'https://api.digilocker.gov.in',
  CLIENT_ID: process.env.DIGILOCKER_CLIENT_ID,
  CLIENT_SECRET: process.env.DIGILOCKER_CLIENT_SECRET,
  REDIRECT_URI: process.env.DIGILOCKER_REDIRECT_URI || 'http://localhost:3001/digilocker/callback',
};

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Initiate DigiLocker OAuth Flow
app.post('/digilocker/request', authenticateToken, async (req, res) => {
  try {
    const response = await axios.post(`${DIGILOCKER_CONFIG.BASE_URL}/request`, {
      clientId: DIGILOCKER_CONFIG.CLIENT_ID,
      redirectUrl: DIGILOCKER_CONFIG.REDIRECT_URI,
    });
    res.json({
      requestId: response.data.requestId,
      digilockerUrl: response.data.digilockerUrl,
    });
  } catch (error) {
    console.error('Error initiating DigiLocker request:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to initiate DigiLocker request' });
  }
});

// Handle DigiLocker Callback
app.get('/digilocker/callback', authenticateToken, async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Authorization code missing' });

  try {
    const response = await axios.post(`${DIGILOCKER_CONFIG.BASE_URL}/token`, {
      clientId: DIGILOCKER_CONFIG.CLIENT_ID,
      clientSecret: DIGILOCKER_CONFIG.CLIENT_SECRET,
      code,
      redirectUrl: DIGILOCKER_CONFIG.REDIRECT_URI,
    });

    const { accessToken, refreshToken } = response.data;

    // Store tokens securely (e.g., in database or session)
    // For simplicity, we'll assume tokens are stored in the session or database
    // Here, we proceed to fetch documents
    res.redirect('/documents'); // Redirect to frontend documents page
  } catch (error) {
    console.error('Error exchanging code for tokens:', error.response?.data || error.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Fetch Document List
app.get('/digilocker/documents', authenticateToken, async (req, res) => {
  try {
    const response = await axios.get(`${DIGILOCKER_CONFIG.BASE_URL}/documents`, {
      headers: { Authorization: `Bearer ${req.user.accessToken}` },
    });

    const documents = response.data.documents.map(doc => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: doc.description,
      type: doc.docType,
      status: 'pending',
      lastUpdated: new Date().toISOString().split('T')[0],
      source: 'digi-kyc',
      kycId: doc.docType + '-' + doc.orgId,
      userId: req.user.userId,
    }));

    // Save documents to MongoDB
    await Document.insertMany(documents);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Fetch Specific Document
app.post('/digilocker/fetch-document', authenticateToken, async (req, res) => {
  const { docType, orgId, format, parameters } = req.body;
  try {
    const response = await axios.post(
      `${DIGILOCKER_CONFIG.BASE_URL}/fetch-document`,
      { docType, orgId, format, parameters },
      { headers: { Authorization: `Bearer ${req.user.accessToken}` } }
    );

    const documentData = response.data;
    const downloadUrl = documentData.fileUrl || null;

    // Save document metadata to MongoDB
    const newDoc = new Document({
      id: `doc-${Date.now()}`,
      name: documentData.description || docType,
      type: docType,
      status: 'verified', // Assume verified if fetched successfully
      lastUpdated: new Date().toISOString().split('T')[0],
      source: 'digi-kyc',
      kycId: `${docType}-${orgId}`,
      downloadUrl,
      userId: req.user.userId,
    });

    await newDoc.save();
    res.json({ ...newDoc.toObject(), downloadUrl });
  } catch (error) {
    console.error('Error fetching document:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Create Verification Ticket
app.post('/tickets', authenticateToken, upload.single('file'), async (req, res) => {
  const { documentType, description } = req.body;
  if (!documentType || !description) {
    return res.status(400).json({ error: 'Document type and description are required' });
  }

  try {
    const ticket = new VerificationTicket({
      id: `VT${Date.now()}`,
      studentName: req.user.name || 'Unknown',
      documentType,
      status: 'pending',
      uploadedFile: req.file ? req.file.key : null,
      created: new Date().toISOString().split('T')[0],
      description,
      userId: req.user.userId,
    });

    await ticket.save();
    res.json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Get All Documents for a User
app.get('/documents', authenticateToken, async (req, res) => {
  try {
    const documents = await Document.find({ userId: req.user.userId });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get All Tickets for a User
app.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const tickets = await VerificationTicket.find({ userId: req.user.userId });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Download Document from S3
app.get('/download/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOne({ id: req.params.id, userId: req.user.userId });
    if (!document || !document.downloadUrl) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: document.downloadUrl,
    };

    const { Body } = await s3.getObject(params).promise();
    res.setHeader('Content-Disposition', `attachment; filename="${document.name}"`);
    res.send(Body);
  } catch (error) {
    console.error('Error downloading document:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = router;