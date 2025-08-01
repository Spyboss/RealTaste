import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { config } from './config';
import { apiLimiter } from './middleware/rateLimiter';

// Import routes
import menuRoutes from './routes/menu';
import orderRoutes from './routes/orders';
import adminRoutes from './routes/admin';
import businessRoutes from './routes/business';
import paymentRoutes from './routes/payments';
import adminOrderRoutes from './routes/adminOrderRoutes';
import deliveryRoutes from './routes/delivery';

const app = express();

// Trust proxy for Fly.io deployment
app.set('trust proxy', true);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", config.supabase.url],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// API routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/delivery', deliveryRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'RealTaste API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// Serve static files from frontend build
const frontendPath = path.join(__dirname, '../frontend-dist');
app.use(express.static(frontendPath));

// Handle client-side routing - serve index.html for non-API routes
app.get('*', (req, res) => {
  // If it's an API route that doesn't exist, return 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      error: 'Endpoint not found',
      path: req.originalUrl
    });
  }
  
  // For all other routes, serve the frontend index.html
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', err);

  res.status(err.status || 500).json({
    success: false,
    error: config.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message,
    ...(config.nodeEnv !== 'production' && { stack: err.stack })
  });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 RealTaste API server running on port ${PORT}`);
  console.log(`📱 Environment: ${config.nodeEnv}`);
  console.log(`🏪 Restaurant: ${config.business.name}`);
  console.log(`⏰ Business Hours: ${config.business.openTime} - ${config.business.closeTime}`);

  if (config.nodeEnv === 'development') {
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`📋 Menu API: http://localhost:${PORT}/api/menu`);
  }
});

export default app;
