import { prisma } from '../lib/prisma.js';

class AppError extends Error {
	constructor(message, status = 400) {
		super(message);
		this.status = status;
	}
}

function parseNumberMaybe(value) {
	if (value === undefined || value === null || value === '') return undefined;
	const n = Number(value);
	return Number.isFinite(n) ? n : undefined;
}

function buildSearchFilter(q) {
	if (!q || typeof q !== 'string' || q.trim() === '') return {};
	return {
		OR: [
			{ name: { contains: q, mode: 'insensitive' } },
			{ description: { contains: q, mode: 'insensitive' } },
		],
	};
}

export async function createProductService({ name, description, price, tags }) {
	if (!name || !description || price === undefined) {
		throw new AppError('name, description, price는 필수입니다.', 400);
	}
	const priceNum = parseNumberMaybe(price);
	if (priceNum === undefined || priceNum < 0) {
		throw new AppError('price는 0 이상의 숫자여야 합니다.', 400);
	}
	const tagsArray = Array.isArray(tags) ? tags.map(String) : [];

	const created = await prisma.product.create({
		data: {
			name: String(name),
			description: String(description),
			price: priceNum,
			tags: tagsArray,
		},
	});
	return created;
}

export async function getProductByIdService(id) {
	const product = await prisma.product.findUnique({ where: { id } });
	if (!product) {
		throw new AppError('상품을 찾을 수 없습니다.', 404);
	}
	return product;
}

export async function updateProductService(id, payload) {
	const { name, description, price, tags } = payload || {};
	const data = {};
	if (name !== undefined) data.name = String(name);
	if (description !== undefined) data.description = String(description);
	if (price !== undefined) {
		const num = parseNumberMaybe(price);
		if (num === undefined || num < 0) {
			throw new AppError('price는 0 이상의 숫자여야 합니다.', 400);
		}
		data.price = num;
	}
	if (tags !== undefined) {
		if (!Array.isArray(tags)) {
			throw new AppError('tags는 문자열 배열이어야 합니다.', 400);
		}
		data.tags = tags.map(String);
	}
	if (Object.keys(data).length === 0) {
		throw new AppError('수정할 값이 없습니다.', 400);
	}
	try {
		const updated = await prisma.product.update({
			where: { id },
			data,
		});
		return updated;
	} catch (err) {
		if (err?.code === 'P2025') {
			throw new AppError('상품을 찾을 수 없습니다.', 404);
		}
		throw err;
	}
}

export async function deleteProductService(id) {
	try {
		await prisma.product.delete({ where: { id } });
	} catch (err) {
		if (err?.code === 'P2025') {
			throw new AppError('상품을 찾을 수 없습니다.', 404);
		}
		throw err;
	}
}

export async function listProductsService({ offset = '0', limit = '10', sort, q }) {
	const offsetNum = parseInt(String(offset), 10);
	const limitNum = parseInt(String(limit), 10);
	if (!Number.isInteger(offsetNum) || offsetNum < 0) {
		throw new AppError('offset은 0 이상의 정수여야 합니다.', 400);
	}
	if (!Number.isInteger(limitNum) || limitNum <= 0 || limitNum > 100) {
		throw new AppError('limit은 1~100 사이의 정수여야 합니다.', 400);
	}
	const where = buildSearchFilter(String(q || '').trim());
	const orderBy = sort === 'recent' ? { createdAt: 'desc' } : { createdAt: 'asc' };
	const [items, total] = await Promise.all([
		prisma.product.findMany({
			where,
			skip: offsetNum,
			take: limitNum,
			orderBy,
		}),
		prisma.product.count({ where }),
	]);
	return {
		items,
		total,
		offset: offsetNum,
		limit: limitNum,
	};
}


