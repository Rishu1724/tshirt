import mongoose from 'mongoose';

const RETRY_DELAY_MS = 10000;
const MAX_RETRIES = 5;
let retryCount = 0;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI environment variable is not set!');
    console.error('Please ensure MONGO_URI is configured in your environment.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    retryCount = 0; // Reset retry count on successful connection
  } catch (error) {
    retryCount++;
    console.error(`✗ MongoDB connection failed (attempt ${retryCount}/${MAX_RETRIES}): ${error.message}`);
    
    if (retryCount >= MAX_RETRIES) {
      console.error(`MongoDB connection failed after ${MAX_RETRIES} attempts. Exiting.`);
      process.exit(1);
    }
    
    console.log(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s...`);
    setTimeout(connectDB, RETRY_DELAY_MS);
  }
};

export default connectDB;
