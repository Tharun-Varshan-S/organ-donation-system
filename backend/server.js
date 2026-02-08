import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/error.js';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import sanitizeResponse from './middleware/sanitizeResponse.js';

// Route imports
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import hospitalRoutes from './routes/hospital.js';
import userRoutes from './routes/user.js';
import generalRoutes from './routes/route.js';

dotenv.config();

// (Skipping env loading logic for brevity, it's already there)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localEnvPath = path.join(__dirname, 'config', 'local.env.json');
try {
  if (fs.existsSync(localEnvPath)) {
    const localEnv = JSON.parse(fs.readFileSync(localEnvPath, 'utf8'));
    for (const [k, v] of Object.entries(localEnv)) {
      if (v != null && !process.env[k]) {
        process.env[k] = String(v);
      }
    }
  }
} catch (e) {
  console.warn(`⚠️  Failed to read ${localEnvPath}: ${e.message}`);
}

await connectDB();

const app = express();

// Global Middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
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

// Sanitize Response Middleware
app.use(sanitizeResponse);

// Logging Middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api', limiter);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Healthcare Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/admin', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/users', userRoutes);

if (generalRoutes) app.use('/', generalRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

process.on('unhandledRejection', (err) => {
  console.log(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

export default app;
