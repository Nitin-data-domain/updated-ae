const Brochure = require('../models/Brochure');
const Program = require('../models/Program');

// @desc    Upload brochure link
// @route   POST /api/brochures
exports.uploadBrochure = async (req, res) => {
  try {
    const { title, fileUrl, linkedPage, linkedProgram, linkedProgramId, fileSize, fileName } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ success: false, message: 'Please provide a file URL or Google Drive link' });
    }

    const programFk = linkedProgramId || linkedProgram || null;

    const brochure = await Brochure.create({
      title: title || 'Brochure Link',
      fileUrl,
      fileName: fileName || '',
      fileSize: fileSize || '',
      linkedPage: linkedPage || 'general',
      linkedProgramId: programFk ? parseInt(programFk, 10) : null,
      isActive: true,
    });

    res.status(201).json({ success: true, data: brochure });
  } catch (error) {
    console.error('Upload brochure error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all brochures
// @route   GET /api/brochures
exports.getBrochures = async (req, res) => {
  try {
    const { linkedPage, linkedProgram } = req.query;
    const where = { isActive: true };
    if (linkedPage) where.linkedPage = linkedPage;
    if (linkedProgram) where.linkedProgramId = linkedProgram;

    const brochures = await Brochure.findAll({
      where,
      include: [
        {
          model: Program,
          as: 'linkedProgram',
          attributes: ['id', 'title', 'slug'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, count: brochures.length, data: brochures });
  } catch (error) {
    console.error('getBrochures error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all brochures (admin)
// @route   GET /api/brochures/admin
exports.getAllBrochures = async (req, res) => {
  try {
    const brochures = await Brochure.findAll({
      include: [
        {
          model: Program,
          as: 'linkedProgram',
          attributes: ['id', 'title', 'slug'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, count: brochures.length, data: brochures });
  } catch (error) {
    console.error('getAllBrochures error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Download brochure
// @route   GET /api/brochures/download/:id
exports.downloadBrochure = async (req, res) => {
  try {
    const brochure = await Brochure.findByPk(req.params.id);
    if (!brochure) {
      return res.status(404).json({ success: false, message: 'Brochure not found' });
    }
    res.redirect(brochure.fileUrl);
  } catch (error) {
    console.error('downloadBrochure error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update brochure
// @route   PUT /api/brochures/:id
exports.updateBrochure = async (req, res) => {
  try {
    const brochure = await Brochure.findByPk(req.params.id);
    if (!brochure) {
      return res.status(404).json({ success: false, message: 'Brochure not found' });
    }

    const data = { ...req.body };
    if (data.linkedProgram && !data.linkedProgramId) {
      data.linkedProgramId = parseInt(data.linkedProgram, 10);
    }

    await brochure.update(data);
    res.json({ success: true, data: brochure });
  } catch (error) {
    console.error('updateBrochure error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete brochure
// @route   DELETE /api/brochures/:id
exports.deleteBrochure = async (req, res) => {
  try {
    const brochure = await Brochure.findByPk(req.params.id);
    if (!brochure) {
      return res.status(404).json({ success: false, message: 'Brochure not found' });
    }
    await brochure.destroy();
    res.json({ success: true, message: 'Brochure deleted' });
  } catch (error) {
    console.error('deleteBrochure error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
