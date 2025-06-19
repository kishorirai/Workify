require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');


// Route modules
const authRoutes = require('./routes/authRoutes')
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const interviewRoutes = require('./routes/interviewRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const studentRoutes = require('./routes/studentRoutes');
const notificationRoutes = require('./routes/notifications');


// Additional "Raj Sir part" and others
const studentRegisterRoutes = require('./routes/studentRegister');
const userRoutes = require('./routes/user');
const placementRoutes = require('./routes/placement');
const companyRoutes = require('./routes/company');
const rolesRoutes = require('./routes/roles');
const employeesRoutes = require('./routes/employees');
const collegesRoutes = require('./routes/colleges');
const internshipsRoutes = require('./routes/internships');
const supportRoutes = require('./routes/support');
const studentMatchingRoutes = require('./routes/studentMatchingRoutes');

const bcrypt = require('bcrypt');

const app = express();

// Debug middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware for parsing JSON and urlencoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { secure: process.env.NODE_ENV === 'production', 
            httpOnly: true, 
            maxAge: 1000 * 60 * 60 * 24,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        }, // 1 day
    }));

// CORS setup
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'https://campusadmin-y4hh.vercel.app',
  'https://campusadmin.vercel.app',
  'https://www.rojgarsetu.org',
  'https://company.rojgarsetu.org',
  'https://campusconnect-sumit-sahus-projects-83ef9bf1.vercel.app',
  'https://campusconnect-git-main-sumit-sahus-projects-83ef9bf1.vercel.app',
  'https://campusconnect-dk9xkuzk0-sumit-sahus-projects-83ef9bf1.vercel.app'
];


if (process.env.REACT_URL) allowedOrigins.push(process.env.REACT_URL);
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.replace(/\/$/, '');
    const normalizedAllowedOrigins = allowedOrigins.map(o => o.replace(/\/$/, ''));
    if (normalizedAllowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS not allowed for origin: ${origin}`), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  optionsSuccessStatus: 200,
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  const formattedDate = new Date().toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  console.log(`Connected to Database: ${process.env.MONGODB_URI} | ${formattedDate} | ${process.env.MONGODB_URI}`);
}).catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});
db.once('open', () => {
  console.log('MongoDB connection established successfully');
});

//additional routes that are not included here from routes folder
app.use('/api/auth', require('./routes/auth'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/interviews', require('./routes/interviews'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/students', require('./routes/students'));


// API Routes
app.use('/api/student', authRoutes);
app.use('/api/studentJobs', jobRoutes);
app.use('/api/internships', internshipsRoutes);
app.use('/api/studentInterviews', interviewRoutes);
app.use('/api/studentApplications', applicationRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/colleges', collegesRoutes);
app.use('/api/studentsProfile', studentRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

// Raj Sir part
app.use('/api/student', studentRegisterRoutes);

// Special endpoint for college-students email verification (Raj Sir part)
const StudentRegister = require('./models/StudentRegister');
app.post('/api/college-students/email', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Verifying student:', email);

    const student = await StudentRegister.findOne({ contactEmail: email });
    if (!student) {
      console.log('Student not found');
      return res.status(404).json({ error: 'Student not found' });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      console.log('Invalid password');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Student verified successfully');
    const { password: pw, ...studentData } = student.toObject();
    res.json({
      user: {
        id: studentData._id,
        email: studentData.contactEmail,
        name: studentData.studentName,
      }
    });
  } catch (error) {
    console.error('Error verifying student:', error);
    res.status(500).json({ error: 'Error verifying credentials' });
  }
});

// Health check/test route
app.get('/', (req, res) => {
  res.send('Backend running!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

// Other Sales and Support routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/placement', placementRoutes);

// Add after other app.use for routes
app.use('/api/student-matching', studentMatchingRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
