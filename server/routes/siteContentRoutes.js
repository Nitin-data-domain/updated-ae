const express = require('express');
const router  = express.Router();
const { CampusPhoto, CompanyPartner } = require('../models/SiteContent');
const { protect }  = require('../middleware/auth');
const { uploadImage, cloudinary } = require('../middleware/upload');

// ══════════════════════════════════════════════════════════════════════════════
// SHARED IMAGE UPLOAD  (reused by both sections)
// POST /api/site-content/upload-image
// ══════════════════════════════════════════════════════════════════════════════
router.post('/upload-image', protect, uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });
  res.json({ success: true, url: req.file.path });
});

// Fetch from external URL (e.g. Google Drive) → Cloudinary
router.post('/fetch-image', protect, async (req, res) => {
  try {
    let { url } = req.body;
    if (!url) return res.status(400).json({ success: false, message: 'URL is required' });

    const match1 = url.match(/drive\.google\.com\/file\/d\/([^/?\\s]+)/);
    const match2 = url.match(/drive\.google\.com\/open\?id=([^&\\s]+)/);
    const match3 = url.match(/drive\.google\.com\/uc\?.*id=([^&\\s]+)/);
    const fileId = (match1 && match1[1]) || (match2 && match2[1]) || (match3 && match3[1]);
    if (fileId) url = `https://drive.google.com/uc?export=download&id=${fileId}`;

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

// ══════════════════════════════════════════════════════════════════════════════
// CAMPUS PHOTOS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/site-content/campus-photos  (public)
router.get('/campus-photos', async (req, res) => {
  try {
    const photos = await CampusPhoto.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: photos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/site-content/campus-photos/admin  (protected)
router.get('/campus-photos/admin', protect, async (req, res) => {
  try {
    const photos = await CampusPhoto.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: photos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/site-content/campus-photos
router.post('/campus-photos', protect, async (req, res) => {
  try {
    const { imageUrl, caption, subCaption, order } = req.body;
    const photo = await CampusPhoto.create({ imageUrl, caption, subCaption, order: order || 0 });
    res.status(201).json({ success: true, data: photo });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/site-content/campus-photos/:id
router.put('/campus-photos/:id', protect, async (req, res) => {
  try {
    const photo = await CampusPhoto.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });
    res.json({ success: true, data: photo });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/site-content/campus-photos/:id
router.delete('/campus-photos/:id', protect, async (req, res) => {
  try {
    const photo = await CampusPhoto.findByIdAndDelete(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });
    res.json({ success: true, message: 'Photo deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// COMPANY PARTNERS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/site-content/company-partners  (public)
router.get('/company-partners', async (req, res) => {
  try {
    const partners = await CompanyPartner.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: partners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/site-content/company-partners/admin  (protected)
router.get('/company-partners/admin', protect, async (req, res) => {
  try {
    const partners = await CompanyPartner.find().sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: partners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/site-content/company-partners
router.post('/company-partners', protect, async (req, res) => {
  try {
    const { name, logoUrl, order } = req.body;
    const partner = await CompanyPartner.create({ name, logoUrl, order: order || 0 });
    res.status(201).json({ success: true, data: partner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/site-content/company-partners/:id
router.put('/company-partners/:id', protect, async (req, res) => {
  try {
    const partner = await CompanyPartner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });
    res.json({ success: true, data: partner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/site-content/company-partners/:id
router.delete('/company-partners/:id', protect, async (req, res) => {
  try {
    const partner = await CompanyPartner.findByIdAndDelete(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });
    res.json({ success: true, message: 'Partner deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
