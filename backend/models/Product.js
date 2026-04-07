import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
