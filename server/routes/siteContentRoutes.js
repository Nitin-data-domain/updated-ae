const express = require('express');
const router  = express.Router();
const { CampusPhoto, CompanyPartner } = require('../models/SiteContent');
const { protect }  = require('../middleware/auth');
const { uploadImage, downloadExternalImage } = require('../middleware/upload');

// ══════════════════════════════════════════════════════════════════════════════
// SHARED IMAGE UPLOAD (reused by both sections)
// POST /api/site-content/upload-image
// ══════════════════════════════════════════════════════════════════════════════
router.post('/upload-image', protect, uploadImage.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' });
  const fileUrl = req.file.filename ? `/uploads/images/${req.file.filename}` : req.file.path;
  res.json({ success: true, url: fileUrl });
});

// Fetch from external URL (e.g. Google Drive) → GoDaddy Local Storage
router.post('/fetch-image', protect, async (req, res) => {
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

// ══════════════════════════════════════════════════════════════════════════════
// CAMPUS PHOTOS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/site-content/campus-photos (public)
router.get('/campus-photos', async (req, res) => {
  try {
    const photos = await CampusPhoto.findAll({
      where: { isActive: true },
      order: [
        ['order', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
    res.json({ success: true, data: photos });
  } catch (err) {
    console.error('get campus-photos error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/site-content/campus-photos/admin (protected)
router.get('/campus-photos/admin', protect, async (req, res) => {
  try {
    const photos = await CampusPhoto.findAll({
      order: [
        ['order', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
    res.json({ success: true, data: photos });
  } catch (err) {
    console.error('get campus-photos/admin error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/site-content/campus-photos
router.post('/campus-photos', protect, async (req, res) => {
  try {
    const { imageUrl, caption, subCaption, order } = req.body;
    const photo = await CampusPhoto.create({
      imageUrl,
      caption: caption || '',
      subCaption: subCaption || '',
      order: order || 0,
    });
    res.status(201).json({ success: true, data: photo });
  } catch (err) {
    console.error('create campus-photo error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/site-content/campus-photos/:id
router.put('/campus-photos/:id', protect, async (req, res) => {
  try {
    const photo = await CampusPhoto.findByPk(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });
    await photo.update(req.body);
    res.json({ success: true, data: photo });
  } catch (err) {
    console.error('update campus-photo error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/site-content/campus-photos/:id
router.delete('/campus-photos/:id', protect, async (req, res) => {
  try {
    const photo = await CampusPhoto.findByPk(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'Photo not found' });
    await photo.destroy();
    res.json({ success: true, message: 'Photo deleted' });
  } catch (err) {
    console.error('delete campus-photo error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// COMPANY PARTNERS
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/site-content/company-partners (public)
router.get('/company-partners', async (req, res) => {
  try {
    const partners = await CompanyPartner.findAll({
      where: { isActive: true },
      order: [
        ['order', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
    res.json({ success: true, data: partners });
  } catch (err) {
    console.error('get company-partners error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/site-content/company-partners/admin (protected)
router.get('/company-partners/admin', protect, async (req, res) => {
  try {
    const partners = await CompanyPartner.findAll({
      order: [
        ['order', 'ASC'],
        ['createdAt', 'ASC'],
      ],
    });
    res.json({ success: true, data: partners });
  } catch (err) {
    console.error('get company-partners/admin error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/site-content/company-partners
router.post('/company-partners', protect, async (req, res) => {
  try {
    const { name, logoUrl, order } = req.body;
    const partner = await CompanyPartner.create({
      name,
      logoUrl,
      order: order || 0,
    });
    res.status(201).json({ success: true, data: partner });
  } catch (err) {
    console.error('create company-partner error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/site-content/company-partners/:id
router.put('/company-partners/:id', protect, async (req, res) => {
  try {
    const partner = await CompanyPartner.findByPk(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });
    await partner.update(req.body);
    res.json({ success: true, data: partner });
  } catch (err) {
    console.error('update company-partner error:', err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/site-content/company-partners/:id
router.delete('/company-partners/:id', protect, async (req, res) => {
  try {
    const partner = await CompanyPartner.findByPk(req.params.id);
    if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });
    await partner.destroy();
    res.json({ success: true, message: 'Partner deleted' });
  } catch (err) {
    console.error('delete company-partner error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
