const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const pool = require('../portal/config/db');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'aharada_edu_jwt_secret_key_2024_secure',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// @desc    Login admin or portal staff
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required', message: 'Please provide email and password' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Try Admin (MySQL Sequelize)
    try {
      const user = await User.findOne({ where: { email: cleanEmail } });
      if (user) {
        const isMatch = await user.matchPassword(password);
        if (isMatch) {
          const token = generateToken(user.id);
          return res.json({
            success: true,
            message: 'Login successful.',
            token,
            user: {
              id: user.id,
              _id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          });
        }
      }
    } catch (adminErr) {
      console.warn('Admin DB lookup note:', adminErr.message);
    }

    // 2. Try Portal Staff / User (Neon PostgreSQL)
    try {
      const result = await pool.query(
        'SELECT user_id, name, email, phone, password, role, department, is_active, can_manage_staff FROM users WHERE LOWER(email) = LOWER($1)',
        [cleanEmail]
      );
      if (result.rows.length > 0) {
        const pUser = result.rows[0];
        if (!pUser.is_active) {
          return res.status(403).json({ success: false, error: 'Your account has been deactivated. Please contact the administration.', message: 'Account deactivated' });
        }

        const valid = await bcrypt.compare(password, pUser.password);
        if (valid) {
          const portalToken = jwt.sign(
            { user_id: pUser.user_id, email: pUser.email, role: pUser.role, name: pUser.name, can_manage_staff: !!pUser.can_manage_staff },
            process.env.JWT_SECRET || 'college_grievance_portal_secret_2026',
            { expiresIn: '24h' }
          );
          delete pUser.password;
          return res.json({
            success: true,
            message: 'Login successful.',
            token: portalToken,
            user: pUser,
          });
        }
      }
    } catch (portalErr) {
      console.warn('Portal DB lookup note:', portalErr.message);
    }

    return res.status(401).json({ success: false, error: 'Invalid email or password.', message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error', message: 'Server error' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'college_grievance_portal_secret_2026');
        if (decoded && decoded.user_id) {
          const result = await pool.query(
            'SELECT user_id, name, email, phone, role, department, is_active, can_manage_staff FROM users WHERE user_id = $1',
            [decoded.user_id]
          );
          if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
          return res.json({ success: true, user: result.rows[0] });
        }
      } catch (tokenErr) {
        // Continue to Admin check
      }
    }

    if (req.user && req.user.id) {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
      });
      return res.json({ success: true, user });
    }

    res.status(401).json({ success: false, message: 'Not authorized' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Register admin (protected - only superadmin)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const cleanEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ where: { email: cleanEmail } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email: cleanEmail,
      password,
      role: role || 'admin',
    });
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};
