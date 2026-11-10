const express = require('express');
const router = express.Router();
const {
  getFaculty, getAllFaculty, createFaculty, updateFaculty, deleteFaculty
} = require('../controllers/facultyController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { uploadImage, downloadExternalImage } = require('../middleware/upload');

router.get('/', getFaculty);
router.get('/admin', protect, requirePermission('faculty'), getAllFaculty);
router.post('/', protect, requirePermission('faculty'), createFaculty);
router.put('/:id', protect, requirePermission('faculty'), updateFaculty);
router.delete('/:id', protect, requirePermission('faculty'), deleteFaculty);

// Upload faculty photo → GoDaddy Local Storage
router.post('/upload-image', protect, requirePermission('faculty'), uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }
  const fileUrl = req.file.filename ? `/uploads/images/${req.file.filename}` : req.file.path;
  res.json({ success: true, url: fileUrl });
});

// Fetch image from external URL (Google Drive, direct link) → GoDaddy Local Storage
router.post('/fetch-image', protect, requirePermission('faculty'), async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

    const localUrl = await downloadExternalImage(url);
    res.json({ success: true, url: localUrl });
  } catch (err) {
    console.error('fetch-image error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch image: ' + err.message });
  }
});

module.exports = router;
