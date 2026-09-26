const express = require('express');
const router = express.Router();
const store = require('../store');

// GET /internal-transfers
router.get('/', async (req, res) => {
  try {
    const transfers = await store.getTransfers();
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /internal-transfers
// Deliverable 1: Transfer form + validation (can't move more than available at source)
router.post('/', async (req, res) => {
  try {
    const { productSku, fromLocation, toLocation, quantity, transferredBy, notes } = req.body;
    
    if (!productSku || !fromLocation || !toLocation || quantity === undefined) {
      return res.status(400).json({ error: "productSku, fromLocation, toLocation, and quantity are required." });
    }

    const result = await store.createInternalTransfer({
      productSku,
      fromLocation,
      toLocation,
      quantity,
      transferredBy,
      notes
    });

    res.status(201).json({
      message: `Successfully transferred ${quantity} of ${productSku} from ${fromLocation} to ${toLocation}. Total stock unchanged.`,
      ...result
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /internal-transfers/:id/validate
router.put('/:id/validate', async (req, res) => {
  try {
    const validation = await store.validateTransfer(req.params.id);
    if (!validation.isValid) {
      return res.status(400).json({
        valid: false,
        error: `Insufficient stock at source: requested ${validation.requestedQuantity}, only ${validation.availableAtSource} available.`,
        validation
      });
    }
    res.json({
      valid: true,
      message: "Transfer is valid and source has sufficient stock.",
      validation
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
