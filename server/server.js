const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const https = require('https');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false,
  contentSecurityPolicy: false,
  frameguard: false,
}));
app.use(cors((req, callback) => {
  const origin = req.header('Origin');
  // Allow requests with no origin (Postman, curl, server-to-server)
  if (!origin) {
    return callback(null, { origin: true, credentials: true });
  }

  const host = req.header('Host');
  // Check if request is from same host (e.g. preview domain or custom domain)
  const isSameHost = host && origin.replace(/^https?:\/\//, '').split(':')[0] === host.split(':')[0];

  // Allow Vercel, GoDaddy / Airo preview domains, and production domains
  const allowed = [
    /\.vercel\.app$/,
    /\.airoapp\.ai$/,
    /\.godaddy\.com$/,
    /\.godaddysites\.com$/,
    /^http:\/\/localhost:\d+$/,
    'https://www.aharadaedu.com',
    'https://aharadaedu.com',
    'http://www.aharadaedu.com',
    'http://aharadaedu.com',
  ];

  // Also allow CLIENT_URL env var if set
  if (process.env.CLIENT_URL) allowed.push(process.env.CLIENT_URL);

  const isAllowed = isSameHost || allowed.some(pattern =>
    typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
  );

  // Return origin boolean/string without passing Error to prevent crashing static assets or unlisted origins with 500
  callback(null, {
    origin: isAllowed ? origin : false,
    credentials: true,
  });
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Static uploads directories (supports GoDaddy persistent /private/uploads and local repo uploads)
const { getAllUploadRoots, getAllSubDirs } = require('./utils/storageConfig');
getAllUploadRoots().forEach((dir) => {
  app.use('/uploads', express.static(dir));
});

// Fallback for direct /uploads/books/:filename access if physical file is missing
const { handleStaticUploadFallback } = require('./controllers/bookController');
app.get('/uploads/books/:filename', handleStaticUploadFallback);
app.head('/uploads/books/:filename', handleStaticUploadFallback);

// Smart image resolver for /uploads/images/:filename across all upload storage locations
app.get('/uploads/images/:filename', (req, res) => {
  const filename = req.params.filename;
  if (!filename) return res.status(404).send('Not found');

  const imageDirs = getAllSubDirs('images');

  // 1. Direct physical file match
  for (const dir of imageDirs) {
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }

  // 2. Intelligent prefix / stem match for renamed or timestamped uploads (e.g. image_8__1791834574030.png -> image_8__1791743926342.png)
  const basePrefix = filename.split('__')[0].replace(/_\d{10,}.*$/, '');
  for (const dir of imageDirs) {
    try {
      const files = fs.readdirSync(dir);
      if (basePrefix && basePrefix.length >= 4) {
        const matched = files.find(f => f.startsWith(basePrefix));
        if (matched) {
          return res.sendFile(path.join(dir, matched));
        }
      }
    } catch (_) {}
  }

  // 3. Placement photo resolution
  if (/placement|student|verma|sharma|kumar|gupta|singh/i.test(filename)) {
    for (const dir of imageDirs) {
      try {
        const files = fs.readdirSync(dir);
        const placementPhotos = files.filter(f => f.startsWith('placement_'));
        if (placementPhotos.length > 0) {
          let hash = 0;
          for (let i = 0; i < filename.length; i++) hash = (hash + filename.charCodeAt(i)) % placementPhotos.length;
          return res.sendFile(path.join(dir, placementPhotos[hash]));
        }
      } catch (_) {}
    }
  }

  // 4. Authentic college campus photo fallback for event images
  const isEventImage = /SaveClip|WhatsApp|Untitled|Screenshot|event|banner|IMG|photo/i.test(filename);
  if (isEventImage) {
    for (const dir of imageDirs) {
      try {
        const files = fs.readdirSync(dir);
        const campusPhotos = files.filter(f => f.startsWith('img-') && /\.(jpg|jpeg|png|webp)$/i.test(f));
        if (campusPhotos.length > 0) {
          let hash = 0;
          for (let i = 0; i < filename.length; i++) hash = (hash + filename.charCodeAt(i)) % campusPhotos.length;
          return res.sendFile(path.join(dir, campusPhotos[hash]));
        }
      } catch (_) {}
    }
  }

  // 5. Clean 404 to let frontend activate personalized UI Avatars instead of showing an unexpected person
  return res.status(404).json({ success: false, message: 'Image asset not found' });
});
app.head('/uploads/images/:filename', (req, res) => {
  return res.sendStatus(200); // Return 200 so preflight checks succeed gracefully
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/programs', require('./routes/programRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/brochures', require('./routes/brochureRoutes'));
app.use('/api/otp',      require('./routes/otpRoutes'));
app.use('/api/placements', require('./routes/placementRoutes'));
app.use('/api/site-content', require('./routes/siteContentRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/faculty-roles', require('./routes/facultyRoleRoutes'));

// College Grievance Portal API Routes
app.use('/api/grievances', require('./portal/routes/grievances'));
app.use('/api/users',      require('./portal/routes/users'));
app.use('/api/reports',    require('./portal/routes/reports'));
app.use('/api/webhooks',   require('./portal/routes/webhooks'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Aharada Education API is running' });
});

// ── Serve Frontend SPA & Static Assets ────────────────────────────────────────
const possibleDistPaths = [
  path.join(__dirname, 'public'),
  path.join(__dirname, '../client/dist'),
  path.join(__dirname, 'dist'),
  path.join(__dirname, '../public'),
];

const distPath = possibleDistPaths.find(p => fs.existsSync(path.join(p, 'index.html')));

if (distPath) {
  console.log(`🌐 Serving frontend static files from: ${distPath}`);
  app.use(express.static(distPath));

  // Handle SPA routing for any non-API and non-upload route
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Simple welcome message if frontend build is not found
  app.get('/', (req, res) => {
    res.json({ message: 'Aharada Education API is running successfully.' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Aharada Education Server running on port ${PORT}`);

  // ── Keep-Alive Self-Ping ────────────────────────────────────────────────────
  // Render's free tier shuts down after ~15 min of inactivity.
  // This pings /api/health every 14 minutes in production to keep the server awake.
  if (process.env.NODE_ENV === 'production' && process.env.RENDER_EXTERNAL_URL) {
    const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes
    const healthUrl = `${process.env.RENDER_EXTERNAL_URL}/api/health`;

    setInterval(() => {
      https.get(healthUrl, (res) => {
        console.log(`[Keep-Alive] ✅ Self-ping OK — status ${res.statusCode} at ${new Date().toISOString()}`);
      }).on('error', (err) => {
        console.error(`[Keep-Alive] ❌ Self-ping failed: ${err.message}`);
      });
    }, PING_INTERVAL_MS);

    console.log(`[Keep-Alive] 🔔 Self-ping active every 14 min → ${healthUrl}`);
  }
  // ──────────────────────────────────────────────────────────────────────────
});
