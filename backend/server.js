import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
dotenv.config();
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import oauthRoutes from './routes/oauthRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import mongoose from 'mongoose';

const port = process.env.PORT || 5001;
const __dirname = path.resolve();

connectDB();

const app = express();

// CORS and Security Headers Middleware
app.use((req, res, next) => {
  // Allow requests from any origin (adjust for production if needed)
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Permissions Policy - allow accelerometer and other features
  res.header('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/oauth', oauthRoutes);

// Razorpay config endpoint
app.get('/api/config/razorpay', (req, res) =>
  res.send({ keyId: process.env.RAZORPAY_KEY_ID })
);

if (process.env.NODE_ENV === 'production') {
  app.use('/uploads', express.static('/var/data/uploads'));
  app.use(express.static(path.join(__dirname, '/frontend/build')));
  app.use(express.static(path.join(__dirname, '/backend')));

  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  );
} else {
  app.use('/uploads', express.static(path.join(__dirname, '/uploads')));
  app.use(express.static(path.join(__dirname, '/frontend/build')));
  app.use(express.static(path.join(__dirname, '/backend')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${port}`)
);
