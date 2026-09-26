const {
  initialProducts,
  initialReceipts,
  initialDeliveries,
  initialTransfers,
  initialAdjustments,
  initialUsers
} = require('./data/initialData');

const Product = require('./models/Product');
const Receipt = require('./models/Receipt');
const Delivery = require('./models/Delivery');
const Transfer = require('./models/Transfer');
const Adjustment = require('./models/Adjustment');
const User = require('./models/User');

class DataStore {
  constructor() {
    this.isMongoConnected = false;
    this.products = JSON.parse(JSON.stringify(initialProducts));
    this.receipts = JSON.parse(JSON.stringify(initialReceipts));
    this.deliveries = JSON.parse(JSON.stringify(initialDeliveries));
    this.transfers = JSON.parse(JSON.stringify(initialTransfers));
    this.adjustments = JSON.parse(JSON.stringify(initialAdjustments));
    this.users = JSON.parse(JSON.stringify(initialUsers));
  }

  setMongoConnected(connected) {
    this.isMongoConnected = connected;
    if (connected) {
      this.syncWithDatabase().catch(err => console.error("Database sync error:", err.message));
    }
  }

  async syncWithDatabase() {
    try {
      const prodCount = await Product.countDocuments();
      if (prodCount === 0) {
        await Product.insertMany(initialProducts);
        await Receipt.insertMany(initialReceipts);
        await Delivery.insertMany(initialDeliveries);
        await Transfer.insertMany(initialTransfers);
        await Adjustment.insertMany(initialAdjustments);
        await User.insertMany(initialUsers);
        console.log("Database initialized with default inventory records.");
      }
    } catch (e) {
      console.warn("Could not seed MongoDB:", e.message);
    }
  }

  // --- Products ---
  async getProducts() {
    if (this.isMongoConnected) {
      return await Product.find().sort({ createdAt: -1 });
    }
    return [...this.products];
  }

  async getProductBySku(sku) {
    if (this.isMongoConnected) {
      return await Product.findOne({ sku });
    }
    return this.products.find(p => p.sku === sku);
  }

  async createProduct(data) {
    if (this.isMongoConnected) {
      const item = new Product(data);
      return await item.save();
    }
    const exists = this.products.find(p => p.sku.toLowerCase() === data.sku.toLowerCase());
    if (exists) {
      throw new Error(`Product with SKU ${data.sku} already exists.`);
    }
    const item = { ...data, createdAt: new Date() };
    this.products.unshift(item);
    return item;
  }

  async updateProduct(sku, updates) {
    if (this.isMongoConnected) {
      return await Product.findOneAndUpdate({ sku }, { ...updates, updatedAt: new Date() }, { new: true });
    }
    const idx = this.products.findIndex(p => p.sku === sku);
    if (idx === -1) return null;
    this.products[idx] = { ...this.products[idx], ...updates, updatedAt: new Date() };
    return this.products[idx];
  }

  async deleteProduct(sku) {
    if (this.isMongoConnected) {
      return await Product.findOneAndDelete({ sku });
    }
    const idx = this.products.findIndex(p => p.sku === sku);
    if (idx === -1) return null;
    return this.products.splice(idx, 1)[0];
  }

  // --- Receipts ---
  async getReceipts() {
    if (this.isMongoConnected) {
      return await Receipt.find().sort({ createdAt: -1 });
    }
    return [...this.receipts];
  }

