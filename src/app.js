import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import productsRouter from './routes/products.js';
import { notFoundHandler, errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'], allowedHeaders: ['Content-Type'] }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
	res.status(200).json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

app.use('/api/products', productsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;


