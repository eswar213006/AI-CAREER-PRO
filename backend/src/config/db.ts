import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

let isUsingMongoDB = false;
const DATA_DIR = path.join(__dirname, '../../data');

export const getDbStatus = () => {
  return isUsingMongoDB ? 'MongoDB Atlas/Local' : 'JSON File-Based Fallback Database';
};

export const checkUseMongoDB = () => isUsingMongoDB;

// Ensure local data fallback directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const MAX_RETRIES = 2;
const TIMEOUT_MS = 10000; // 10s — gives Atlas enough time

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-careerprep';
  const isAtlas = mongoUri.includes('mongodb+srv');

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempting MongoDB connection (attempt ${attempt}/${MAX_RETRIES})...`);
      if (isAtlas) {
        console.log('  Mode: MongoDB Atlas (cloud)');
      } else {
        console.log('  Mode: Local MongoDB');
      }

      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: TIMEOUT_MS,
        connectTimeoutMS: TIMEOUT_MS,
        socketTimeoutMS: TIMEOUT_MS,
      });

      isUsingMongoDB = true;
      console.log(`✅ MongoDB connected successfully.`);
      return;
    } catch (error: any) {
      console.warn(`⚠️  MongoDB connection attempt ${attempt} failed: ${error.message}`);
      if (attempt < MAX_RETRIES) {
        console.log('   Retrying in 2 seconds...');
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  }

  // All retries exhausted — fall back to JSON DB
  console.warn('\n================================================================');
  console.warn('WARNING: Failed to connect to MongoDB after all retries.');
  console.warn('Falling back to local JSON File-Based Database at:');
  console.warn(DATA_DIR);
  if (mongoUri.includes('mongodb+srv')) {
    console.warn('\nTip: Verify your Atlas connection string in backend/.env');
    console.warn('     Also ensure your IP is whitelisted in Atlas Network Access.');
  }
  console.warn('================================================================\n');
  isUsingMongoDB = false;
};
