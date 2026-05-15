/**
 * Kiran Printing Press - Server Entry Point
 * All errors print to console so Render logs always show them
 */

// ─── Step 1: Load env vars ───────────────────
require('dotenv').config();
require('express-async-errors');

// ─── Step 2: Validate critical env vars BEFORE any requires ─────
const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];
const missing  = REQUIRED.filter(k => !process.env[k]);
if (missing.length > 0) {
  console.error('\n❌ STARTUP FAILED — Missing environment variables:\n');
  missing.forEach(k => console.error(`   → ${k} is NOT set`));
  console.error('\n👉 Fix: Render Dashboard → Your Service → Environment → Add the missing variables\n');
  process.exit(1);
}

// ─── Step 3: Load modules (each logged so we see exactly where crash happens) ──
console.log('Loading modules...');

const express        = require('express');
const cors           = require('cors');
const helmet         = require('helmet');
const morgan         = require('morgan');
const compression    = require('compression');
const cookieParser   = require('cookie-parser');
const mongoSanitize  = require('express-mongo-sanitize');
const rateLimit      = require('express-rate-limit');
const path           = require('path');

console.log('Core modules loaded ✓');

const connectDB      = require('./config/db');
const logger         = require('./utils/logger');
const errorHandler   = require('./middlewares/errorHandler');
const { notFound }   = require('./middlewares/notFound');

console.log('Config & middleware loaded ✓');

// Route imports
const authRoutes         = require('./routes/auth.routes');
const productRoutes      = require('./routes/product.routes');
const categoryRoutes     = require('./routes/category.routes');
const orderRoutes        = require('./routes/order.routes');
const cartRoutes         = require('./routes/cart.routes');
const wishlistRoutes     = require('./routes/wishlist.routes');
const reviewRoutes       = require('./routes/review.routes');
const couponRoutes       = require('./routes/coupon.routes');
const uploadRoutes       = require('./routes/upload.routes');
const paymentRoutes      = require('./routes/payment.routes');
const bannerRoutes       = require('./routes/banner.routes');
const contactRoutes      = require('./routes/contact.routes');
const adminRoutes        = require('./routes/admin.routes');
const analyticsRoutes    = require('./routes/analytics.routes');
const notificationRoutes = require('./routes/notification.routes');
const cmsRoutes          = require('./routes/cms.routes');

console.log('All routes loaded ✓');

// ─── Step 4: Connect DB ──────────────────────
connectDB();

// ─── Step 5: Create Express app ─────────────
const app = express();

// Security
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts.' },
});
app.use('/api/v1/auth', authLimiter);

// CORS — allow frontend URL + all onrender.com subdomains
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // mobile/curl/health checks
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
    ].filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    if (origin.endsWith('.onrender.com')) return callback(null, true);
    // In development, allow all
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('tiny'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Health Check ────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success:     true,
    message:     'Kiran Printing Press API is running ✅',
    timestamp:   new Date().toISOString(),
    version:     '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── API Routes ──────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`,          authRoutes);
app.use(`${API}/products`,      productRoutes);
app.use(`${API}/categories`,    categoryRoutes);
app.use(`${API}/orders`,        orderRoutes);
app.use(`${API}/cart`,          cartRoutes);
app.use(`${API}/wishlist`,      wishlistRoutes);
app.use(`${API}/reviews`,       reviewRoutes);
app.use(`${API}/coupons`,       couponRoutes);
app.use(`${API}/uploads`,       uploadRoutes);
app.use(`${API}/payments`,      paymentRoutes);
app.use(`${API}/banners`,       bannerRoutes);
app.use(`${API}/contact`,       contactRoutes);
app.use(`${API}/admin`,         adminRoutes);
app.use(`${API}/analytics`,     analyticsRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/cms`,           cmsRoutes);

// ─── Error Handling ──────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`\n🖨️  Kiran Printing Press API running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
  logger.info(`📡 Health: http://localhost:${PORT}/health\n`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

module.exports = app;
