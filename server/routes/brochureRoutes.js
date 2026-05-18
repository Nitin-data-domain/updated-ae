const express = require('express');
const router = express.Router();
const {
  uploadBrochure, getBrochures, getAllBrochures,
  downloadBrochure, updateBrochure, deleteBrochure
} = require('../controllers/brochureController');
const { protect } = require('../middleware/auth');
const { uploadBrochure: upload } = require('../middleware/upload');

router.get('/', getBrochures);
router.get('/admin', protect, getAllBrochures);
router.get('/download/:id', downloadBrochure);
router.post('/', protect, uploadBrochure);
router.put('/:id', protect, updateBrochure);
router.delete('/:id', protect, deleteBrochure);

module.exports = router;
