const express = require('express');
const router = express.Router();
const store = require('../store');

// GET /api/receipts
router.get('/', async (req, res) => {
  try {
    const receipts = await store.getReceipts();
    res.json(receipts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/receipts
router.post('/', async (req, res) => {
  try {
    const { supplier, items, destinationLocation, notes } = req.body;
    if (!supplier || !items || !items.length) {
      return res.status(400).json({ error: "Supplier and at least one item are required" });
    }

    const newReceipt = await store.createReceipt({
      supplier,
      items,
      destinationLocation: destinationLocation || 'Inbound Dock Bay 1',
      notes: notes || '',
      status: 'Pending Dock'
    });

    res.status(201).json(newReceipt);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/receipts/:receiptNumber/status
router.patch('/:receiptNumber/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await store.updateReceiptStatus(req.params.receiptNumber, status);
    if (!updated) {
      return res.status(404).json({ error: "Receipt not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
