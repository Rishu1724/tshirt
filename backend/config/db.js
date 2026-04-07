import mongoose from 'mongoose';

const RETRY_DELAY_MS = 10000;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('MongoDB connection skipped: MONGO_URI is not set');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.log(`Retrying MongoDB connection in ${RETRY_DELAY_MS / 1000}s...`);
    setTimeout(connectDB, RETRY_DELAY_MS);
  }
};

export default connectDB;
