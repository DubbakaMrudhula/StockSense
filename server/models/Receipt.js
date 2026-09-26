const mongoose = require('mongoose');

const receiptItemSchema = new mongoose.Schema({
  productSku: { type: String, required: true },
  productName: { type: String, required: true },
  quantityExpected: { type: Number, required: true },
  quantityReceived: { type: Number, default: 0 },
  unitPrice: { type: Number, default: 0 }
});

const receiptSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true },
  supplier: { type: String, required: true },
  items: [receiptItemSchema],
  status: {
    type: String,
    enum: ['Pending Dock', 'In Inspection', 'Completed', 'Cancelled'],
    default: 'Pending Dock'
  },
  destinationLocation: { type: String, default: 'Inbound Dock Bay 1' },
  notes: { type: String, default: '' },
  receivedDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Receipt', receiptSchema);
