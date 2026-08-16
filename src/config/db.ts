import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '@/utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.DATABASE_URL);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB Disconnected');
};
