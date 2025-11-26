import { PrismaClient } from "@prisma/client"; // Prisma Client 라이브러리에서 PrismaClient 모듈 가져오기

const prisma = new PrismaClient(); // 인스턴스 생성

async function seed() {
  console.log("🌱 seeding 시작!"); // 내가 시딩 과정이 제대로 진행되고 있는지 확인하기 위해서 작성!

  // 동일한 테스트 데이터를 처음부터 새로 채워 넣기 위해 기존 데이터 삭제
  await prisma.articleComment.deleteMany();
  await prisma.marketComment.deleteMany();
  await prisma.article.deleteMany();
  await prisma.product.deleteMany();

  console.log("🧹 기존 데이터 삭제 완료!"); // 내가 시딩 과정이 제대로 진행되고 있는지 확인하기 위해서 작성!

  // Product 시드 데이터
  const product1 = await prisma.product.create({
    data: {
      name: "롯데 자이언츠 시즌권",
      description: "롯데 너무 못해서 하차합니다. 싸게 가져가세요",
      price: 1000,
      tags: ["롯데", "자이언츠", "야구"],
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: "리액트 시작하기 서적",
      description: "리액트 완벽 타파해서 팔아요(소망)",
      price: 15000,
      tags: ["리액트", "개발"],
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: "여름 바지",
      description: "이제 겨울 바지 사야해서 여름 바지 내놨습니다",
      price: 23000,
      tags: ["여름", "바지"],
    },
  });

  console.log("📦 Product 시드 데이터:", product1.id, product2.id, product3.id); // 내가 시딩 과정이 제대로 진행되고 있는지 확인하기 위해서 작성!

  // Article 시드 데이터
  const article1 = await prisma.article.create({
    data: {
      title: "캐럿마켓이랑 판다마켓 차이점 비교 분석해봤습니다~",
      content:
        "아무래도 판다마켓은 신생 마켓이라 그런지 매물이 적더라고요. 그래도 아직까지 사기는 적은 느낌이에요!",
    },
  });

  const article2 = await prisma.article.create({
    data: {
      title: "다들 코딩 공부 어떻게 하고 계세요?",
      content:
        "부트캠프 마치고 매일 새벽까지 시간 투자하는데, 실력이 별로 안 느는 것 같아 슬프네요.. 제가 멍청한걸까요? 다들 어떠세요?",
    },
  });

  console.log("📦 Article 시드 데이터:", article1.id, article2.id); // 내가 시딩 과정이 제대로 진행되고 있는지 확인하기 위해서 작성!

  // MarketComment 시드 데이터 (중고마켓 댓글)
  await prisma.marketComment.createMany({
    data: [
      {
        content: "찐팬이 아니신가봄",
        productId: product1.id,
      },
      {
        content: "롯데 아이디를 넘겨주시는건가요?",
        productId: product1.id,
      },
      {
        content: "책에 다른거 쓰신 거 없이 깨끗한가요?",
        productId: product2.id,
      },
    ],
  });

  console.log("💬 MarketComment 시드 데이터 seeded");

  // ArticleComment 시드 데이터 (자유게시판 댓글)
  await prisma.articleComment.createMany({
    data: [
      {
        content: "궁금했는데 알려주셔서 감사합니다😊",
        articleId: article1.id,
      },
      {
        content: "저는 재밌습니다~ 얼른 발전해서 같이 개발해요!",
        articleId: article2.id,
      },
      {
        content: "저는 새벽에 하면 힘들더라고요.. 체력적 한계가 ㅠㅠ",
        articleId: article2.id,
      },
    ],
  });

  console.log("💬 ArticleComment 시드 데이터 seeded"); // 내가 시딩 과정이 제대로 진행되고 있는지 확인하기 위해서 작성!

  console.log("✅ Seeding 완료!"); // 내가 시딩 과정이 제대로 진행되고 있는지 확인하기 위해서 작성!
}

seed()
  .catch((error) => {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
