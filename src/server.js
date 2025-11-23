import "dotenv/config"; // .env 파일에 있는 DATABASE_URL이나 PORT 같은 환경 변수 가져오기
import express from "express"; // express 모듈 불러오기
import cors from "cors"; // CORS 미들웨어 불러오기
import productsRouter from "./routes/products.js"; // 상품 API 라우터 불러오기
import articlesRouter from "./routes/articles.js"; // 자유게시판 API 라우터 불러오기
import prisma from "./prismaClient.js"; // prisma 인스턴스 가져오기

const app = express(); // Express 앱 생성

// 미들웨어: JSON 요청 해석 + CORS 허용
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(",") || "*" }));

// 서버가 정상 작동하는지 확인
app.get("/health", (req, res) => {
  res.status(200).json({ ok: true });
});

app.use("/products", productsRouter); // 상품 라우터 장착
app.use("/articles", articlesRouter); // 자유게시판 라우터 장착

// 에러 핸들러
app.use((error, req, res, next) => {
  console.error(error);
  res
    .status(error.status || 500)
    .send({ message: error.message || "서버 오류" });
});

// 서버 실행
const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await prisma.$connect(); // Prisma Client가 데이터베이스에 연결을 시도하도록 지시하는 메서드
    console.log("PostgreSQL 연결 성공!!");

    app.listen(PORT, () => {
      console.log(`서버 실행 잘 됩니다~😎 (${PORT}번 포트)`);
    });
  } catch (error) {
    console.error("PostgreSQL 연결에 실패..", error);
    process.exit(1); // 강의에서는 안 배웠지만 서버 종료
  }
}

startServer();
