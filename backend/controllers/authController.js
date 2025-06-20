const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

// Helper to generate JWT
function generateToken(student) {
  return jwt.sign(
    {
      id: student._id,
      name: student.name,
      email: student.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
}

// Student signup
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = new Student({ name, email, password: hashedPassword });
    await student.save();

    // Generate JWT token
    const token = generateToken(student);

    res.status(201).json({
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const student = await Student.findOne({ email });
    if (!student) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(student);

    res.json({
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Middleware to protect routes
exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

// Get profile (protected)
exports.getProfile = async (req, res) => {
  try {
    // req.user is set by protect middleware
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ profile: student });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
