const express = require('express');
const router = express.Router();
const {
  getFaculty, getAllFaculty, createFaculty, updateFaculty, deleteFaculty
} = require('../controllers/facultyController');
const { protect } = require('../middleware/auth');
const { uploadImage, downloadExternalImage } = require('../middleware/upload');

router.get('/', getFaculty);
router.get('/admin', protect, getAllFaculty);
router.post('/', protect, createFaculty);
router.put('/:id', protect, updateFaculty);
router.delete('/:id', protect, deleteFaculty);

// Upload faculty photo → GoDaddy Local Storage
router.post('/upload-image', protect, uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }
  const fileUrl = req.file.filename ? `/uploads/images/${req.file.filename}` : req.file.path;
  res.json({ success: true, url: fileUrl });
});

// Fetch image from external URL (Google Drive, direct link) → GoDaddy Local Storage
router.post('/fetch-image', protect, async (req, res) => {
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
