// Middleware for role-based and granular permission control

/**
 * Checks if authenticated user has permission to access a specific feature/module.
 * Super Admin ('superadmin') always bypasses and has full access.
 * Sub-admins must have the specific permission in their `permissions` array or '*'.
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (req.user.isActive === false || req.user.is_active === false) {
      return res.status(403).json({ success: false, message: 'Your admin account has been deactivated.' });
    }

    // Super Admin has full unrestricted rights
    if (req.user.role === 'superadmin') {
      return next();
    }

    // Extract user permissions
    let perms = req.user.permissions;
    if (typeof perms === 'string') {
      try {
        perms = JSON.parse(perms);
      } catch (_) {
        perms = [perms];
      }
    }
    if (!Array.isArray(perms)) {
      perms = [];
    }

    if (perms.includes('*') || perms.includes(permission)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. You do not have permission to manage '${permission}'. Please contact the Super Admin.`,
    });
  };
};

/**
 * Strict middleware for Super Admin only actions (such as managing other admin users or approving notes).
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required' });
  }

  if (req.user.isActive === false || req.user.is_active === false) {
    return res.status(403).json({ success: false, message: 'Your admin account has been deactivated.' });
  }

  if (req.user.role === 'superadmin') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied. Super Admin privileges required to perform this action.',
  });
};

module.exports = {
  requirePermission,
  requireSuperAdmin,
};

