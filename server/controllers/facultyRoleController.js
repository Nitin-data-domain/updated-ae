const FacultyRole = require('../models/FacultyRole');

// Helper to normalize array fields from potential string input (e.g. textarea newlines)
const normalizeArray = (val) => {
  if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
  if (typeof val === 'string') {
    return val
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);
  }
  return [];
};

// @desc    Get all active faculty roles and responsibilities (Public)
// @route   GET /api/faculty-roles
exports.getFacultyRoles = async (req, res) => {
  try {
    const roles = await FacultyRole.findAll({
      where: { isActive: true },
      order: [
        ['order', 'ASC'],
        ['id', 'ASC'],
      ],
    });
    res.json({ success: true, count: roles.length, data: roles });
  } catch (error) {
    console.error('getFacultyRoles error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch faculty roles' });
  }
};

// @desc    Get all faculty roles (Admin)
// @route   GET /api/faculty-roles/admin
exports.getAllFacultyRolesAdmin = async (req, res) => {
  try {
    const roles = await FacultyRole.findAll({
      order: [
        ['order', 'ASC'],
        ['id', 'ASC'],
      ],
    });
    res.json({ success: true, count: roles.length, data: roles });
  } catch (error) {
    console.error('getAllFacultyRolesAdmin error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch faculty roles for admin' });
  }
};

// @desc    Create faculty role (Admin)
// @route   POST /api/faculty-roles
exports.createFacultyRole = async (req, res) => {
  try {
    const {
      title,
      designationLevel,
      category,
      icon,
      summary,
      responsibilities,
      expectations,
      order,
      isActive,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Role title is required' });
    }

    const newRole = await FacultyRole.create({
      title: title.trim(),
      designationLevel: designationLevel?.trim() || 'All Faculty Members',
      category: category?.trim() || 'Teaching & Curriculum',
      icon: icon?.trim() || 'FiBookOpen',
      summary: summary?.trim() || '',
      responsibilities: normalizeArray(responsibilities),
      expectations: normalizeArray(expectations),
      order: Number(order) || 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json({ success: true, data: newRole });
  } catch (error) {
    console.error('createFacultyRole error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating faculty role' });
  }
};

// @desc    Update faculty role (Admin)
// @route   PUT /api/faculty-roles/:id
exports.updateFacultyRole = async (req, res) => {
  try {
    const role = await FacultyRole.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Faculty role not found' });
    }

    const {
      title,
      designationLevel,
      category,
      icon,
      summary,
      responsibilities,
      expectations,
      order,
      isActive,
    } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (designationLevel !== undefined) updates.designationLevel = designationLevel.trim();
    if (category !== undefined) updates.category = category.trim();
    if (icon !== undefined) updates.icon = icon.trim();
    if (summary !== undefined) updates.summary = summary.trim();
    if (responsibilities !== undefined) updates.responsibilities = normalizeArray(responsibilities);
    if (expectations !== undefined) updates.expectations = normalizeArray(expectations);
    if (order !== undefined) updates.order = Number(order);
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    await role.update(updates);
    res.json({ success: true, data: role });
  } catch (error) {
    console.error('updateFacultyRole error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error updating faculty role' });
  }
};

// @desc    Delete faculty role (Admin)
// @route   DELETE /api/faculty-roles/:id
exports.deleteFacultyRole = async (req, res) => {
  try {
    const role = await FacultyRole.findByPk(req.params.id);
    if (!role) {
      return res.status(404).json({ success: false, message: 'Faculty role not found' });
    }

    await role.destroy();
    res.json({ success: true, message: 'Faculty role deleted successfully' });
  } catch (error) {
    console.error('deleteFacultyRole error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting faculty role' });
  }
};
