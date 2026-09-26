const express = require('express');
const router = express.Router();
const store = require('../store');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const products = await store.getProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
router.post('/', async (req, res) => {
  try {
    const { sku, name, category, quantity, minThreshold, unit, location, price, supplier } = req.body;
    if (!sku || !name || !category) {
      return res.status(400).json({ error: "SKU, Name, and Category are required" });
    }

    const newProd = await store.createProduct({
      sku: sku.trim().toUpperCase(),
      name: name.trim(),
      category: category.trim(),
      quantity: Number(quantity) || 0,
      minThreshold: Number(minThreshold) || 10,
      unit: unit || 'units',
      location: location || 'Warehouse Floor',
      price: Number(price) || 0,
      supplier: supplier || 'General Supplier'
    });

    res.status(201).json(newProd);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/products/:sku
router.put('/:sku', async (req, res) => {
  try {
    const updated = await store.updateProduct(req.params.sku, req.body);
    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:sku
router.delete('/:sku', async (req, res) => {
  try {
    const deleted = await store.deleteProduct(req.params.sku);
    if (!deleted) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted", deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
