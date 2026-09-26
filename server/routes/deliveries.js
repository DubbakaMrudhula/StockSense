const express = require('express');
const router = express.Router();
const store = require('../store');

// GET /api/deliveries
router.get('/', async (req, res) => {
  try {
    const deliveries = await store.getDeliveries();
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/deliveries
router.post('/', async (req, res) => {
  try {
    const { destination, items, carrier } = req.body;
    if (!destination || !items || !items.length) {
      return res.status(400).json({ error: "Destination and at least one item are required" });
    }

    const newDelivery = await store.createDelivery({
      destination,
      items,
      carrier: carrier || 'Standard Logistics',
      status: 'Staging'
    });

    res.status(201).json(newDelivery);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/deliveries/:deliveryNumber/status
router.patch('/:deliveryNumber/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await store.updateDeliveryStatus(req.params.deliveryNumber, status);
    if (!updated) {
      return res.status(404).json({ error: "Delivery not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
