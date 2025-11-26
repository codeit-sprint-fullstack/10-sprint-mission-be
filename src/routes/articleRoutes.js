import express from 'express';
import { Article } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        name: 'BadRequest',
        message: 'title, content는 필수 필드입니다.',
      });
    }

    const article = await Article.create({
      title,
      content,
    });

    res.status(201).send({
      id: article.id,
      title: article.title,
      content: article.content,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;

    const articleIdNum = parseInt(articleId, 10);
    if (isNaN(articleIdNum)) {
      return res.status(400).json({
        name: 'BadRequest',
        message: '유효하지 않은 게시글 ID입니다.',
      });
    }

    const article = await Article.findByPk(articleIdNum);

    if (!article) {
      return res.status(404).json({
        name: 'NotFound',
        message: '게시글을 찾을 수 없습니다.',
      });
    }

    res.send({
      id: article.id,
      title: article.title,
      content: article.content,
      createdAt: article.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { title, content } = req.body;

    const articleIdNum = parseInt(articleId, 10);
    if (isNaN(articleIdNum)) {
      return res.status(400).json({
        name: 'BadRequest',
        message: '유효하지 않은 게시글 ID입니다.',
      });
    }

    const article = await Article.findByPk(articleIdNum);

    if (!article) {
      return res.status(404).json({
        name: 'NotFound',
        message: '게시글을 찾을 수 없습니다.',
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;

    await article.update(updateData);
    await article.reload();

    res.send({
      id: article.id,
      title: article.title,
      content: article.content,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;

    const articleIdNum = parseInt(articleId, 10);
    if (isNaN(articleIdNum)) {
      return res.status(400).json({
        name: 'BadRequest',
        message: '유효하지 않은 게시글 ID입니다.',
      });
    }

    const deleteCount = await Article.destroy({
      where: { id: articleIdNum },
    });

    if (deleteCount !== 1) {
      return res.status(404).json({
        name: 'NotFound',
        message: '게시글을 찾을 수 없습니다.',
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { offset = 0, limit = 20, sort = 'recent', keyword = '' } = req.query;

    const offsetNum = parseInt(offset, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(offsetNum) || offsetNum < 0) {
      return res.status(400).json({
        name: 'BadRequest',
        message: 'offset은 0 이상의 숫자여야 합니다.',
      });
    }

    if (isNaN(limitNum) || limitNum < 1) {
      return res.status(400).json({
        name: 'BadRequest',
        message: 'limit은 1 이상의 숫자여야 합니다.',
      });
    }

    const whereClause = keyword
      ? {
          [Op.or]: [
            { title: { [Op.iLike]: `%${keyword}%` } },
            { content: { [Op.iLike]: `%${keyword}%` } },
          ],
        }
      : undefined;

    const orderByClause = sort === 'recent' ? [['createdAt', 'DESC']] : [['createdAt', 'ASC']];

    const { count, rows: articleEntities } = await Article.findAndCountAll({
      where: whereClause,
      order: orderByClause,
      offset: offsetNum,
      limit: limitNum,
    });

    res.send({
      count,
      data: articleEntities.map((article) => ({
        id: article.id,
        title: article.title,
        content: article.content,
        createdAt: article.createdAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;

