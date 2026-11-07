const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const productRoutes = require('./routes/productRoutes');
const advisorRoutes = require('./routes/advisorRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const kycRoutes = require('./routes/kycRoutes');
const orderRoutes = require('./routes/orderRoutes');
const partnerRoutes = require('./routes/partnerRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const mockRoutes = require('./routes/mockRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const serviceRoutes = require('./routes/serviceRoutes');

const app = express();

// Security HTTP headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Enable CORS
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Request rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // 500 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    data: null,
    error: { code: 'RATE_LIMIT_EXCEEDED' },
  },
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Project Udyam Digital API is healthy and operational.',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      telecomBrand: 'Airtel Business Enterprise Solutions',
    },
    error: null,
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/products', productRoutes);
app.use('/api/advisor', advisorRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/mock', mockRoutes);
app.use('/api/invoices', invoiceRoutes);

// Catch-all 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`,
    data: null,
    error: { code: 'ENDPOINT_NOT_FOUND' },
  });
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;

