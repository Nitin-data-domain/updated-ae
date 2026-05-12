const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const {
  getPrograms, getAllPrograms, getProgram,
  createProgram, updateProgram, deleteProgram
} = require('../controllers/programController');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.get('/', getPrograms);
router.get('/admin', protect, getAllPrograms);

// Upload program image from local file
router.post('/upload-image', protect, uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/uploads/images/${req.file.filename}`;
  res.json({ success: true, url });
});

// Fetch image from external URL (e.g. Google Drive) and save locally
router.post('/fetch-image', protect, async (req, res) => {
  try {
    let { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

    // Auto-convert Google Drive share link formats
    const match1 = url.match(/drive\.google\.com\/file\/d\/([^/?\\s]+)/);
    const match2 = url.match(/drive\.google\.com\/open\?id=([^&\\s]+)/);
    const match3 = url.match(/drive\.google\.com\/uc\?.*id=([^&\\s]+)/);
    const fileId = (match1 && match1[1]) || (match2 && match2[1]) || (match3 && match3[1]);
    if (fileId) {
      url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*,*/*'
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      return res.status(400).json({
        success: false,
        message: `Could not fetch image (HTTP ${response.status}). Make sure the file is shared as "Anyone with the link".`
      });
    }

    const contentType = response.headers.get('content-type') || '';
    const allowedTypes = ['jpeg', 'jpg', 'png', 'webp', 'gif'];
    const matchedType = allowedTypes.find(t => contentType.includes(t));
    if (!matchedType) {
      return res.status(400).json({
        success: false,
        message: `URL does not point to a valid image (received: ${contentType || 'unknown'}).`
      });
    }

    const extMap = { jpeg: '.jpg', jpg: '.jpg', png: '.png', webp: '.webp', gif: '.gif' };
    const ext = extMap[matchedType] || '.jpg';
    const filename = `prog-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const imagesDir = path.join(__dirname, '..', 'uploads', 'images');
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(path.join(imagesDir, filename), buffer);

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ success: true, url: `${baseUrl}/uploads/images/${filename}` });
  } catch (err) {
    console.error('fetch-image error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch image: ' + err.message });
  }
});

router.get('/:slug', getProgram);
router.post('/', protect, createProgram);
router.put('/:id', protect, updateProgram);
router.delete('/:id', protect, deleteProgram);

module.exports = router;
