import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing
    await Product.deleteMany();
    await User.deleteMany();

    console.log('Cleared existing data.');

    // Seed Admin User
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@threadz.com',
      password: adminPassword,
      role: 'admin'
    });

    // Seed Warehouse User
    const whPassword = await bcrypt.hash('wh123', 10);
    const warehouse = await User.create({
      name: 'Central Warehouse',
      email: 'warehouse@threadz.com',
      password: whPassword,
      role: 'warehouse'
    });

    console.log('Created Users (Admin, Warehouse)');

    // Seed Products
    const products = await Product.insertMany([
      {
        title: 'Neon Cyberpunk Tee',
        description: 'High quality premium blend cotton featuring neon cyberpunk aesthetics.',
        price: 1499,
        stock: 120,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
        imagePublicId: 'seed/neon-cyberpunk-tee'
      },
      {
        title: 'Minimalist Cotton Basic',
        description: 'The everyday essential, crafted from organic fabric.',
        price: 899,
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800',
        imagePublicId: 'seed/minimalist-cotton-basic'
      },
      {
        title: 'Vintage Acid Wash',
        description: 'A retro look blended with modern comfort.',
        price: 1899,
        stock: 30,
        imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800',
        imagePublicId: 'seed/vintage-acid-wash'
      },
      {
        title: 'Classic Logo Graphic',
        description: 'Our signature brand logo on a soft mid-weight tee.',
        price: 1099,
        stock: 200,
        imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=800',
        imagePublicId: 'seed/classic-logo-graphic'
      }
    ]);

    console.log('Seeded Products:', products.length);
    console.log('Database successfully seeded!');
    process.exit();
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

seedDatabase();
