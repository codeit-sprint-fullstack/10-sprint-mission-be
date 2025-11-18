import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, '상품명은 필수입니다.'],
      trim: true,
      maxlength: [200, '상품명은 200자 이하여야 합니다.'],
    },
    description: {
      type: String,
      required: [true, '상품 설명은 필수입니다.'],
      trim: true,
      maxlength: [2000, '상품 설명은 2000자 이하여야 합니다.'],
    },
    price: {
      type: Number,
      required: [true, '가격은 필수입니다.'],
      min: [0, '가격은 0 이상이어야 합니다.'],
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          return tags.length <= 10;
        },
        message: '태그는 최대 10개까지 가능합니다.',
      },
    },
    images: {
      type: [String],
      default: [],
    },
    favoriteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ createdAt: -1 });

const Product = mongoose.model('Product', productSchema);

export default Product;

