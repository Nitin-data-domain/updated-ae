const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ── Cloudinary config ──────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Cloudinary storage for images ──────────────────────────────────────────
const cloudinaryImageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'aharada-education',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'), false);
  }
};

// ── Memory storage for brochures (PDFs streamed to Cloudinary) ─────────────
const brochureStorage = multer.memoryStorage();

const brochureFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for brochures'), false);
  }
};

// ── Exported multer instances ──────────────────────────────────────────────
const uploadBrochure = multer({
  storage: brochureStorage,
  fileFilter: brochureFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

const uploadImage = multer({
  storage: cloudinaryImageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = { uploadBrochure, uploadImage, cloudinary };
