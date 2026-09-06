const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ── Cloudinary config ──────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dprlzu2ns',
  api_key:    String(process.env.CLOUDINARY_API_KEY || '124785717795421'),
  api_secret: process.env.CLOUDINARY_API_SECRET || 'MrOGGkP7c9Lqome6_uZQoPNf8HA',
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

// ── Memory storage for books and study materials ───────────────────────────
const bookStorage = multer.memoryStorage();

const bookFilter = (req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/epub+zip',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed',
  ];
  if (allowed.includes(file.mimetype) || file.originalname.match(/\.(pdf|epub|doc|docx|zip)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Allowed formats for books: PDF, EPUB, DOC, DOCX, ZIP'), false);
  }
};

const uploadBook = multer({
  storage: bookStorage,
  fileFilter: bookFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

module.exports = { uploadBrochure, uploadImage, uploadBook, cloudinary };

