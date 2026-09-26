const mongoose = require('mongoose');

const deliveryItemSchema = new mongoose.Schema({
  productSku: { type: String, required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true }
});

const deliverySchema = new mongoose.Schema({
  deliveryNumber: { type: String, required: true, unique: true },
  destination: { type: String, required: true }, // Customer / Store branch
  items: [deliveryItemSchema],
  status: {
    type: String,
    enum: ['Staging', 'Picked', 'Packed', 'Dispatched', 'Delivered'],
    default: 'Staging'
  },
  carrier: { type: String, default: 'Standard Fleet' },
  scheduledDate: { type: Date, default: Date.now },
  dispatchedDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Delivery', deliverySchema);
