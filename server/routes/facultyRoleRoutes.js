const express = require('express');
const router = express.Router();
const {
  getFacultyRoles,
  getAllFacultyRolesAdmin,
  createFacultyRole,
  updateFacultyRole,
  deleteFacultyRole,
} = require('../controllers/facultyRoleController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionMiddleware');

// Public route
router.get('/', getFacultyRoles);

// Protected admin routes
router.get('/admin', protect, requirePermission('faculty-roles'), getAllFacultyRolesAdmin);
router.post('/', protect, requirePermission('faculty-roles'), createFacultyRole);
router.put('/:id', protect, requirePermission('faculty-roles'), updateFacultyRole);
router.delete('/:id', protect, requirePermission('faculty-roles'), deleteFacultyRole);

module.exports = router;
