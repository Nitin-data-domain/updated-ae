const express = require('express');
const router = express.Router();
const {
  getPrograms, getAllPrograms, getProgram,
  createProgram, updateProgram, deleteProgram
} = require('../controllers/programController');
const { protect } = require('../middleware/auth');
const { requirePermission } = require('../middleware/permissionMiddleware');
const { uploadImage, downloadExternalImage } = require('../middleware/upload');

router.get('/', getPrograms);
router.get('/admin', protect, requirePermission('programs'), getAllPrograms);

// Upload program image → GoDaddy Local Storage
router.post('/upload-image', protect, requirePermission('programs'), uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }
  const fileUrl = req.file.filename ? `/uploads/images/${req.file.filename}` : req.file.path;
  res.json({ success: true, url: fileUrl });
});

// Fetch image from external URL (e.g. Google Drive) → GoDaddy Local Storage
router.post('/fetch-image', protect, requirePermission('programs'), async (req, res) => {
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

router.get('/:slug', getProgram);
router.post('/', protect, requirePermission('programs'), createProgram);
router.put('/:id', protect, requirePermission('programs'), updateProgram);
router.delete('/:id', protect, requirePermission('programs'), deleteProgram);

module.exports = router;
