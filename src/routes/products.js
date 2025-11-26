import express from "express"; // express 모듈 불러오기
import prisma from "../prismaClient.js"; // prisma 인스턴스 가져오기

const router = express.Router(); // 라우터 객체 생성

// 상품 등록 (POST /products)
router.post("/", async (req, res, next) => {
  try {
    const { name, description, price, tags = [] } = req.body || {};

    if (!name || !description || price === null || price === undefined) {
      return res
        .status(400)
        .send({ message: "name, description, price를 다 작성해주세요~" });
    }

    const created = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        tags,
      },
    });

    res.status(201).send(created);
  } catch (error) {
    next(error);
  }
});

// 상품 목록 조회 (GET /products)
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(req.query.pageSize ?? "10", 10), 1),
      30
    ); // 화면에서 보여지는 최대 개수는 10개지만, 혹시 모를 안정성을 위해 백에서는 여유를 둠!!
    const orderBy = (req.query.orderBy || "recent").toLowerCase();
    const keyword = (req.query.keyword || "").trim();

    // 검색 조건
    const where = keyword
      ? {
          OR: [
            { name: { contains: keyword, mode: "insensitive" } },
            { description: { contains: keyword, mode: "insensitive" } },
          ],
        }
      : {}; // mode: "insensitive"는 대소문자 무시~

    // 정렬 조건
    let sortOrder = { createdAt: "desc" };
    if (orderBy === "recent") {
      sortOrder = { createdAt: "desc" };
    }

    const totalCount = await prisma.product.count({ where });

    const list = await prisma.product.findMany({
      where,
      orderBy: sortOrder,
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // 프론트에서 기대하는 형태로 변환!
    const products = list.map(({ id, name, price, createdAt }) => ({
      id,
      name,
      price,
      createdAt,
      images: [],
    }));

    res.status(200).send({ list: products, totalCount });
  } catch (error) {
    next(error);
  }
});

// 상품 상세 조회 (GET /products/:id)
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).send({ message: "Not Found" });
    }

    const { name, description, price, tags, createdAt } = product;
    res.status(200).send({ id, name, description, price, tags, createdAt });
  } catch (error) {
    next(error);
  }
});

// 상품 수정 (PATCH /products/:id)
router.patch("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const updated = await prisma.product.update({
      where: { id },
      data: req.body,
    });

    res.status(200).send(updated);
  } catch (error) {
    if (error.code === "P2025") {
      // Prisma: 조건에 맞는 레코드 없음!
      return res.status(404).send({ message: "수정할 내용이 없습니다" });
    }
    next(error);
  }
});

// 상품 삭제 (DELETE /products/:id)
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await prisma.product.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).send({ message: "Not Found" });
    }
    next(error);
  }
});

// 댓글 목록 조회 (GET /products/:productId/comments)
router.get("/:productId/comments", async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);

    if (Number.isNaN(productId)) {
      return res.status(400).send({ message: "productId가 숫자가 아닙니다!" });
    }

    // 해당 상품이 존재하는지 check
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).send({ message: "상품을 찾을 수 없습니다☹️" });
    }

    const comments = await prisma.marketComment.findMany({
      where: { productId },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).send({ list: comments });
  } catch (error) {
    next(error);
  }
});

// 댓글 생성 (POST /products/:productId/comments)
router.post("/:productId/comments", async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const { content } = req.body || {};

    if (Number.isNaN(productId)) {
      return res.status(400).send({ message: "productId가 숫자가 아닙니다!" });
    }

    if (!content || !content.trim()) {
      return res.status(400).send({ message: "댓글 내용을 입력해주세요." });
    }

    // 해당 상품이 존재하는지 check
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).send({ message: "상품을 찾을 수 없습니다☹️" });
    }

    const created = await prisma.marketComment.create({
      data: {
        content: content.trim(),
        productId,
      },
    });

    res.status(201).send(created);
  } catch (error) {
    next(error);
  }
});

// 댓글 삭제 (DELETE /products/:productId/comments/:commentId)
router.delete("/:productId/comments/:commentId", async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const commentId = Number(req.params.commentId);

    if (Number.isNaN(productId) || Number.isNaN(commentId)) {
      return res.status(400).send({ message: "id가 숫자가 아닙니다!" });
    }

    // 해당 댓글이 해당 상품에 속하는지 확인해야함 (없으면 안됨!)
    const comment = await prisma.marketComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.productId !== productId) {
      return res.status(404).send({ message: "댓글을 찾을 수 없습니다☹️" });
    }

    await prisma.marketComment.delete({
      where: { id: commentId },
    });

    res.status(204).send();
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).send({ message: "삭제할 댓글이 없습니다!" });
    }
    next(error);
  }
});

export default router;
