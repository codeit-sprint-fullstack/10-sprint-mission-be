// app.js
import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import articlesRouter from "./routes/articles.js";
import productsRouter from "./routes/products.js";
import articleCommentsRouter from "./routes/articleComments.js";
import marketCommentsRouter from "./routes/marketComments.js";

const app = express();
app.use(express.json());

// 라우터 연결
app.use("/articles", articlesRouter);
app.use("/products", productsRouter);
app.use("/", articleCommentsRouter); // /articles/:articleId/comments, /article-comments/:id
app.use("/", marketCommentsRouter); // /products/:productId/comments, /market-comments/:id

// 공통 에러 핸들러
app.use((err, req, res, next) => {
    console.error(err);

    if (err.code === "P2025") {
        return res.status(404).send({ message: "리소스를 찾을 수 없습니다." });
    }

    res.status(500).send({
        message: err.message || "서버 에러가 발생했습니다.",
    });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
