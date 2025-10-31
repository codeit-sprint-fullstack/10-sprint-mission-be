import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "../routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.use("/api/v1", routes);

export default app;