import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'pandamarket';
const DB_USER = process.env.DB_USER || 'postgres';
const DB_PASSWORD = process.env.DB_PASSWORD || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: false,
});

export async function connectDatabase() {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL 연결 성공');
    
    await import('../models/index.js');
    
    await sequelize.sync({ alter: true });
    console.log('데이터베이스 동기화 완료');
  } catch (error) {
    console.error('PostgreSQL 연결 실패:', error);
    throw error;
  }
}

export async function disconnectDatabase() {
  try {
    await sequelize.close();
    console.log('PostgreSQL 연결 종료');
  } catch (error) {
    console.error('PostgreSQL 연결 종료 실패:', error);
    throw error;
  }
}

export { sequelize };
