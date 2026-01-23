import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

// Optional local dev config file (useful when `.env` files are blocked/ignored)
// Create: `backend/config/local.env.json`
// Shape: { "MONGODB_URI": "...", "FRONTEND_URL": "...", "PORT": "5000" }
const localEnvPath = path.join(__dirname, 'local.env.json');
let localEnv = {};
try {
  if (fs.existsSync(localEnvPath)) {
    localEnv = JSON.parse(fs.readFileSync(localEnvPath, 'utf8'));
  }
} catch (e) {
  console.warn(`⚠️  Failed to read ${localEnvPath}: ${e.message}`);
}

const connectDB = async (retryCount = 5) => {
  const uri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI ||
    localEnv.MONGODB_URI ||
    localEnv.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 30000, // 30 seconds for server selection
    socketTimeoutMS: 45000, // 45 seconds for socket operations
    connectTimeoutMS: 30000, // 30 seconds for initial connection
    retryWrites: true,
    retryReads: true,
    // Additional options for better connection handling
    maxPoolSize: 10,
    minPoolSize: 1,
  };

  while (retryCount > 0) {
    try {
      console.log(`🔌 Attempting to connect to MongoDB... (${retryCount} retries left)`);
      const conn = await mongoose.connect(uri, options);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      retryCount--;
      console.error(`❌ Database connection failed: ${error.message}`);

      if (retryCount === 0) {
        console.error('💥 All retry attempts failed. Exiting...');
        process.exit(1);
      }

      console.log('⏳ Retrying in 5 seconds...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

export default connectDB;

