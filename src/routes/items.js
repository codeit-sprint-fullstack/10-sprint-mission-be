import { Router } from "express";
import { db } from "../db/memory.js";

const router = Router();

/**
 * [스프린트 미션 4 요구 반영용 베이스]
 * 요구사항에 맞게 아래 항목을 확장하세요:
 * - GET /items: 검색(q), 카테고리(category), 정렬(sort=price|createdAt, order=asc|desc), 페이지(page, size)
 * - POST /items: 인증(간단 헤더) 확인 후 생성
 * - GET /items/:id: 단건 조회
 * - PUT /items/:id: 소유자만 수정
 * - DELETE /items/:id: 소유자만 삭제
 */

/** 간단 인증 미들웨어 (헤더: x-user-id) */
function requireUser(req, res, next) {
  const userId = req.header("x-user-id");
  if (!userId) return res.status(401).json({ error: "Unauthorized: x-user-id header required" });
  const user = db.users.find(u => u.id === userId);
  if (!user) return res.status(401).json({ error: "Unauthorized: user not found" });
  req.user = user;
  next();
}

/** 리스트: 검색/정렬/페이지네이션 기본형 */
router.get("/", (req, res) => {
  let { q, category, sort = "createdAt", order = "desc", page = "1", size = "10" } = req.query;

  // 필터
  let result = [...db.items];
  if (q) {
    const k = String(q).toLowerCase();
    result = result.filter(it => it.title.toLowerCase().includes(k));
  }
  if (category) {
    result = result.filter(it => it.category === category);
  }

  // 정렬
  const sortable = ["price", "createdAt"];
  if (!sortable.includes(sort)) sort = "createdAt";
  const factor = order === "asc" ? 1 : -1;
  result.sort((a, b) => (a[sort] - b[sort]) * factor);

  // 페이지
  const p = Math.max(1, parseInt(page, 10) || 1);
  const s = Math.min(50, Math.max(1, parseInt(size, 10) || 10));
  const total = result.length;
  const start = (p - 1) * s;
  const paged = result.slice(start, start + s);

  res.json({
    page: p,
    size: s,
    total,
    items: paged
  });
});

/** 생성 */
router.post("/", requireUser, (req, res) => {
  const { title, price, category } = req.body ?? {};
  if (!title || typeof title !== "string") return res.status(400).json({ error: "title(string) required" });
  if (typeof price !== "number" || price < 0) return res.status(400).json({ error: "price(number>=0) required" });
  if (!category || typeof category !== "string") return res.status(400).json({ error: "category(string) required" });

  const item = {
    id: db.nextItemId++,
    title,
    price,
    category,
    sellerId: req.user.id,
    createdAt: Date.now()
  };
  db.items.push(item);
  res.status(201).json(item);
});

/** 단건 조회 */
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const item = db.items.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: "Item Not Found" });
  res.json(item);
});

/** 수정 (소유자만) */
router.put("/:id", requireUser, (req, res) => {
  const id = Number(req.params.id);
  const item = db.items.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: "Item Not Found" });
  if (item.sellerId !== req.user.id) return res.status(403).json({ error: "Forbidden" });

  const { title, price, category } = req.body ?? {};
  if (title !== undefined) {
    if (typeof title !== "string" || !title) return res.status(400).json({ error: "title must be non-empty string" });
    item.title = title;
  }
  if (price !== undefined) {
    if (typeof price !== "number" || price < 0) return res.status(400).json({ error: "price must be number>=0" });
    item.price = price;
  }
  if (category !== undefined) {
    if (typeof category !== "string" || !category) return res.status(400).json({ error: "category must be non-empty string" });
    item.category = category;
  }
  res.json(item);
});

/** 삭제 (소유자만) */
router.delete("/:id", requireUser, (req, res) => {
  const id = Number(req.params.id);
  const idx = db.items.findIndex(i => i.id === id);
  if (idx === -1) return res.status(404).json({ error: "Item Not Found" });

  const item = db.items[idx];
  if (item.sellerId !== req.user.id) return res.status(403).json({ error: "Forbidden" });
  db.items.splice(idx, 1);
  res.status(204).send();
});

export default router;
