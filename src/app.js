import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { connectDatabase } from './config/database.js';

dotenv.config();

const app = express();

const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:5173', 
          'http://localhost:5174',
          'http://localhost:8080',
        ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS 정책에 의해 차단되었습니다.'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/products', productRoutes);
app.use('/articles', articleRoutes);
app.use('/comments', commentRoutes);

app.get('/', (req, res) => {
  res.send({
    success: true,
    message: 'PandaMarket API 서버가 실행 중입니다.',
  });
});

app.use((req, res) => {
  res.status(404).send({
    name: 'NotFound',
    message: '요청한 리소스를 찾을 수 없습니다.',
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDatabase();
    app.listen(PORT, () => {
      console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
    });
  } catch (error) {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  }
}

startServer();

export default app;

