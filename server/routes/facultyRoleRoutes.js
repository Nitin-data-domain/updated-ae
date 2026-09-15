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

// Public route
router.get('/', getFacultyRoles);

// Protected admin routes
router.get('/admin', protect, getAllFacultyRolesAdmin);
router.post('/', protect, createFacultyRole);
router.put('/:id', protect, updateFacultyRole);
router.delete('/:id', protect, deleteFacultyRole);

module.exports = router;
