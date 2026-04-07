import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import { parser } from '../config/cloudinary.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin creates a product
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, description, price, stock, imageUrl, imagePublicId } = req.body;

    if (!imageUrl || !imagePublicId) {
      return res.status(400).json({ message: 'Cloudinary image is required' });
    }

    const product = new Product({
      title,
      description,
      price,
      stock,
      imageUrl,
      imagePublicId,
    });
    const createdProduct = await product.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('product_created', createdProduct);
    }

    res.status(201).json(createdProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload product image to Cloudinary
router.post('/upload', protect, admin, parser.single('image'), async (req, res) => {
  try {
    if (!req.file?.path || !req.file?.filename) {
      return res.status(400).json({ message: 'Image upload failed' });
    }

    res.status(201).json({
      imageUrl: req.file.path,
      imagePublicId: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
