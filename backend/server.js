import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();
connectDB();

const app = express();

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Allow all origins for dev
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Example basic route
app.get('/', (req, res) => {
  res.send('API is running...');
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
