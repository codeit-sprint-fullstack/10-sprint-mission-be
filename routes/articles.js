// routes/articles.js
import express from "express";
import prisma from "../prismaClient.js";

const router = express.Router();

/** 게시글 등록 */
router.post("/", async (req, res, next) => {
    try {
        const { title, content, user } = req.body;

        if (!title || !content || !user) {
            return res
                .status(400)
                .send({ message: "title, content, user는 필수입니다." });
        }

        const article = await prisma.article.create({
            data: { 
                title, 
                content, 
                user,
            },
        });

        res.status(201).send(article);
    } catch (err) {
        next(err);
    }
});

/** 게시글 목록 조회 (offset + 검색 + 최신순) */
router.get("/", async (req, res, next) => {
    try {
        const {
            offset = "0",
            limit = "10",
            order = "recent", // 지금은 recent만
            keyword,
        } = req.query;

        const skip = Number(offset);
        const take = Number(limit);

        if (Number.isNaN(skip) || Number.isNaN(take)) {
            return res
                .status(400)
                .send({ message: "offset과 limit는 숫자여야 합니다." });
        }

        const where =
            keyword && keyword !== ""
                ? {
                      OR: [
                          {
                              title: {
                                  contains: String(keyword),
                                  mode: "insensitive",
                              },
                          },
                          {
                              content: {
                                  contains: String(keyword),
                                  mode: "insensitive",
                              },
                          },
                      ],
                  }
                : {};

        const orderBy =
            order === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" }; // recent(최신순) 또는 oldest(오래된순)

        const [items, totalCount] = await Promise.all([
            prisma.article.findMany({
                where,
                orderBy,
                skip,
                take,
                select: {
                    id: true,
                    title: true,
                    content: true,
                    user: true,
                    likeCount: true,
                    createdAt: true,
                },
            }),
            prisma.article.count({ where }),
        ]);

        res.send({
            items,
            totalCount,
            offset: skip,
            limit: take,
        });
    } catch (err) {
        next(err);
    }
});

/** 게시글 단건 조회 */
router.get("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).send({ message: "id는 숫자여야 합니다." });
        }

        const article = await prisma.article.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                content: true,
                user: true,
                likeCount: true,
                createdAt: true,
            },
        });

        if (!article) {
            return res
                .status(404)
                .send({ message: "게시글을 찾을 수 없습니다." });
        }

        res.send(article);
    } catch (err) {
        next(err);
    }
});

/** 게시글 수정 */
router.patch("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { title, content } = req.body;

        if (Number.isNaN(id)) {
            return res.status(400).send({ message: "id는 숫자여야 합니다." });
        }
        if (!title && !content) {
            return res.status(400).send({
                message: "title 또는 content 중 하나는 있어야 합니다.",
            });
        }

        const article = await prisma.article.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(content && { content }),
            },
        });

        res.send(article);
    } catch (err) {
        // 없는 id 수정 시 P2025 날 수 있음
        if (err.code === "P2025") {
            return res
                .status(404)
                .send({ message: "게시글을 찾을 수 없습니다." });
        }
        next(err);
    }
});

/** 게시글 삭제 */
router.delete("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).send({ message: "id는 숫자여야 합니다." });
        }

        await prisma.article.delete({ where: { id } });
        return res.sendStatus(204); // 내용 없음
    } catch (err) {
        if (err.code === "P2025") {
            return res
                .status(404)
                .send({ message: "게시글을 찾을 수 없습니다." });
        }
        next(err);
    }
});

export default router;
