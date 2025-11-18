import express from 'express';
import Product from '../models/ProductSchema.js';

const router = express.Router();

router.post('/products', async (req, res, next) => {
  try {
    const { name, description, price, tags } = req.body;

    if (!name || !description || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'name, description, price는 필수 필드입니다.',
      });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        success: false,
        message: '가격은 0 이상의 숫자여야 합니다.',
      });
    }

    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: 'tags는 배열이어야 합니다.',
      });
    }

    const product = new Product({
      name,
      description,
      price,
      tags: tags || [],
    });

    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      data: {
        id: savedProduct._id,
        name: savedProduct.name,
        description: savedProduct.description,
        price: savedProduct.price,
        tags: savedProduct.tags,
        createdAt: savedProduct.createdAt,
        updatedAt: savedProduct.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 상품 ID입니다.',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        tags: product.tags,
        createdAt: product.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, tags } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 상품 ID입니다.',
      });
    }

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({
        success: false,
        message: '가격은 0 이상의 숫자여야 합니다.',
      });
    }

    if (tags !== undefined && !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        message: 'tags는 배열이어야 합니다.',
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (tags !== undefined) updateData.tags = tags;

    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        tags: product.tags,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/products/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 상품 ID입니다.',
      });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다.',
      });
    }

    res.status(200).json({
      success: true,
      message: '상품이 삭제되었습니다.',
    });
  } catch (error) {
    next(error);
  }
});

router.get('/products', async (req, res, next) => {
  try {
    const { offset = 0, limit = 20, sort = 'recent', keyword = '' } = req.query;

    const offsetNum = parseInt(offset, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'offset은 0 이상의 숫자여야 합니다.',
      });
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      return res.status(400).json({
        success: false,
        message: 'limit은 1 이상 100 이하의 숫자여야 합니다.',
      });
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'recent') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'old') {
      sortOption = { createdAt: 1 };
    }

    let query = {};
    if (keyword && keyword.trim()) {
      query = {
        $or: [
          { name: { $regex: keyword.trim(), $options: 'i' } },
          { description: { $regex: keyword.trim(), $options: 'i' } },
        ],
      };
    }

    const products = await Product.find(query)
      .select('_id name price createdAt')
      .sort(sortOption)
      .skip(offsetNum)
      .limit(limitNum)
      .lean();

    const total = await Product.countDocuments(query);

    const formattedProducts = products.map((product) => ({
      id: product._id,
      name: product.name,
      price: product.price,
      createdAt: product.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: formattedProducts,
      pagination: {
        offset: offsetNum,
        limit: limitNum,
        total,
        hasMore: offsetNum + limitNum < total,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

