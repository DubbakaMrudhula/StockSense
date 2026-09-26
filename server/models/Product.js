const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  minThreshold: { type: Number, required: true, default: 10 },
  unit: { type: String, default: 'units' },
  location: { type: String, required: true }, // e.g. "Aisle 3 - Bay B"
  price: { type: Number, required: true, default: 0 },
  supplier: { type: String, default: 'General Supplier' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
