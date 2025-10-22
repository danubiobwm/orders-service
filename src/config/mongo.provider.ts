import mongoose from 'mongoose';
import { logger } from '../common/logger';

export async function connectMongo() {
  const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/orders';
  try {
    await mongoose.connect(url);
    logger.info('MongoDB connected');
  } catch (err: any) {
    logger.error(`MongoDB connection error: ${err.message}`);
    throw err;
  }
}
