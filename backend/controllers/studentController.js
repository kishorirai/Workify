const Student = require('../models/Student');

// Helper: Validate email format
function isValidEmail(email) {
  return /\S+@\S+\.\S+/.test(email);
}

const allowedFields = [
  "name","email","phone","location","title","portfolioUrl","githubUrl","linkedinUrl","careerObjective",
  "studentId","rollNumber","dateOfBirth","gender","nationality",
  "degree","major","year","gpa","cgpa","expectedGraduation","department","batch","joiningYear","graduationYear",
  "skills","programmingLanguages","technologies","projects","achievements","certifications",
  "extracurricular","research","hackathons","resume","profileImage"
];

// Get student profile by ID
exports.getStudentProfile = async (req, res) => {
  try {
    const sessionUserId = req.session?.user?.id;
    if (!sessionUserId || sessionUserId !== req.params.studentId) {
      return res.status(403).json({ message: "Forbidden: You can only access your own profile." });
    }
    const student = await Student.findById(req.params.studentId).lean();
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    delete student.password;
    if (student.profilePic) {
      delete student.profilePic.data;
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update student profile
exports.updateStudentProfile = async (req, res) => {
  try {
    const sessionUserId = req.session?.user?.id;
    if (!sessionUserId || sessionUserId !== req.params.studentId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile." });
    }
    const updates = {};
    for (let key of allowedFields) {
      if (req.body.hasOwnProperty(key)) {
        updates[key] = req.body[key];
      }
    }
    if (!updates.name || !updates.email) {
      return res.status(400).json({ message: "Name and email are required." });
    }
    if (!isValidEmail(updates.email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }
    delete updates.password;

    const student = await Student.findByIdAndUpdate(
      req.params.studentId,
      updates,
      { new: true, runValidators: true }
    ).lean();

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    delete student.password;
    if (student.profilePic) {
      delete student.profilePic.data;
    }
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Upload profile picture to MongoDB (as Buffer)
exports.uploadProfilePic = async (req, res) => {
  try {
    const sessionUserId = req.session?.user?.id;
    if (!sessionUserId || sessionUserId !== req.params.studentId) {
      return res.status(403).json({ message: "Forbidden: You can only update your own profile." });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    student.profilePic = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
    // Optionally clear profileImage URL
    if (student.profileImage) student.profileImage = undefined;
    await student.save();
    const studentObj = student.toObject();
    delete studentObj.password;
    if (studentObj.profilePic) delete studentObj.profilePic.data;
    res.json(studentObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Serve the profile picture (Buffer, fallback to URL)
exports.getProfilePic = async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (student && student.profilePic && student.profilePic.data) {
      res.set('Content-Type', student.profilePic.contentType || 'image/jpeg');
      return res.send(student.profilePic.data);
    }
    if (student && student.profileImage) {
      return res.redirect(student.profileImage);
    }
    // Fallback: default image
    return res.redirect('https://plus.unsplash.com/premium_photo-1738637233381-6f857ce13eb9?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3R1ZGVudCUyMHByb2ZpbGUlMjBhbmltYXRlZHxlbnwwfHwwfHx8MA%3D%3D');
  } catch (err) {
    res.status(500).send('Server error');
  }
};