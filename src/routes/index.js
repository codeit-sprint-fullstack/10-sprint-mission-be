import { Router } from "express";
import items from "./items.js";

const router = Router();

// 핑
router.get("/ping", (_req, res) => {
  res.json({ message: "pong" });
});

// 아이템 라우트
router.use("/items", items);

export default router;
