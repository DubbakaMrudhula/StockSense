require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const store = require('./store');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const productRoutes = require('./routes/products');
const receiptRoutes = require('./routes/receipts');
const deliveryRoutes = require('./routes/deliveries');
const transferRoutes = require('./routes/transfers');
const adjustmentRoutes = require('./routes/adjustments');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stocksense';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/products', productRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/adjustments', adjustmentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'StockSense IMS Backend',
    database: store.isMongoConnected ? 'MongoDB (Connected)' : 'Resilient In-Memory Store (Active)',
    timestamp: new Date()
  });
});

// Connect to MongoDB with graceful fallback
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 3000 // Fast 3-second timeout if local MongoDB isn't running
})
.then(() => {
  console.log("Connected to MongoDB successfully at:", MONGODB_URI);
  store.setMongoConnected(true);
})
.catch((err) => {
  console.log("Local MongoDB not detected (" + err.message + ").");
  console.log("Running in resilient In-Memory Store mode with pre-seeded inventory data.");
  store.setMongoConnected(false);
});

// Start Server
app.listen(PORT, () => {
  console.log(`StockSense API server is listening on port ${PORT}`);
});
