// routes/articleComments.js
import express from "express";
import prisma from "../prismaClient.js";

const router = express.Router();

/** 자유게시판 댓글 등록 */
router.post("/articles/:articleId/comments", async (req, res, next) => {
    try {
        const articleId = Number(req.params.articleId);
        const { content, user } = req.body;

        if (Number.isNaN(articleId)) {
            return res
                .status(400)
                .send({ message: "articleId는 숫자여야 합니다." });
        }
        if (!content) {
            return res.status(400).send({ message: "content는 필수입니다." });
        }
        if (!user) {
            return res.status(400).send({ message: "user는 필수입니다." });
        }

        const article = await prisma.article.findUnique({
            where: { id: articleId },
        });
        if (!article) {
            return res
                .status(404)
                .send({ message: "게시글을 찾을 수 없습니다." });
        }

        const comment = await prisma.articleComment.create({
            data: {
                content,
                user,
                articleId,
            },
        });

        res.status(201).send(comment);
    } catch (err) {
        next(err);
    }
});

/** 자유게시판 댓글 목록 (cursor 기반 pagination) */
router.get("/articles/:articleId/comments", async (req, res, next) => {
    try {
        const articleId = Number(req.params.articleId);
        const { cursor, limit = "10" } = req.query;

        if (Number.isNaN(articleId)) {
            return res
                .status(400)
                .send({ message: "articleId는 숫자여야 합니다." });
        }

        const take = Number(limit);
        if (Number.isNaN(take)) {
            return res
                .status(400)
                .send({ message: "limit는 숫자여야 합니다." });
        }

        const queryOptions = {
            where: { articleId },
            orderBy: { id: "asc" }, // createdAt 기준으로 바꿔도 됨
            take: take + 1,
            select: {
                id: true,
                content: true,
                user: true,
                createdAt: true,
            },
        };

        if (cursor) {
            queryOptions.cursor = { id: Number(cursor) };
            queryOptions.skip = 1; // cursor 자신은 건너뛰기
        }

        const comments = await prisma.articleComment.findMany(queryOptions);

        let nextCursor = null;
        if (comments.length > take) {
            const nextItem = comments.pop();
            nextCursor = nextItem.id;
        }

        res.send({
            items: comments,
            nextCursor,
        });
    } catch (err) {
        next(err);
    }
});

/** 자유게시판 댓글 수정 */
router.patch("/article-comments/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { content } = req.body;

        if (Number.isNaN(id)) {
            return res.status(400).send({ message: "id는 숫자여야 합니다." });
        }
        if (!content) {
            return res.status(400).send({ message: "content는 필수입니다." });
        }

        const comment = await prisma.articleComment.update({
            where: { id },
            data: { content },
        });

        res.send(comment);
    } catch (err) {
        if (err.code === "P2025") {
            return res
                .status(404)
                .send({ message: "댓글을 찾을 수 없습니다." });
        }
        next(err);
    }
});

/** 자유게시판 댓글 삭제 */
router.delete("/article-comments/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).send({ message: "id는 숫자여야 합니다." });
        }

        await prisma.articleComment.delete({ where: { id } });
        res.sendStatus(204);
    } catch (err) {
        if (err.code === "P2025") {
            return res
                .status(404)
                .send({ message: "댓글을 찾을 수 없습니다." });
        }
        next(err);
    }
});

export default router;
