import { Product } from './Product.js';
import { Article } from './Article.js';
import { Comment } from './Comment.js';

Product.hasMany(Comment, {
  foreignKey: 'productId',
  onDelete: 'CASCADE',
});

Article.hasMany(Comment, {
  foreignKey: 'articleId',
  onDelete: 'CASCADE',
});

Comment.belongsTo(Product, {
  foreignKey: 'productId',
});

Comment.belongsTo(Article, {
  foreignKey: 'articleId',
});

export { Product, Article, Comment };


