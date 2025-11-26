import express from 'express';
import { Product } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { name, description, price, tags, images } = req.body;

    if (!name || !description || price === undefined) {
      return res.status(400).json({
        name: 'BadRequest',
        message: 'name, description, price는 필수 필드입니다.',
      });
    }

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        name: 'BadRequest',
        message: '가격은 0 이상의 숫자여야 합니다.',
      });
    }

    if (tags && !Array.isArray(tags)) {
      return res.status(400).json({
        name: 'BadRequest',
        message: 'tags는 배열이어야 합니다.',
      });
    }

    if (images && !Array.isArray(images)) {
      return res.status(400).json({
        name: 'BadRequest',
        message: 'images는 배열이어야 합니다.',
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      tags: tags || [],
      images: images || [],
    });

    res.status(201).send({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      tags: product.tags,
      images: product.images,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;

    const productIdNum = parseInt(productId, 10);
    if (isNaN(productIdNum)) {
      return res.status(400).json({
        name: 'BadRequest',
        message: '유효하지 않은 상품 ID입니다.',
      });
    }

    const product = await Product.findByPk(productIdNum);

    if (!product) {
      return res.status(404).json({
        name: 'NotFound',
        message: '상품을 찾을 수 없습니다.',
      });
    }

    res.send({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      tags: product.tags,
      images: product.images,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { name, description, price, tags, images } = req.body;

    const productIdNum = parseInt(productId, 10);
    if (isNaN(productIdNum)) {
      return res.status(400).json({
        name: 'BadRequest',
        message: '유효하지 않은 상품 ID입니다.',
      });
    }

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({
        name: 'BadRequest',
        message: '가격은 0 이상의 숫자여야 합니다.',
      });
    }

    if (tags !== undefined && !Array.isArray(tags)) {
      return res.status(400).json({
        name: 'BadRequest',
        message: 'tags는 배열이어야 합니다.',
      });
    }

    if (images !== undefined && !Array.isArray(images)) {
      return res.status(400).json({
        name: 'BadRequest',
        message: 'images는 배열이어야 합니다.',
      });
    }

    const product = await Product.findByPk(productIdNum);

    if (!product) {
      return res.status(404).json({
        name: 'NotFound',
        message: '상품을 찾을 수 없습니다.',
      });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (tags !== undefined) updateData.tags = tags;
    if (images !== undefined) updateData.images = images;

    await product.update(updateData);
    await product.reload();

    res.send({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      tags: product.tags,
      images: product.images,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;

    const productIdNum = parseInt(productId, 10);
    if (isNaN(productIdNum)) {
      return res.status(400).json({
        name: 'BadRequest',
        message: '유효하지 않은 상품 ID입니다.',
      });
    }

    const deleteCount = await Product.destroy({
      where: { id: productIdNum },
    });

    if (deleteCount !== 1) {
      return res.status(404).json({
        name: 'NotFound',
        message: '상품을 찾을 수 없습니다.',
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { skip = 0, take = 10, orderBy, word } = req.query;

    const skipNum = parseInt(skip, 10);
    const takeNum = parseInt(take, 10);

    if (isNaN(skipNum) || skipNum < 0) {
      return res.status(400).json({
        name: 'BadRequest',
        message: 'skip은 0 이상의 숫자여야 합니다.',
      });
    }

    if (isNaN(takeNum) || takeNum < 1 || takeNum > 10) {
      return res.status(400).json({
        name: 'BadRequest',
        message: 'take는 1 이상 10 이하의 숫자여야 합니다.',
      });
    }

    const whereClause = word
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${word}%` } },
            { description: { [Op.iLike]: `%${word}%` } },
          ],
        }
      : undefined;

    const orderByClause = orderBy === 'recent' ? [['createdAt', 'DESC']] : undefined;

    const { count, rows: productEntities } = await Product.findAndCountAll({
      where: whereClause,
      order: orderByClause,
      offset: skipNum,
      limit: takeNum,
    });

    res.send({
      count,
      data: productEntities.slice(0, takeNum).map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        tags: product.tags,
        images: product.images,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
