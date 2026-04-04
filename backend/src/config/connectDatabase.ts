import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

export const connectDB = async (): Promise<void> => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(`MONGODB_URI is not defined`);
    }

    const connect = await mongoose.connect(process.env.MONGO_URI);
    logger.info(`Mongodb connected : ${connect.connection.host}`);
  } catch (error) {
    logger.error(`Error from DB :${error}`);
  }
};
