const express = require('express');
const router = express.Router();
const {
  createEnquiry, getEnquiries, updateEnquiry, deleteEnquiry, getEnquiryStats, getProgramStats
} = require('../controllers/enquiryController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionMiddleware');

router.post('/', createEnquiry);
router.get('/', protect, requirePermission(['enquiries', 'leads']), getEnquiries);
router.get('/stats', protect, requirePermission(['enquiries', 'leads']), getEnquiryStats);
router.get('/program-stats', protect, requirePermission(['enquiries', 'leads']), getProgramStats);
router.put('/:id', protect, requirePermission(['enquiries', 'leads']), updateEnquiry);
router.delete('/:id', protect, requirePermission(['enquiries', 'leads']), deleteEnquiry);

module.exports = router;
