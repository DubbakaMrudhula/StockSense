const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  transferNumber: { type: String, required: true, unique: true },
  productSku: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  fromLocation: { type: String, required: true },
  toLocation: { type: String, required: true },
  transferredBy: { type: String, default: 'Warehouse Staff' },
  status: {
    type: String,
    enum: ['Scheduled', 'In Transit', 'Completed', 'Cancelled'],
    default: 'Completed'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transfer', transferSchema);
