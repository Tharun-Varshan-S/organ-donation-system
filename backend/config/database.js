import mongoose from 'mongoose';
<<<<<<< HEAD

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
=======
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async (retryCount = 5) => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
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
>>>>>>> ec10091 (Implemented Admin Dashboard UI enhancements)
};

export default connectDB;

