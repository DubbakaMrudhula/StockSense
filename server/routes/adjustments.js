const express = require('express');
const router = express.Router();
const store = require('../store');

// GET /api/adjustments
router.get('/', async (req, res) => {
  try {
    const adjustments = await store.getAdjustments();
    res.json(adjustments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/adjustments
router.post('/', async (req, res) => {
  try {
    const { productSku, productName, previousQuantity, newQuantity, reason, adjustedBy, notes } = req.body;
    if (!productSku || newQuantity === undefined || !reason) {
      return res.status(400).json({ error: "Product SKU, New Quantity, and Reason are required" });
    }

    const newAdjustment = await store.createAdjustment({
      productSku,
      productName: productName || productSku,
      previousQuantity: Number(previousQuantity) || 0,
      newQuantity: Number(newQuantity),
      reason,
      adjustedBy: adjustedBy || 'Inventory Manager',
      notes: notes || ''
    });

    res.status(201).json(newAdjustment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
