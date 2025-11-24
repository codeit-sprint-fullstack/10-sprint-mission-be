// routes/marketComments.js
import express from "express";
import prisma from "../prisma.js";

const router = express.Router();

/** 중고마켓 댓글 등록 */
router.post("/products/:productId/comments", async (req, res, next) => {
    try {
        const productId = Number(req.params.productId);
        const { content } = req.body;

        if (Number.isNaN(productId)) {
            return res
                .status(400)
                .send({ message: "productId는 숫자여야 합니다." });
        }
        if (!content) {
            return res.status(400).send({ message: "content는 필수입니다." });
        }

        const product = await prisma.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            return res
                .status(404)
                .send({ message: "상품을 찾을 수 없습니다." });
        }

        const comment = await prisma.marketComment.create({
            data: {
                content,
                productId,
            },
        });

        res.status(201).send(comment);
    } catch (err) {
        next(err);
    }
});

/** 중고마켓 댓글 목록 (cursor 기반 pagination) */
router.get("/products/:productId/comments", async (req, res, next) => {
    try {
        const productId = Number(req.params.productId);
        const { cursor, limit = "10" } = req.query;

        if (Number.isNaN(productId)) {
            return res
                .status(400)
                .send({ message: "productId는 숫자여야 합니다." });
        }

        const take = Number(limit);
        if (Number.isNaN(take)) {
            return res
                .status(400)
                .send({ message: "limit는 숫자여야 합니다." });
        }

        const queryOptions = {
            where: { productId },
            orderBy: { id: "asc" },
            take: take + 1,
            select: {
                id: true,
                content: true,
                createdAt: true,
            },
        };

        if (cursor) {
            queryOptions.cursor = { id: Number(cursor) };
            queryOptions.skip = 1;
        }

        const comments = await prisma.marketComment.findMany(queryOptions);

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

/** 중고마켓 댓글 수정 */
router.patch("/market-comments/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { content } = req.body;

        if (Number.isNaN(id)) {
            return res.status(400).send({ message: "id는 숫자여야 합니다." });
        }
        if (!content) {
            return res.status(400).send({ message: "content는 필수입니다." });
        }

        const comment = await prisma.marketComment.update({
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

/** 중고마켓 댓글 삭제 */
router.delete("/market-comments/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).send({ message: "id는 숫자여야 합니다." });
        }

        await prisma.marketComment.delete({ where: { id } });
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
