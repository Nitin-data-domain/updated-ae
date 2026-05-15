const express = require('express');
const router = express.Router();
const {
  getEvents, getAllEvents, createEvent, updateEvent, deleteEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const { uploadImage, cloudinary } = require('../middleware/upload');

router.get('/', getEvents);
router.get('/admin', protect, getAllEvents);
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

// Upload event photo → Cloudinary
router.post('/upload-image', protect, uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image provided' });
  }
  // Cloudinary returns the permanent URL in req.file.path
  res.json({ success: true, url: req.file.path });
});

// Fetch image from external URL (Google Drive, etc.) → upload to Cloudinary
router.post('/fetch-image', protect, async (req, res) => {
  try {
    let { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL required' });

    const m1 = url.match(/drive\.google\.com\/file\/d\/([^/?\s]+)/);
    const m2 = url.match(/drive\.google\.com\/open\?id=([^&\s]+)/);
    const fileId = (m1 && m1[1]) || (m2 && m2[1]);
    if (fileId) url = `https://drive.google.com/uc?export=download&id=${fileId}`;

    // Upload directly from URL to Cloudinary (no local disk needed)
    const result = await cloudinary.uploader.upload(url, {
      folder: 'aharada-education',
      transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
    });

    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
