// server.js (CommonJS)
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// JSON 파싱 미들웨어
app.use(express.json());

// 헬스체크
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Hello Panda Market Backend!');
});

// 서버 시작
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
