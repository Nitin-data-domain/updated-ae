const express = require('express');
const router = express.Router();
const {
  getPlacements, getAllPlacements, getPlacement, createPlacement, updatePlacement, deletePlacement
} = require('../controllers/placementController');
const { protect } = require('../middleware/auth');
const { uploadImage, cloudinary } = require('../middleware/upload');

router.get('/', getPlacements);
router.get('/admin', protect, getAllPlacements);
router.get('/:id', getPlacement);
router.post('/', protect, createPlacement);
router.put('/:id', protect, updatePlacement);
router.delete('/:id', protect, deletePlacement);

// Upload student photo → Cloudinary
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

    // ── Reject Google Drive FOLDER links (cannot be downloaded directly)
    if (url.includes('drive.google.com/drive/folders/')) {
      return res.status(400).json({
        success: false,
        message: '❌ That is a Google Drive FOLDER link. Please open the folder, right-click the specific IMAGE file → Share → "Anyone with link" → Copy link, then paste that link here.'
      });
    }

    // ── Auto-convert Google Drive share/file links to direct download
    const m1 = url.match(/drive\.google\.com\/file\/d\/([^/?\s]+)/);
    const m2 = url.match(/drive\.google\.com\/open\?id=([^&\s]+)/);
    const m3 = url.match(/drive\.google\.com\/uc\?.*id=([^&\s]+)/);
    const m4 = url.match(/drive\.google\.com\/thumbnail\?id=([^&\s]+)/);
    const fileId = (m1 && m1[1]) || (m2 && m2[1]) || (m3 && m3[1]) || (m4 && m4[1]);
    if (fileId) {
      // Use the export=download URL for Cloudinary to fetch
      url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    }

    // Upload directly from URL to Cloudinary (no local disk needed)
    const result = await cloudinary.uploader.upload(url, {
      folder: 'aharada-education',
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }],
      timeout: 60000,
    });

    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    console.error('[fetch-image] Error:', err.message);
    // Provide actionable error messages
    let message = err.message;
    if (err.message && err.message.includes('Resource not found')) {
      message = 'Could not load image from that URL. Make sure the Google Drive file sharing is set to "Anyone with link" and you copied the FILE link (not a folder link).';
    } else if (err.message && err.message.includes('Invalid image')) {
      message = 'The URL does not point to a valid image file. Please check the link and try again.';
    }
    res.status(500).json({ success: false, message });
  }
});


module.exports = router;
