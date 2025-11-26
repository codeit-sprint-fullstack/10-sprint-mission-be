import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import { sequelize } from '../src/config/database.js';
import { Product, Article, Comment } from '../src/models/index.js';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('데이터베이스 연결 성공');

    await sequelize.sync({ force: true });
    console.log('데이터베이스 동기화 완료');

    const products = await Product.bulkCreate([
      {
        name: '맥북 프로 16인치',
        description: '2023년형 맥북 프로 16인치입니다. M2 Pro 칩셋 사용 중입니다.',
        price: 2500000,
        tags: ['전자제품', '노트북', '애플'],
        images: ['https://picsum.photos/200/300'],
      },
      {
        name: '아이폰 14 프로',
        description: '아이폰 14 프로 256GB입니다. 깨끗한 상태입니다.',
        price: 1200000,
        tags: ['전자제품', '스마트폰', '애플'],
        images: ['https://picsum.photos/200/300'],
      },
      {
        name: '에어팟 프로 2세대',
        description: '에어팟 프로 2세대입니다. 박스 포함입니다.',
        price: 350000,
        tags: ['전자제품', '이어폰', '애플'],
        images: ['https://picsum.photos/200/300'],
      },
    ]);

    const articles = await Article.bulkCreate([
      {
        title: '중고거래 시 주의사항',
        content: '중고거래를 할 때는 반드시 직거래를 권장합니다. 온라인 거래 시 사기 피해를 주의하세요.',
      },
      {
        title: '판다마켓 이용 가이드',
        content: '판다마켓을 처음 이용하시는 분들을 위한 가이드입니다. 상품 등록 방법부터 거래 완료까지 안내합니다.',
      },
      {
        title: '안전한 거래를 위한 팁',
        content: '안전한 중고거래를 위한 여러 팁을 공유합니다. 거래 전 확인사항을 체크하세요.',
      },
    ]);

    await Comment.bulkCreate([
      {
        content: '좋은 상품이네요! 가격 협상 가능한가요?',
        productId: products[0].id,
        articleId: null,
      },
      {
        content: '직거래 가능한 지역이 어디인가요?',
        productId: products[0].id,
        articleId: null,
      },
      {
        content: '유용한 정보 감사합니다!',
        articleId: articles[0].id,
        productId: null,
      },
      {
        content: '추가로 궁금한 점이 있습니다.',
        articleId: articles[0].id,
        productId: null,
      },
    ]);

    console.log('시딩 완료');
    process.exit(0);
  } catch (error) {
    console.error('시딩 실패:', error);
    process.exit(1);
  }
}

seed();

