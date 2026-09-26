const mongoose = require('mongoose');

const adjustmentSchema = new mongoose.Schema({
  adjustmentNumber: { type: String, required: true, unique: true },
  productSku: { type: String, required: true },
  productName: { type: String, required: true },
  previousQuantity: { type: Number, required: true },
  newQuantity: { type: Number, required: true },
  difference: { type: Number, required: true }, // positive or negative
  reason: {
    type: String,
    enum: ['Physical Cycle Count', 'Damaged Stock', 'Supplier Shortage', 'Customer Return', 'Shelf Loss'],
    required: true
  },
  adjustedBy: { type: String, default: 'Inventory Manager' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Adjustment', adjustmentSchema);
