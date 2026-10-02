const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist on GoDaddy hosting
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const imagesDir = ensureDir(path.join(__dirname, '../uploads/images'));
const booksDir = ensureDir(path.join(__dirname, '../uploads/books'));
const brochuresDir = ensureDir(path.join(__dirname, '../uploads/brochures'));

// ── Disk storage for images (saved directly on GoDaddy) ──────────────────────
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, imagesDir),
  filename: (req, file, cb) => {
    const clean = (file.originalname || 'image.jpg')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_');
    const ext = path.extname(clean) || '.jpg';
    const base = path.basename(clean, ext);
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(jpg|jpeg|png|webp|gif|svg)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF, SVG) are allowed'), false);
  }
};

// ── Disk storage for brochures (saved directly on GoDaddy) ───────────────────
const brochureStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, brochuresDir),
  filename: (req, file, cb) => {
    const clean = (file.originalname || 'brochure.pdf')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_');
    const ext = path.extname(clean) || '.pdf';
    const base = path.basename(clean, ext);
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

const brochureFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.originalname.match(/\.pdf$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed for brochures'), false);
  }
};

// ── Disk storage for books & study notes (saved directly on GoDaddy) ────────
const bookStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, booksDir),
  filename: (req, file, cb) => {
    const clean = (file.originalname || 'document.pdf')
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/_+/g, '_');
    const ext = path.extname(clean) || '.pdf';
    const base = path.basename(clean, ext);
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

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

const uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
});

const uploadBrochure = multer({
  storage: brochureStorage,
  fileFilter: brochureFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

const uploadBook = multer({
  storage: bookStorage,
  fileFilter: bookFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB
});

// Cloudinary client exported for backward compatibility / legacy assets
let cloudinary;
try {
  cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dprlzu2ns',
    api_key: String(process.env.CLOUDINARY_API_KEY || '124785717795421'),
    api_secret: process.env.CLOUDINARY_API_SECRET || 'MrOGGkP7c9Lqome6_uZQoPNf8HA',
  });
} catch (_) {}

// Helper to download an image from an external URL (Google Drive, direct link) and save locally to GoDaddy
async function downloadExternalImage(imageUrl) {
  let url = imageUrl;
  if (!url) throw new Error('URL is required');

  if (url.includes('drive.google.com/drive/folders/')) {
    throw new Error('That is a Google Drive folder link. Please share and copy the specific image file link.');
  }

  const match1 = url.match(/drive\.google\.com\/file\/d\/([^/?\s]+)/);
  const match2 = url.match(/drive\.google\.com\/open\?id=([^&\s]+)/);
  const match3 = url.match(/drive\.google\.com\/uc\?.*id=([^&\s]+)/);
  const match4 = url.match(/drive\.google\.com\/thumbnail\?id=([^&\s]+)/);
  const fileId = (match1 && match1[1]) || (match2 && match2[1]) || (match3 && match3[1]) || (match4 && match4[1]);
  if (fileId) {
    url = `https://drive.google.com/uc?export=download&id=${fileId}`;
  }

  try {
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type') || '';
    let ext = '.jpg';
    if (contentType.includes('png')) ext = '.png';
    else if (contentType.includes('webp')) ext = '.webp';
    else if (contentType.includes('gif')) ext = '.gif';
    else if (contentType.includes('svg')) ext = '.svg';
    else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = '.jpg';

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = `img_${Date.now()}${ext}`;
    const filePath = path.join(imagesDir, filename);
    fs.writeFileSync(filePath, buffer);
    return `/uploads/images/${filename}`;
  } catch (err) {
    if (cloudinary) {
      const result = await cloudinary.uploader.upload(url, {
        folder: 'aharada-education',
        transformation: [{ width: 1200, height: 800, crop: 'limit', quality: 'auto' }],
      });
      return result.secure_url;
    }
    throw err;
  }
}

module.exports = {
  uploadBrochure,
  uploadImage,
  uploadBook,
  cloudinary,
  downloadExternalImage,
  imagesDir,
  booksDir,
  brochuresDir,
};

