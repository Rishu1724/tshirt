import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, warehouse } from '../middlewares/authMiddleware.js';

const router = express.Router();

// User creates an order
router.post('/', protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;
    
    if (orderItems && orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.state || !shippingAddress?.zip || !shippingAddress?.country) {
      return res.status(400).json({ message: 'Complete shipping address is required' });
    }

    const productIds = orderItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productsMap = new Map(products.map((product) => [product._id.toString(), product]));

    const normalizedItems = [];
    let computedTotal = 0;

    for (const item of orderItems) {
      const product = productsMap.get(String(item.product));

      if (!product) {
        return res.status(400).json({ message: 'One or more products do not exist' });
      }

      const qty = Number(item.qty);
      if (!Number.isInteger(qty) || qty <= 0) {
        return res.status(400).json({ message: 'Invalid quantity in order items' });
      }

      if (product.stock < qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.title}. Available: ${product.stock}`,
        });
      }

      computedTotal += product.price * qty;
      normalizedItems.push({
        product: product._id,
        name: product.title,
        qty,
        price: product.price,
        imageUrl: product.imageUrl,
      });
    }

    for (const item of normalizedItems) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.qty } });
    }

    const order = new Order({
      user: req.user._id,
      orderItems: normalizedItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      totalPrice: computedTotal,
    });

    const createdOrder = await order.save();
    
    // Emit event for real-time dashboard updates if connected
    const io = req.app.get('io');
    if (io) {
      io.emit('new_order', createdOrder);
    }

    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User gets their own orders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin gets all orders
router.get('/', protect, warehouse, async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin or Warehouse gets specific order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin or Warehouse updates order status
router.put('/:id/status', protect, warehouse, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.status = req.body.status || order.status;
      const updatedOrder = await order.save();
      
      const io = req.app.get('io');
      if (io) {
        io.to(order._id.toString()).emit('order_status_update', updatedOrder);
        io.emit('global_order_status_update', updatedOrder);
      }

      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
