const express = require('express');
const router = express.Router();
const {
  getEvents, getAllEvents, createEvent, updateEvent, deleteEvent
} = require('../controllers/eventController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { uploadImage, downloadExternalImage } = require('../middleware/upload');

router.get('/', getEvents);
router.get('/admin', protect, requirePermission('events'), getAllEvents);
router.post('/', protect, requirePermission('events'), createEvent);
router.put('/:id', protect, requirePermission('events'), updateEvent);
router.delete('/:id', protect, requirePermission('events'), deleteEvent);

// Upload event photo → GoDaddy Local Storage
router.post('/upload-image', protect, requirePermission('events'), uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image provided' });
  }
  const fileUrl = req.file.filename ? `/uploads/images/${req.file.filename}` : req.file.path;
  res.json({ success: true, url: fileUrl });
});

// Fetch image from external URL (Google Drive, etc.) → GoDaddy Local Storage
router.post('/fetch-image', protect, requirePermission('events'), async (req, res) => {
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
