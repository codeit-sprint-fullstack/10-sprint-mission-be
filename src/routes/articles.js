import express from "express"; // express 모듈 불러오기
import prisma from "../prismaClient.js"; // prisma 인스턴스 가져오기

const router = express.Router(); // 라우터 객체 생성

// 게시글 생성 (POST /articles)
router.post("/", async (req, res, next) => {
  try {
    const { title, content } = req.body || {};

    if (!title || !content) {
      return res
        .status(400)
        .send({ message: "title, content를 모두 작성해주세요~" });
    }

    const created = await prisma.article.create({
      data: {
        title,
        content,
      },
    });

    res.status(201).send(created);
  } catch (error) {
    next(error);
  }
});

// 게시글 목록 조회 (GET /articles)
router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page ?? "1", 10), 1);
    const pageSize = Math.min(
      Math.max(parseInt(req.query.pageSize ?? "10", 10), 1),
      30
    ); // 화면에서 보여지는 최대 개수는 10개지만, 혹시 모를 안정성을 위해 백에서는 여유를 둠!!

    const orderByParam = (req.query.orderBy || "recent").toLowerCase();
    const keyword = (req.query.keyword || "").trim();

    // 검색 조건
    const where = keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: "insensitive" } },
            { content: { contains: keyword, mode: "insensitive" } },
          ],
        }
      : {}; // mode: "insensitive"는 대소문자 무시~

    const totalCount = await prisma.article.count({ where });

    const list = await prisma.article.findMany({
      where,
      orderBy:
        orderByParam === "recent"
          ? { createdAt: "desc" }
          : { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const articles = list.map(({ id, title, createdAt, updatedAt }) => ({
      id,
      title,
      createdAt,
      updatedAt,
    }));

    res.status(200).send({ list: articles, totalCount });
  } catch (error) {
    next(error);
  }
});

// 게시글 상세 조회 (GET /articles/:id)
router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return res.status(404).send({ message: "Not Found" });
    }

    res.status(200).send(article);
  } catch (error) {
    next(error);
  }
});

// 게시글 수정 (PATCH /articles/:id)
router.patch("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { title, content } = req.body || {};

    if (!title && !content) {
      return res.status(400).send({ message: "수정할 사항이 없습니다" });
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
      },
    });

    res.status(200).send(updated);
  } catch (error) {
    //  Prisma: 조건에 맞는 레코드 없음!
    if (error.code === "P2025") {
      return res.status(404).send({ message: "수정할 게시글이 없습니다" });
    }
    next(error);
  }
});

// 게시글 삭제 (DELETE /articles/:id)
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    await prisma.article.delete({
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

// 댓글 목록 조회 (GET /articles/:articleId/comments)
router.get("/:articleId/comments", async (req, res, next) => {
  try {
    const articleId = Number(req.params.articleId);

    if (Number.isNaN(articleId)) {
      return res.status(400).send({ message: "articleId가 숫자가 아닙니다!" });
    }

    // 해당 게시글이 존재하는지 check
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return res.status(404).send({ message: "게시글을 찾을 수 없습니다☹️" });
    }

    const comments = await prisma.articleComment.findMany({
      where: { articleId },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).send({ list: comments });
  } catch (error) {
    next(error);
  }
});

// 댓글 생성 (POST /articles/:articleId/comments)
router.post("/:articleId/comments", async (req, res, next) => {
  try {
    const articleId = Number(req.params.articleId);
    const { content } = req.body || {};

    if (Number.isNaN(articleId)) {
      return res.status(400).send({ message: "articleId가 숫자가 아닙니다!" });
    }

    if (!content || !content.trim()) {
      return res.status(400).send({ message: "댓글 내용을 입력해주세요~" });
    }

    // 해당 게시글이 존재하는지 check
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return res.status(404).send({ message: "게시글을 찾을 수 없습니다☹️" });
    }

    const created = await prisma.articleComment.create({
      data: {
        content: content.trim(),
        articleId,
      },
    });

    res.status(201).send(created);
  } catch (error) {
    next(error);
  }
});

// 댓글 삭제 (DELETE /articles/:articleId/comments/:commentId)
router.delete("/:articleId/comments/:commentId", async (req, res, next) => {
  try {
    const articleId = Number(req.params.articleId);
    const commentId = Number(req.params.commentId);

    if (Number.isNaN(articleId) || Number.isNaN(commentId)) {
      return res.status(400).send({ message: "id가 숫자가 아닙니다!" });
    }

    // 해당 댓글이 해당 게시글에 속하는지 확인해야함 (없으면 안됨!)
    const comment = await prisma.articleComment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.articleId !== articleId) {
      return res.status(404).send({ message: "댓글을 찾을 수 없습니다☹️" });
    }

    await prisma.articleComment.delete({
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
