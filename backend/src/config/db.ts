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

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-careerprep';

  try {
    console.log('Attempting to connect to MongoDB...');
    // Set 3 second timeout for quick fallback
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    });
    isUsingMongoDB = true;
    console.log(`Successfully connected to MongoDB at ${mongoUri}`);
  } catch (error: any) {
    console.warn('\n================================================================');
    console.warn('WARNING: Failed to connect to MongoDB server.');
    console.warn(`Reason: ${error.message}`);
    console.warn('Falling back to local JSON File-Based Database at:');
    console.warn(DATA_DIR);
    console.warn('================================================================\n');
    isUsingMongoDB = false;
  }
};
