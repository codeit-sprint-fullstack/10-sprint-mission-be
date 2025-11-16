import { serializeDetailProduct, serializeListProduct } from '../utils/serializers.js';
import {
	createProductService,
	getProductByIdService,
	updateProductService,
	deleteProductService,
	listProductsService,
} from '../services/productsService.js';

export async function createProduct(req, res, next) {
	try {
		const created = await createProductService(req.body || {});
		return res.status(201).json(serializeDetailProduct(created));
	} catch (err) {
		if (err?.status) return res.status(err.status).json({ message: err.message });
		return next(err);
	}
}

export async function getProductById(req, res, next) {
	try {
		const { id } = req.params;
		const product = await getProductByIdService(id);
		// 상세 조회: id, name, description, price, tags, createdAt
		const serialized = serializeDetailProduct(product);
		return res.status(200).json(serialized);
	} catch (err) {
		if (err?.status) return res.status(err.status).json({ message: err.message });
		return next(err);
	}
}

export async function updateProduct(req, res, next) {
	try {
		const { id } = req.params;
		const updated = await updateProductService(id, req.body || {});
		return res.status(200).json(serializeDetailProduct(updated));
	} catch (err) {
		if (err?.status) return res.status(err.status).json({ message: err.message });
		return next(err);
	}
}

export async function deleteProduct(req, res, next) {
	try {
		const { id } = req.params;
		await deleteProductService(id);
		return res.status(204).send();
	} catch (err) {
		if (err?.status) return res.status(err.status).json({ message: err.message });
		return next(err);
	}
}

export async function listProducts(req, res, next) {
	try {
		const result = await listProductsService(req.query || {});
		const serialized = result.items.map(serializeListProduct);
		return res.status(200).json({
			items: serialized,
			pagination: {
				offset: result.offset,
				limit: result.limit,
				total: result.total,
				hasMore: result.offset + serialized.length < result.total,
			},
		});
	} catch (err) {
		if (err?.status) return res.status(err.status).json({ message: err.message });
		return next(err);
	}
}


