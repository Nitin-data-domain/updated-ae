const Placement = require('../models/Placement');

// @desc    Get placements (paginated, public)
// @route   GET /api/placements?page=1&limit=15
exports.getPlacements = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 15;
    const skip  = (page - 1) * limit;

    const total      = await Placement.countDocuments();
    const placements = await Placement.find()
      .sort({ order: 1, year: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: placements,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get ALL placements (admin, no pagination)
// @route   GET /api/placements/admin
exports.getAllPlacements = async (req, res) => {
  try {
    const placements = await Placement.find().sort({ order: 1, year: -1 });
    res.status(200).json({ success: true, count: placements.length, data: placements });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single placement
// @route   GET /api/placements/:id
exports.getPlacement = async (req, res) => {
  try {
    const placement = await Placement.findById(req.params.id);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement not found' });
    }
    res.status(200).json({ success: true, data: placement });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create new placement
// @route   POST /api/placements
exports.createPlacement = async (req, res) => {
  try {
    const placement = await Placement.create(req.body);
    res.status(201).json({ success: true, data: placement });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update placement
// @route   PUT /api/placements/:id
exports.updatePlacement = async (req, res) => {
  try {
    const placement = await Placement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement not found' });
    }
    res.status(200).json({ success: true, data: placement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete placement
// @route   DELETE /api/placements/:id
exports.deletePlacement = async (req, res) => {
  try {
    const placement = await Placement.findByIdAndDelete(req.params.id);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement not found' });
    }
    res.status(200).json({ success: true, message: 'Placement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
