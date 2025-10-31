/**
 * 스프린트 미션 4 베이스:
 * - 아이템 CRUD
 * - 간단한 사용자 개념 (헤더로 사용자 식별)
 * - 정렬/검색/페이지네이션의 발판 주석 포함
 */

export const db = {
  users: [
    { id: "u1", name: "Alice" },
    { id: "u2", name: "Bob" }
  ],
  items: [
    { id: 1, title: "감귤 한 박스", price: 12000, category: "fruit", sellerId: "u1", createdAt: Date.now() - 86400000 },
    { id: 2, title: "중고 모니터", price: 90000, category: "digital", sellerId: "u2", createdAt: Date.now() - 3600000 }
  ],
  nextItemId: 3
};
