const express = require('express');
const router = express.Router();
const {
  getFaculty, getAllFaculty, createFaculty, updateFaculty, deleteFaculty
} = require('../controllers/facultyController');
const { protect } = require('../middleware/auth');
const { uploadImage, cloudinary } = require('../middleware/upload');

router.get('/', getFaculty);
router.get('/admin', protect, getAllFaculty);
router.post('/', protect, createFaculty);
router.put('/:id', protect, updateFaculty);
router.delete('/:id', protect, deleteFaculty);

// Upload faculty photo → Cloudinary
router.post('/upload-image', protect, uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }
  // Cloudinary returns the permanent URL in req.file.path
  res.json({ success: true, url: req.file.path });
});

// Fetch image from external URL (e.g. Google Drive) → upload to Cloudinary
router.post('/fetch-image', protect, async (req, res) => {
  try {
    let { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

    // Auto-convert Google Drive share link formats
    const match1 = url.match(/drive\.google\.com\/file\/d\/([^/?\s]+)/);
    const match2 = url.match(/drive\.google\.com\/open\?id=([^&\s]+)/);
    const match3 = url.match(/drive\.google\.com\/uc\?.*id=([^&\s]+)/);
    const fileId = (match1 && match1[1]) || (match2 && match2[1]) || (match3 && match3[1]);
    if (fileId) url = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // Upload directly from URL to Cloudinary (no local disk needed)
    const result = await cloudinary.uploader.upload(url, {
      folder: 'aharada-education',
      transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
    });

    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    console.error('fetch-image error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch image: ' + err.message });
  }
});

module.exports = router;
