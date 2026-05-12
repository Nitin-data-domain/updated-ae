const Faculty = require('../models/Faculty');

// @desc    Get all faculty
// @route   GET /api/faculty
exports.getFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, count: faculty.length, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all faculty (admin)
// @route   GET /api/faculty/admin
exports.getAllFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.find().sort({ order: 1 });
    res.json({ success: true, count: faculty.length, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create faculty
// @route   POST /api/faculty
exports.createFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.create(req.body);
    res.status(201).json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update faculty
// @route   PUT /api/faculty/:id
exports.updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }
    res.json({ success: true, data: faculty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete faculty
// @route   DELETE /api/faculty/:id
exports.deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }
    res.json({ success: true, message: 'Faculty deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
