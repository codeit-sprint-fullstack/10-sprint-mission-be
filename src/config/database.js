import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pandamarket';

export async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB 연결 성공');
  } catch (error) {
    console.error('MongoDB 연결 실패:', error);
    throw error;
  }
}

export async function disconnectDatabase() {
  try {
    await mongoose.disconnect();
    console.log('MongoDB 연결 종료');
  } catch (error) {
    console.error('MongoDB 연결 종료 실패:', error);
    throw error;
  }
}

