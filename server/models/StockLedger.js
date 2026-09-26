const mongoose = require('mongoose');

const stockLedgerSchema = new mongoose.Schema({
  entryNumber: { type: String, required: true, unique: true },
  timestamp: { type: Date, default: Date.now },
  type: {
    type: String,
    enum: ['RECEIPT', 'DELIVERY', 'INTERNAL_TRANSFER', 'STOCK_ADJUSTMENT'],
    required: true
  },
  productSku: { type: String, required: true },
  productName: { type: String, required: true },
  sourceLocation: { type: String, default: '-' },
  destinationLocation: { type: String, default: '-' },
  quantity: { type: Number, required: true },
  beforeQuantity: { type: Number, required: true },
  afterQuantity: { type: Number, required: true },
  delta: { type: Number, required: true }, // Net change to total inventory (+, -, or 0 for internal transfer)
  reason: { type: String, default: '' },
  referenceId: { type: String, default: '' },
  performedBy: { type: String, default: 'Warehouse Staff' },
  notes: { type: String, default: '' }
});

module.exports = mongoose.model('StockLedger', stockLedgerSchema);
