const express = require('express');
const router = express.Router();
const store = require('../store');

// GET /api/transfers
router.get('/', async (req, res) => {
  try {
    const transfers = await store.getTransfers();
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/transfers
router.post('/', async (req, res) => {
  try {
    const { productSku, productName, quantity, fromLocation, toLocation, transferredBy } = req.body;
    if (!productSku || !quantity || !fromLocation || !toLocation) {
      return res.status(400).json({ error: "Product SKU, Quantity, From, and To locations are required" });
    }

    const newTransfer = await store.createTransfer({
      productSku,
      productName: productName || productSku,
      quantity: Number(quantity),
      fromLocation,
      toLocation,
      transferredBy: transferredBy || 'Warehouse Staff',
      status: 'Completed'
    });

    res.status(201).json(newTransfer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
