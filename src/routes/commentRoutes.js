import express from 'express';
import { Comment, Product, Article } from '../models/index.js';
import { Op } from 'sequelize';

const router = express.Router();

router.post('/products/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        name: 'BadRequest',
        message: 'content는 필수 필드입니다.',
      });
    }

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

    const comment = await Comment.create({
      content,
      productId: productIdNum,
      articleId: null,
    });

    res.status(201).send({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/articles/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        name: 'BadRequest',
        message: 'content는 필수 필드입니다.',
      });
    }

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

    const comment = await Comment.create({
      content,
      productId: null,
      articleId: articleIdNum,
    });

    res.status(201).send({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

router.patch('/:commentId', async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        name: 'BadRequest',
        message: 'content는 필수 필드입니다.',
      });
    }

    const commentIdNum = parseInt(commentId, 10);
    if (isNaN(commentIdNum)) {
      return res.status(400).json({
        name: 'BadRequest',
        message: '유효하지 않은 댓글 ID입니다.',
      });
    }

    const comment = await Comment.findByPk(commentIdNum);

    if (!comment) {
      return res.status(404).json({
        name: 'NotFound',
        message: '댓글을 찾을 수 없습니다.',
      });
    }

    await comment.update({ content });
    await comment.reload();

    res.send({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:commentId', async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const commentIdNum = parseInt(commentId, 10);
    if (isNaN(commentIdNum)) {
      return res.status(400).json({
        name: 'BadRequest',
        message: '유효하지 않은 댓글 ID입니다.',
      });
    }

    const deleteCount = await Comment.destroy({
      where: { id: commentIdNum },
    });

    if (deleteCount !== 1) {
      return res.status(404).json({
        name: 'NotFound',
        message: '댓글을 찾을 수 없습니다.',
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get('/products/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { cursor } = req.query;

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

    const whereClause = {
      productId: productIdNum,
    };

    if (cursor) {
      const cursorNum = parseInt(cursor, 10);
      if (!isNaN(cursorNum)) {
        whereClause.id = { [Op.lt]: cursorNum };
      }
    }

    const comments = await Comment.findAll({
      where: whereClause,
      order: [['id', 'DESC']],
      limit: 10,
    });

    const nextCursor = comments.length > 0 ? comments[comments.length - 1].id : null;

    res.send({
      data: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
      })),
      nextCursor,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/articles/:articleId', async (req, res, next) => {
  try {
    const { articleId } = req.params;
    const { cursor } = req.query;

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

    const whereClause = {
      articleId: articleIdNum,
    };

    if (cursor) {
      const cursorNum = parseInt(cursor, 10);
      if (!isNaN(cursorNum)) {
        whereClause.id = { [Op.lt]: cursorNum };
      }
    }

    const comments = await Comment.findAll({
      where: whereClause,
      order: [['id', 'DESC']],
      limit: 10,
    });

    const nextCursor = comments.length > 0 ? comments[comments.length - 1].id : null;

    res.send({
      data: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
      })),
      nextCursor,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

