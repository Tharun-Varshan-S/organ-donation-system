import express from 'express';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/error.js';

// Route imports
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import hospitalRoutes from './routes/hospital.js';
import generalRoutes from './routes/route.js'; // Existing general routes
import setupMiddleware from './middlewares/setup.js'; // Existing setup if needed

dotenv.config();
console.log('DEBUG: MONGODB_URI exists:', !!process.env.MONGODB_URI);

// Connect to database
connectDB();

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});

// Middleware
app.use(limiter);
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Also runs existing setup if it contains more specific middleware
if (typeof setupMiddleware === 'function') {
  setupMiddleware(app);
}

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Healthcare Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/admin', authRoutes); // Auth routes under /api/admin as per incoming
app.use('/api/admin', adminRoutes); // Admin routes
app.use('/api/hospital', hospitalRoutes); // Hospital routes
app.use('/', generalRoutes); // Fallback to existing routes

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

export default app;
