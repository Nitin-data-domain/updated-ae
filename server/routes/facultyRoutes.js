const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const {
  getFaculty, getAllFaculty, createFaculty, updateFaculty, deleteFaculty
} = require('../controllers/facultyController');
const { protect } = require('../middleware/auth');
const { uploadImage } = require('../middleware/upload');

router.get('/', getFaculty);
router.get('/admin', protect, getAllFaculty);
router.post('/', protect, createFaculty);
router.put('/:id', protect, updateFaculty);
router.delete('/:id', protect, deleteFaculty);

// Upload faculty photo from local file
router.post('/upload-image', protect, uploadImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/uploads/images/${req.file.filename}`;
  res.json({ success: true, url });
});

// Fetch image from external URL (e.g. Google Drive) and save locally
// Auto-converts Google Drive share links to direct download links
router.post('/fetch-image', protect, async (req, res) => {
  try {
    let { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

    // ── Auto-convert Google Drive share link formats ──
    // Format 1: https://drive.google.com/file/d/FILE_ID/view?...
    const match1 = url.match(/drive\.google\.com\/file\/d\/([^/?\s]+)/);
    // Format 2: https://drive.google.com/open?id=FILE_ID
    const match2 = url.match(/drive\.google\.com\/open\?id=([^&\s]+)/);
    // Format 3: already a uc?id= link
    const match3 = url.match(/drive\.google\.com\/uc\?.*id=([^&\s]+)/);

    const fileId = (match1 && match1[1]) || (match2 && match2[1]) || (match3 && match3[1]);
    if (fileId) {
      url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    // Download the image server-side (no CORS issue)
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
        message: `URL does not point to a valid image (received: ${contentType || 'unknown'}). Make sure the file is an image and shared publicly.`
      });
    }

    // Determine extension
    const extMap = { jpeg: '.jpg', jpg: '.jpg', png: '.png', webp: '.webp', gif: '.gif' };
    const ext = extMap[matchedType] || '.jpg';

    // Save to uploads/images/
    const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
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

module.exports = router;
