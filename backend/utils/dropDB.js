const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = require('../config/database');

const dropDatabase = async () => {
  try {
    await connectDB();
    
    console.log('🗑️  Dropping database...');
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Database dropped successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error dropping database:', error);
    process.exit(1);
  }
};

dropDatabase();