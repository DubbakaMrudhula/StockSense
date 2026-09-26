const express = require('express');
const router = express.Router();
const store = require('../store');

// GET /stock-ledger?product=&location=&date_from=&date_to=&type=
// Deliverable 3: Filterable, chronological Move History page covering receipts, deliveries, transfers, and adjustments with before/after quantities
router.get('/', async (req, res) => {
  try {
    const { product, location, type, date_from, date_to } = req.query;
    const entries = await store.getLedger({
      product,
      location,
      type,
      date_from,
      date_to
    });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /stock-ledger/verify-scenario
// Deliverable 4: Verify the spec's "100kg steel → transfer → deliver 20 → damage 3" example produces correct ledger entries end-to-end
router.post('/verify-scenario', async (req, res) => {
  try {
    const result = await store.runSteelVerificationScenario();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
