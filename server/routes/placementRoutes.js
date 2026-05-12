const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const {
  getPlacements, getAllPlacements, getPlacement, createPlacement, updatePlacement, deletePlacement
} = require('../controllers/placementController');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.get('/', getPlacements);
router.get('/admin', protect, getAllPlacements);
router.get('/:id', getPlacement);
router.post('/', protect, createPlacement);
router.put('/:id', protect, updatePlacement);
router.delete('/:id', protect, deletePlacement);

// Upload student photo → returns local URL
router.post('/upload-image', protect, uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image provided' });
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  res.json({ success: true, url: `${baseUrl}/uploads/images/${req.file.filename}` });
});

// Fetch image from external URL (Google Drive, etc.)
router.post('/fetch-image', protect, async (req, res) => {
  try {
    let { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL required' });

    // Auto-convert Google Drive share links
    const m1 = url.match(/drive\.google\.com\/file\/d\/([^/?\s]+)/);
    const m2 = url.match(/drive\.google\.com\/open\?id=([^&\s]+)/);
    const m3 = url.match(/drive\.google\.com\/uc\?.*id=([^&\s]+)/);
    const fileId = (m1 && m1[1]) || (m2 && m2[1]) || (m3 && m3[1]);
    if (fileId) url = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'image/*' },
      redirect: 'follow'
    });
    if (!response.ok) return res.status(400).json({ success: false, message: `HTTP ${response.status}` });

    const ct = response.headers.get('content-type') || '';
    const ext = ct.includes('png') ? '.png' : ct.includes('webp') ? '.webp' : '.jpg';
    const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    const imagesDir = path.join(__dirname, '..', 'uploads', 'images');
    if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir, { recursive: true });
    fs.writeFileSync(path.join(imagesDir, filename), Buffer.from(await response.arrayBuffer()));

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.json({ success: true, url: `${baseUrl}/uploads/images/${filename}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
