const express = require('express');
const router = express.Router();
const {
  getPlacements, getAllPlacements, getPlacement, createPlacement, updatePlacement, deletePlacement
} = require('../controllers/placementController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { uploadImage, downloadExternalImage } = require('../middleware/upload');

router.get('/', getPlacements);
router.get('/admin', protect, requirePermission('placements'), getAllPlacements);
router.get('/:id', getPlacement);
router.post('/', protect, requirePermission('placements'), createPlacement);
router.put('/:id', protect, requirePermission('placements'), updatePlacement);
router.delete('/:id', protect, requirePermission('placements'), deletePlacement);

// Upload student photo → GoDaddy Local Storage
router.post('/upload-image', protect, requirePermission('placements'), uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image provided' });
  }
  const fileUrl = req.file.filename ? `/uploads/images/${req.file.filename}` : req.file.path;
  res.json({ success: true, url: fileUrl });
});

// Fetch image from external URL (Google Drive, etc.) → GoDaddy Local Storage
router.post('/fetch-image', protect, requirePermission('placements'), async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL required' });

    const localUrl = await downloadExternalImage(url);
    res.json({ success: true, url: localUrl });
  } catch (err) {
    console.error('[fetch-image] Error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
