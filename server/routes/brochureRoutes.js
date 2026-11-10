const express = require('express');
const router = express.Router();
const {
  uploadBrochure, getBrochures, getAllBrochures,
  downloadBrochure, updateBrochure, deleteBrochure
} = require('../controllers/brochureController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { uploadBrochure: upload } = require('../middleware/upload');

router.get('/', getBrochures);
router.get('/admin', protect, requirePermission('brochures'), getAllBrochures);
router.get('/download/:id', downloadBrochure);
router.post('/', protect, requirePermission('brochures'), uploadBrochure);
router.put('/:id', protect, requirePermission('brochures'), updateBrochure);
router.delete('/:id', protect, requirePermission('brochures'), deleteBrochure);

module.exports = router;
