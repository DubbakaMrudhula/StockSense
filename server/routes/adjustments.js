const express = require('express');
const router = express.Router();
const store = require('../store');

// GET /stock-adjustments
router.get('/', async (req, res) => {
  try {
    const adjustments = await store.getAdjustments();
    res.json(adjustments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /stock-adjustments
// Deliverable 2: Adjustment form showing recorded vs counted quantity and computed delta before confirming
router.post('/', async (req, res) => {
  try {
    const { productSku, location, countedQuantity, reason, adjustedBy, notes } = req.body;

    if (!productSku || !location || countedQuantity === undefined || !reason) {
      return res.status(400).json({
        error: "productSku, location, countedQuantity, and reason are required."
      });
    }

    const result = await store.createStockAdjustment({
      productSku,
      location,
      countedQuantity,
      reason,
      adjustedBy,
      notes
    });

    res.status(201).json({
      message: `Stock adjustment recorded: ${result.adjustment.difference >= 0 ? '+' : ''}${result.adjustment.difference} difference applied.`,
      ...result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
