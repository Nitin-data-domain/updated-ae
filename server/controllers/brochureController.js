const Brochure = require('../models/Brochure');
const cloudinary = require('cloudinary').v2;

// @desc    Upload brochure
// @route   POST /api/brochures
exports.uploadBrochure = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const { title, linkedPage, linkedProgram } = req.body;

    // Upload PDF buffer to Cloudinary (raw resource type for non-image files)
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'aharada-brochures',
          public_id: `brochure-${Date.now()}`,
          format: 'pdf',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const brochure = await Brochure.create({
      title: title || req.file.originalname,
      fileUrl: uploadResult.secure_url,
      fileName: req.file.originalname,
      linkedPage: linkedPage || 'general',
      linkedProgram: linkedProgram || null,
      fileSize: `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`
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
    const query = { isActive: true };
    if (linkedPage) query.linkedPage = linkedPage;
    if (linkedProgram) query.linkedProgram = linkedProgram;

    const brochures = await Brochure.find(query).populate('linkedProgram', 'title slug');
    res.json({ success: true, count: brochures.length, data: brochures });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all brochures (admin)
// @route   GET /api/brochures/admin
exports.getAllBrochures = async (req, res) => {
  try {
    const brochures = await Brochure.find().populate('linkedProgram', 'title slug').sort({ createdAt: -1 });
    res.json({ success: true, count: brochures.length, data: brochures });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Download brochure
// @route   GET /api/brochures/download/:id
exports.downloadBrochure = async (req, res) => {
  try {
    const brochure = await Brochure.findById(req.params.id);
    if (!brochure) {
      return res.status(404).json({ success: false, message: 'Brochure not found' });
    }

    // Redirect to Cloudinary URL for direct download
    res.redirect(brochure.fileUrl);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update brochure
// @route   PUT /api/brochures/:id
exports.updateBrochure = async (req, res) => {
  try {
    const brochure = await Brochure.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!brochure) {
      return res.status(404).json({ success: false, message: 'Brochure not found' });
    }
    res.json({ success: true, data: brochure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete brochure
// @route   DELETE /api/brochures/:id
exports.deleteBrochure = async (req, res) => {
  try {
    const brochure = await Brochure.findById(req.params.id);
    if (!brochure) {
      return res.status(404).json({ success: false, message: 'Brochure not found' });
    }

    await Brochure.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Brochure deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
