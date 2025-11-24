import { PrismaClient } from "@prisma/client"; 


const prisma = new PrismaClient();

async function main() {
    const product1 = await prisma.product.create({
        data: {
            name: "중고 맥북 프로",
            description: "M1 Pro, 16GB RAM",
            price: 1500000,
            tags: ["노트북", "애플"],
        },
    });

    const product2 = await prisma.product.create({
        data: {
            name: "아이패드 에어",
            description: "4세대, 64GB",
            price: 600000,
            tags: ["태블릿", "애플"],
        },
    });

    const article1 = await prisma.article.create({
        data: {
            title: "판다마켓 이용 규칙",
            content: "여기에 이용 규칙을 적습니다.",
        },
    });

    const article2 = await prisma.article.create({
        data: {
            title: "거래 팁 모음",
            content: "사기 예방 팁을 공유합니다.",
        },
    });


    await prisma.marketComment.create({
        data: {
            content: "이 상품 아직 있나요?",
            productId: product1.id,
        },
    });

    await prisma.articleComment.create({
        data: {
            content: "좋은 정보 감사합니다.",
            articleId: article1.id,
        },
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
