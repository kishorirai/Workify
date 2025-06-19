const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

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

    // Set session data - this will persist to MongoStore
    req.session.user = {
      id: student._id.toString(),
      name: student.name,
      email: student.email
    };

    // Make sure the session is saved before sending response
    req.session.save((err) => {
      if (err) return res.status(500).json({ message: "Session save failed" });
      res.status(201).json({
        studentId: student._id,
        student: req.session.user
      });
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

    // Set session data
    req.session.user = {
      id: student._id.toString(),
      name: student.name,
      email: student.email
    };

    // Make sure the session is saved before sending response
    req.session.save((err) => {
      if (err) return res.status(500).json({ message: "Session save failed" });
      res.json({
        studentId: student._id,
        student: req.session.user
      });
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Student logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.clearCookie('connect.sid'); 
    res.json({ message: 'Logged out successfully' });
  });
};