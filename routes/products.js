// routes/products.js
import express from "express";
import prisma from "../prismaClient.js";

const router = express.Router();

/** 상품 등록 */
router.post("/", async (req, res, next) => {
    try {
        const { name, description, price, tags } = req.body;

        if (!name || !description || price === undefined) {
            return res.status(400).send({
                message: "name, description, price는 필수입니다.",
            });
        }

        if (typeof price !== "number" || price < 0) {
            return res.status(400).send({
                message: "price는 0 이상의 숫자여야 합니다.",
            });
        }

        if (tags && !Array.isArray(tags)) {
            return res.status(400).send({
                message: "tags는 배열이어야 합니다.",
            });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                tags: tags || [],
            },
        });

        res.status(201).send(product);
    } catch (err) {
        next(err);
    }
});

/** 상품 목록 조회 (offset + 검색 + 최신순) */
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
                              name: {
                                  contains: String(keyword),
                                  mode: "insensitive",
                              },
                          },
                          {
                              description: {
                                  contains: String(keyword),
                                  mode: "insensitive",
                              },
                          },
                      ],
                  }
                : {};

        const orderBy =
            order === "recent" ? { createdAt: "desc" } : { createdAt: "desc" };

        const [items, totalCount] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy,
                skip,
                take,
                select: {
                    id: true,
                    name: true,
                    price: true,
                    createdAt: true,
                },
            }),
            prisma.product.count({ where }),
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

/** 상품 상세 조회 */
router.get("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).send({ message: "id는 숫자여야 합니다." });
        }

        const product = await prisma.product.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                tags: true,
                createdAt: true,
            },
        });

        if (!product) {
            return res
                .status(404)
                .send({ message: "상품을 찾을 수 없습니다." });
        }

        res.send(product);
    } catch (err) {
        next(err);
    }
});

/** 상품 수정 */
router.patch("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        const { name, description, price, tags } = req.body;

        if (Number.isNaN(id)) {
            return res.status(400).send({ message: "id는 숫자여야 합니다." });
        }

        if (price !== undefined && (typeof price !== "number" || price < 0)) {
            return res.status(400).send({
                message: "price는 0 이상의 숫자여야 합니다.",
            });
        }

        if (tags !== undefined && !Array.isArray(tags)) {
            return res.status(400).send({
                message: "tags는 배열이어야 합니다.",
            });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (price !== undefined) updateData.price = price;
        if (tags !== undefined) updateData.tags = tags;

        if (Object.keys(updateData).length === 0) {
            return res.status(400).send({
                message: "수정할 필드가 없습니다.",
            });
        }

        const product = await prisma.product.update({
            where: { id },
            data: updateData,
        });

        res.send(product);
    } catch (err) {
        // 없는 id 수정 시 P2025 날 수 있음
        if (err.code === "P2025") {
            return res
                .status(404)
                .send({ message: "상품을 찾을 수 없습니다." });
        }
        next(err);
    }
});

/** 상품 삭제 */
router.delete("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (Number.isNaN(id)) {
            return res.status(400).send({ message: "id는 숫자여야 합니다." });
        }

        await prisma.product.delete({ where: { id } });
        return res.sendStatus(204); // 내용 없음
    } catch (err) {
        if (err.code === "P2025") {
            return res
                .status(404)
                .send({ message: "상품을 찾을 수 없습니다." });
        }
        next(err);
    }
});

export default router;

