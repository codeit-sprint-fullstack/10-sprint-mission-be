import { Prisma } from '@prisma/client';

function toPlainNumber(value) {
	if (value instanceof Prisma.Decimal) {
		const num = Number(value);
		return Number.isFinite(num) ? num : Number(value.toString());
	}
	return value;
}

export function serializeDetailProduct(p) {
	return {
		id: p.id,
		name: p.name,
		description: p.description,
		price: toPlainNumber(p.price),
		tags: p.tags || [],
		createdAt: p.createdAt,
	};
}

export function serializeListProduct(p) {
	return {
		id: p.id,
		name: p.name,
		price: toPlainNumber(p.price),
		createdAt: p.createdAt,
	};
}


