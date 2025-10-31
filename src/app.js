import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/error.js";

const app = express();

// 기본 미들웨어
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// 헬스체크
app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// 버전드 API
app.use("/api/v1", routes);

// 404 & 에러 핸들러
app.use(notFound);
app.use(errorHandler);

export default app;
