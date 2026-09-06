const Program = require('../models/Program');

// @desc    Get all programs
// @route   GET /api/programs
exports.getPrograms = async (req, res) => {
  try {
    const programs = await Program.findAll({
      where: { isActive: true },
      order: [['order', 'ASC']],
    });
    res.json({ success: true, count: programs.length, data: programs });
  } catch (error) {
    console.error('getPrograms error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all programs (admin - includes inactive)
// @route   GET /api/programs/admin
exports.getAllPrograms = async (req, res) => {
  try {
    const programs = await Program.findAll({
      order: [['order', 'ASC']],
    });
    res.json({ success: true, count: programs.length, data: programs });
  } catch (error) {
    console.error('getAllPrograms error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single program by slug
// @route   GET /api/programs/:slug
exports.getProgram = async (req, res) => {
  try {
    const program = await Program.findOne({
      where: { slug: req.params.slug, isActive: true },
    });
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    res.json({ success: true, data: program });
  } catch (error) {
    console.error('getProgram error:', error);
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
    let program = await Program.findByPk(req.params.id);
    if (!program) {
      // Fallback search by slug if slug was passed
      program = await Program.findOne({ where: { slug: req.params.id } });
    }
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    await program.update(req.body);
    res.json({ success: true, data: program });
  } catch (error) {
    console.error('Update program error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete program
// @route   DELETE /api/programs/:id
exports.deleteProgram = async (req, res) => {
  try {
    let program = await Program.findByPk(req.params.id);
    if (!program) {
      program = await Program.findOne({ where: { slug: req.params.id } });
    }
    if (!program) {
      return res.status(404).json({ success: false, message: 'Program not found' });
    }
    await program.destroy();
    res.json({ success: true, message: 'Program deleted' });
  } catch (error) {
    console.error('Delete program error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
