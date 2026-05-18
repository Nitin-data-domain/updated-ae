const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const https = require('https');
require('dotenv').config();

const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any *.vercel.app subdomain or specific production domains
    const allowed = [
      /\.vercel\.app$/,
      /^http:\/\/localhost:\d+$/,
    ];
    // Also allow CLIENT_URL env var if set
    if (process.env.CLIENT_URL) allowed.push(process.env.CLIENT_URL);
    const isAllowed = allowed.some(pattern =>
      typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
    );
    callback(isAllowed ? null : new Error('Not allowed by CORS'), isAllowed);
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/programs', require('./routes/programRoutes'));
app.use('/api/faculty', require('./routes/facultyRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/brochures', require('./routes/brochureRoutes'));
app.use('/api/placements', require('./routes/placementRoutes'));
app.use('/api/site-content', require('./routes/siteContentRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Aharada Education API is running' });
});

// Since frontend is hosted on Vercel, the backend acts purely as an API.
// Send a simple welcome message for root visits.
app.get('/', (req, res) => {
  res.json({ message: 'Aharada Education API is running successfully.' });
});

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