  async createReceipt(data) {
    const receiptNumber = data.receiptNumber || `REC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const fullData = { ...data, receiptNumber, createdAt: new Date() };
    if (this.isMongoConnected) {
      const item = new Receipt(fullData);
      return await item.save();
    }
    this.receipts.unshift(fullData);
    return fullData;
  }

  async updateReceiptStatus(receiptNumber, status) {
    if (this.isMongoConnected) {
      const rec = await Receipt.findOneAndUpdate({ receiptNumber }, { status }, { new: true });
      if (status === 'Completed' && rec) {
        // Increase stock for received items
        for (const item of rec.items) {
          await Product.findOneAndUpdate(
            { sku: item.productSku },
            { $inc: { quantity: item.quantityReceived || item.quantityExpected } }
          );
        }
      }
      return rec;
    }
    const rec = this.receipts.find(r => r.receiptNumber === receiptNumber);
    if (rec) {
      rec.status = status;
      if (status === 'Completed') {
        rec.items.forEach(item => {
          const prod = this.products.find(p => p.sku === item.productSku);
          if (prod) {
            prod.quantity += (item.quantityReceived || item.quantityExpected);
          }
        });
      }
    }
    return rec;
  }

  // --- Deliveries ---
  async getDeliveries() {
    if (this.isMongoConnected) {
      return await Delivery.find().sort({ createdAt: -1 });
    }
    return [...this.deliveries];
  }

  async createDelivery(data) {
    const deliveryNumber = data.deliveryNumber || `DEL-2026-${Math.floor(100 + Math.random() * 900)}`;
    const fullData = { ...data, deliveryNumber, createdAt: new Date() };
    if (this.isMongoConnected) {
      const item = new Delivery(fullData);
      return await item.save();
    }
    this.deliveries.unshift(fullData);
    return fullData;
  }

  async updateDeliveryStatus(deliveryNumber, status) {
    if (this.isMongoConnected) {
      const del = await Delivery.findOneAndUpdate({ deliveryNumber }, { status }, { new: true });
      if (status === 'Dispatched' && del) {
        // Deduct inventory
        for (const item of del.items) {
          await Product.findOneAndUpdate(
            { sku: item.productSku },
            { $inc: { quantity: -item.quantity } }
          );
        }
      }
      return del;
    }
    const del = this.deliveries.find(d => d.deliveryNumber === deliveryNumber);
    if (del) {
      del.status = status;
      if (status === 'Dispatched') {
        del.items.forEach(item => {
          const prod = this.products.find(p => p.sku === item.productSku);
          if (prod) {
            prod.quantity = Math.max(0, prod.quantity - item.quantity);
          }
        });
      }
    }
    return del;
  }

  // --- Transfers ---
  async getTransfers() {
    if (this.isMongoConnected) {
      return await Transfer.find().sort({ createdAt: -1 });
    }
    return [...this.transfers];
  }

  async createTransfer(data) {
    const transferNumber = data.transferNumber || `TRF-2026-${Math.floor(100 + Math.random() * 900)}`;
    const fullData = { ...data, transferNumber, createdAt: new Date() };
    
    // Update product location if needed
    if (data.toLocation && data.productSku) {
      await this.updateProduct(data.productSku, { location: data.toLocation });
    }

    if (this.isMongoConnected) {
      const item = new Transfer(fullData);
      return await item.save();
    }
    this.transfers.unshift(fullData);
    return fullData;
  }

  // --- Adjustments ---
  async getAdjustments() {
    if (this.isMongoConnected) {
      return await Adjustment.find().sort({ createdAt: -1 });
    }
    return [...this.adjustments];
  }

  async createAdjustment(data) {
    const adjustmentNumber = data.adjustmentNumber || `ADJ-2026-${Math.floor(100 + Math.random() * 900)}`;
    const difference = Number(data.newQuantity) - Number(data.previousQuantity);
    const fullData = { ...data, adjustmentNumber, difference, createdAt: new Date() };

    // Update product quantity to the newly verified count
    await this.updateProduct(data.productSku, { quantity: Number(data.newQuantity) });

    if (this.isMongoConnected) {
      const item = new Adjustment(fullData);
      return await item.save();
    }
    this.adjustments.unshift(fullData);
    return fullData;
  }

  // --- Live Dashboard KPIs ---
  async getDashboardKpis() {
    const products = await this.getProducts();
    const receipts = await this.getReceipts();
    const deliveries = await this.getDeliveries();
    const transfers = await this.getTransfers();

    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= p.minThreshold).length;
    const outOfStockCount = products.filter(p => p.quantity === 0).length;
    const pendingReceipts = receipts.filter(r => r.status === 'Pending Dock' || r.status === 'In Inspection').length;
    const activeDeliveries = deliveries.filter(d => d.status === 'Staging' || d.status === 'Picked' || d.status === 'Packed').length;
    const activeTransfers = transfers.filter(t => t.status === 'In Transit' || t.status === 'Scheduled').length;

    return {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      criticalStockTotal: lowStockCount + outOfStockCount,
      pendingReceipts,
      activeDeliveries,
      activeTransfers
    };
  }

  // --- Users & Auth ---
  async findUserByEmail(email) {
    if (this.isMongoConnected) {
      return await User.findOne({ email: email.toLowerCase() });
    }
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async registerUser(userData) {
    if (this.isMongoConnected) {
      const user = new User(userData);
      return await user.save();
    }
    const exists = this.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) {
      throw new Error("User with this email already exists");
    }
    const user = { ...userData, createdAt: new Date() };
    this.users.push(user);
    return user;
  }
}

const store = new DataStore();
module.exports = store;
