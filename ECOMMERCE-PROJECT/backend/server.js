const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const Product = require('./models/Product');
const Order = require('./models/Order');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Set environment variables with fallbacks
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
const JWT_SECRET = process.env.JWT_SECRET || 'your_secure_random_string';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// MongoDB Connection with retry logic
const connectWithRetry = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected. Attempting to reconnect...');
  connectWithRetry();
});

// Start MongoDB connection
connectWithRetry();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Orders routes with error handling
app.post('/api/orders', async (req, res, next) => {
  try {
    const { products, customerName, customerEmail, shippingAddress, paymentMethod, upiId } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: 'No products in order' });
    }
    
    if (!customerName || !customerEmail || !shippingAddress) {
      return res.status(400).json({ message: 'Missing required customer information' });
    }

    if (!paymentMethod || !['upi', 'card'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid or missing payment method' });
    }

    if (paymentMethod === 'upi' && !upiId) {
      return res.status(400).json({ message: 'UPI ID is required for UPI payments' });
    }

    let totalAmount = 0;
    for (const item of products) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json({ message: 'Invalid product data in order' });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }
      if (!product.inStock) {
        return res.status(400).json({ message: `Product ${product.name} is out of stock` });
      }
      totalAmount += product.price * item.quantity;
    }

    const order = new Order({
      products,
      totalAmount,
      subtotal: totalAmount,
      shippingFee: 0,
      customerName,
      customerEmail,
      shippingAddress,
      paymentMethod,
      upiId: paymentMethod === 'upi' ? upiId : undefined,
      status: 'pending',
      paymentStatus: 'pending'
    });

    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    next(error);
  }
});

// GET orders with error handling
app.get('/api/orders', async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('products.productId', 'name price image')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// GET single order with error handling
app.get('/api/orders/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;

    if (!isValidObjectId(orderId)) {
      return res.status(400).json({ 
        message: 'Invalid order ID format',
        details: 'The provided order ID is not in the correct format.'
      });
    }

    const order = await Order.findById(orderId)
      .populate('products.productId', 'name price image');
    
    if (!order) {
      return res.status(404).json({ 
        message: 'Order not found',
        details: 'The requested order could not be found in the database.'
      });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Frontend URL: ${FRONTEND_URL}`);
  console.log(`MongoDB URI: ${MONGODB_URI}`);
}); 