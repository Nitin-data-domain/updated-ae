const Placement = require('../models/Placement');

// @desc    Get placements (paginated, public)
// @route   GET /api/placements?page=1&limit=15
exports.getPlacements = async (req, res) => {
  try {
    const page  = parseInt(req.query.page, 10)  || 1;
    const limit = parseInt(req.query.limit, 10) || 15;
    const offset = (page - 1) * limit;

    const { count, rows: placements } = await Placement.findAndCountAll({
      order: [
        ['order', 'ASC'],
        ['year', 'DESC'],
      ],
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: placements,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('getPlacements error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get ALL placements (admin, no pagination)
// @route   GET /api/placements/admin
exports.getAllPlacements = async (req, res) => {
  try {
    const placements = await Placement.findAll({
      order: [
        ['order', 'ASC'],
        ['year', 'DESC'],
      ],
    });
    res.status(200).json({ success: true, count: placements.length, data: placements });
  } catch (error) {
    console.error('getAllPlacements error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get single placement
// @route   GET /api/placements/:id
exports.getPlacement = async (req, res) => {
  try {
    const placement = await Placement.findByPk(req.params.id);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement not found' });
    }
    res.status(200).json({ success: true, data: placement });
  } catch (error) {
    console.error('getPlacement error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Create new placement
// @route   POST /api/placements
exports.createPlacement = async (req, res) => {
  try {
    const data = { package: 'N/A', ...req.body };
    const placement = await Placement.create(data);
    res.status(201).json({ success: true, data: placement });
  } catch (error) {
    console.error('createPlacement error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update placement
// @route   PUT /api/placements/:id
exports.updatePlacement = async (req, res) => {
  try {
    const data = { package: 'N/A', ...req.body };
    const placement = await Placement.findByPk(req.params.id);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement not found' });
    }
    await placement.update(data);
    res.status(200).json({ success: true, data: placement });
  } catch (error) {
    console.error('updatePlacement error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete placement
// @route   DELETE /api/placements/:id
exports.deletePlacement = async (req, res) => {
  try {
    const placement = await Placement.findByPk(req.params.id);
    if (!placement) {
      return res.status(404).json({ success: false, message: 'Placement not found' });
    }
    await placement.destroy();
    res.status(200).json({ success: true, message: 'Placement deleted' });
  } catch (error) {
    console.error('deletePlacement error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
