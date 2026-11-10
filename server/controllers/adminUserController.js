const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @desc    Get all admin users
// @route   GET /api/admin-users
// @access  Super Admin only
exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin users' });
  }
};

// @desc    Create new admin user with granular permissions
// @route   POST /api/admin-users
// @access  Super Admin only
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, permissions, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ where: { email: cleanEmail } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists' });
    }

    const assignedRole = role === 'superadmin' ? 'superadmin' : 'admin';
    const assignedPermissions = assignedRole === 'superadmin'
      ? ['*']
      : Array.isArray(permissions) ? permissions : ['books'];

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: assignedRole,
      permissions: assignedPermissions,
      isActive: isActive !== false,
    });

    res.status(201).json({
      success: true,
      message: `Admin account for ${user.name} created successfully`,
      data: user,
    });
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create admin user' });
  }
};

// @desc    Update admin user details, role, or permissions
// @route   PUT /api/admin-users/:id
// @access  Super Admin only
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { name, email, password, role, permissions, isActive } = req.body;

    // Safety guard: cannot deactivate oneself or remove own superadmin role
    const currentUserId = req.user.id || req.user.user_id;
    if (user.id === currentUserId) {
      if (isActive === false) {
        return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
      }
      if (role && role !== 'superadmin') {
        return res.status(400).json({ success: false, message: 'You cannot revoke your own Super Admin role' });
      }
    }

    if (name && name.trim()) user.name = name.trim();

    if (email && email.trim()) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== user.email) {
        const conflict = await User.findOne({ where: { email: cleanEmail } });
        if (conflict) {
          return res.status(400).json({ success: false, message: 'Email is already in use by another account' });
        }
        user.email = cleanEmail;
      }
    }

    if (password && password.trim().length >= 6) {
      user.password = password.trim(); // Hook will hash it
    }

    if (role) {
      user.role = role === 'superadmin' ? 'superadmin' : 'admin';
    }

    if (permissions !== undefined) {
      user.permissions = user.role === 'superadmin'
        ? ['*']
        : Array.isArray(permissions) ? permissions : ['books'];
    }

    if (isActive !== undefined) {
      user.isActive = Boolean(isActive);
    }

    await user.save();

    res.json({
      success: true,
      message: `User ${user.name} updated successfully`,
      data: user,
    });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update admin user' });
  }
};

// @desc    Toggle active status of an admin user
// @route   PATCH /api/admin-users/:id/status
// @access  Super Admin only
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentUserId = req.user.id || req.user.user_id;
    if (user.id === currentUserId) {
      return res.status(400).json({ success: false, message: 'You cannot toggle the status of your own account' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `Account for ${user.name} has been ${user.isActive ? 'activated' : 'deactivated'}`,
      data: user,
    });
  } catch (error) {
    console.error('toggleUserStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
};

// @desc    Delete an admin user
// @route   DELETE /api/admin-users/:id
// @access  Super Admin only
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const currentUserId = req.user.id || req.user.user_id;
    if (user.id === currentUserId) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    // Ensure we don't delete the last superadmin
    if (user.role === 'superadmin') {
      const superAdminCount = await User.count({ where: { role: 'superadmin' } });
      if (superAdminCount <= 1) {
        return res.status(400).json({ success: false, message: 'Cannot delete the only remaining Super Admin account' });
      }
    }

    const userName = user.name;
    await user.destroy();

    res.json({
      success: true,
      message: `Admin user ${userName} deleted successfully`,
    });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};
