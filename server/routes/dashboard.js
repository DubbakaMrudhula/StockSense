const express = require('express');
const router = express.Router();
const store = require('../store');

// GET /api/dashboard/kpis
router.get('/kpis', async (req, res) => {
  try {
    const kpis = await store.getDashboardKpis();
    res.json(kpis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
