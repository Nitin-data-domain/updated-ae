const Program = require('../models/Program');

// @desc    Get all programs
// @route   GET /api/programs
exports.getPrograms = async (req, res) => {
  try {
    const programs = await Program.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, count: programs.length, data: programs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all programs (admin - includes inactive)
// @route   GET /api/programs/admin
exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.find().sort({ order: 1 });
    res.json({ success: true, count: programs.length, data: programs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single program by slug
// @route   GET /api/programs/:slug
exports.getProgram = async (req, res) => {
  try {
    const program = await Program.findOne({ slug: req.params.slug, isActive: true });
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    res.json({ success: true, data: program });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create program
// @route   POST /api/programs
exports.createProgram = async (req, res) => {
  try {
    const program = await Program.create(req.body);
    res.status(201).json({ success: true, data: program });
  } catch (error) {
    console.error('Create program error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update program
// @route   PUT /api/programs/:id
exports.updateProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    res.json({ success: true, data: program });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
exports.deleteProgram = async (req, res) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    res.json({ success: true, message: 'Program deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
