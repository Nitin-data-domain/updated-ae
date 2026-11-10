const express = require('express');
const router = express.Router();
const {
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
} = require('../controllers/adminUserController');
const { protect } = require('../middleware/auth');
const { requireSuperAdmin } = require('../middleware/permissionMiddleware');

// All admin user routes are strictly protected and require Super Admin privileges
router.use(protect);
router.use(requireSuperAdmin);

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.patch('/:id/status', toggleUserStatus);
router.delete('/:id', deleteUser);

module.exports = router;
