import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();
connectDB();

mongoose.connection.on('connected', () => {
  console.log('MongoDB state: connected');
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB state: disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`MongoDB state error: ${err.message}`);
});

const app = express();

const defaultAllowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:4173',
];

const configuredOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([...defaultAllowedOrigins, ...configuredOrigins]);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.has(origin)) return true;

  try {
    const { hostname } = new URL(origin);
    return hostname.endsWith('.netlify.app');
  } catch {
    return false;
  }
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions,
});

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Example basic route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// DB health + counts check to confirm MongoDB-backed data fetch.
app.get('/api/health/db', async (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;

  if (!isConnected) {
    return res.status(503).json({
      mongoConnected: false,
      databaseName: mongoose.connection.name || null,
      message: 'MongoDB is disconnected',
    });
  }

  try {
    const [users, products, orders] = await Promise.all([
      User.countDocuments({}),
      Product.countDocuments({}),
      Order.countDocuments({}),
    ]);

    res.json({
      mongoConnected: true,
      databaseName: mongoose.connection.name,
      counts: {
        users,
        products,
        orders,
      },
    });
  } catch (error) {
    res.status(500).json({
      mongoConnected: true,
      message: error.message,
    });
  }
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`Connected to socket: ${socket.id}`);

  // When a user views their order tracking page, they can join a room named after their order ID
  socket.on('join_order_room', (orderId) => {
    socket.join(orderId);
    console.log(`Socket ${socket.id} joined order room ${orderId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Disconnected socket: ${socket.id}`);
  });
});

// Make io accessible to our routes
app.set('io', io);

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
