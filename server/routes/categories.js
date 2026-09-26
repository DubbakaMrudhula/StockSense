import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

// Required: GET /categories & POST /categories
router.get('/', getCategories);
router.post('/', createCategory);

// Full Categories CRUD
router.put('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;
