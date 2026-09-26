import express from 'express';
import {
  getProducts,
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  getProductStock,
  adjustProductStock
} from '../controllers/productController.js';

const router = express.Router();

// Required: GET /products/search?sku=&category=
// Note: Registered before /:id to prevent route collision
router.get('/search', searchProducts);

// Required: GET /products & POST /products
router.get('/', getProducts);
router.post('/', createProduct);

// Required: GET /products/:id & PUT /products/:id
router.get('/:id', getProductById);
router.put('/:id', updateProduct);

// Required: GET /products/:id/stock (per location)
router.get('/:id/stock', getProductStock);

// Stock adjustment endpoint
router.post('/:id/stock/adjust', adjustProductStock);

export default router;
