const express = require('express');
const router = express.Router();
const {
  getEvents, getAllEvents, createEvent, updateEvent, deleteEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const { uploadImage, downloadExternalImage } = require('../middleware/upload');

router.get('/', getEvents);
router.get('/admin', protect, getAllEvents);
router.post('/', protect, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

// Upload event photo → GoDaddy Local Storage
router.post('/upload-image', protect, uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image provided' });
  }
  const fileUrl = req.file.filename ? `/uploads/images/${req.file.filename}` : req.file.path;
  res.json({ success: true, url: fileUrl });
});

// Fetch image from external URL (Google Drive, etc.) → GoDaddy Local Storage
router.post('/fetch-image', protect, async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL required' });

    const localUrl = await downloadExternalImage(url);
    res.json({ success: true, url: localUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
