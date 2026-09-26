import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { testConnection } from './config/db.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import lookupRoutes from './routes/lookups.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging in dev
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Odoo Inventory - Product & Database Architecture Module'
  });
});

// Mount Routes as specified
app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/', lookupRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start Server
app.listen(PORT, async () => {
  console.log(`\n==========================================================`);
  console.log(`  Odoo Inventory Management API (Member 1 - Architect)`);
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log(`==========================================================`);
  await testConnection();
});

export default app;
