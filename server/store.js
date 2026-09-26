const {
  initialProducts,
  initialReceipts,
  initialDeliveries,
  initialTransfers,
  initialAdjustments,
  initialLedger,
  initialUsers
} = require('./data/initialData');

const Product = require('./models/Product');
const Receipt = require('./models/Receipt');
const Delivery = require('./models/Delivery');
const Transfer = require('./models/Transfer');
const Adjustment = require('./models/Adjustment');
const StockLedger = require('./models/StockLedger');
const User = require('./models/User');

class DataStore {
  constructor() {
    this.isMongoConnected = false;
    this.products = JSON.parse(JSON.stringify(initialProducts));
    this.receipts = JSON.parse(JSON.stringify(initialReceipts));
    this.deliveries = JSON.parse(JSON.stringify(initialDeliveries));
    this.transfers = JSON.parse(JSON.stringify(initialTransfers));
    this.adjustments = JSON.parse(JSON.stringify(initialAdjustments));
    this.ledger = JSON.parse(JSON.stringify(initialLedger));
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
        await StockLedger.insertMany(initialLedger);
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
    const locations = data.locations && data.locations.length
      ? data.locations
      : [{ location: data.location || 'Main Warehouse - Rack A', quantity: Number(data.quantity) || 0 }];

    const fullData = {
      ...data,
      locations,
      quantity: Number(data.quantity) || 0
    };

    if (this.isMongoConnected) {
      const item = new Product(fullData);
      return await item.save();
    }
    const exists = this.products.find(p => p.sku.toLowerCase() === data.sku.toLowerCase());
    if (exists) {
      throw new Error(`Product with SKU ${data.sku} already exists.`);
    }
    const item = { ...fullData, createdAt: new Date() };
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

  // Helper to ensure product locations structure exists
  ensureProductLocations(prod) {
    if (!prod.locations || !Array.isArray(prod.locations) || prod.locations.length === 0) {
      prod.locations = [{ location: prod.location || 'Main Warehouse - Rack A', quantity: prod.quantity }];
    }
    return prod.locations;
  }

  // --- Internal Transfers (Deliverable 1) ---
  async getTransfers() {
    if (this.isMongoConnected) {
      return await Transfer.find().sort({ createdAt: -1 });
    }
    return [...this.transfers];
  }

  async validateTransfer(transferIdOrData) {
    // If passed an ID, look it up; otherwise check provided data
    let data = transferIdOrData;
    if (typeof transferIdOrData === 'string') {
      data = this.transfers.find(t => t.id === transferIdOrData || t.transferNumber === transferIdOrData);
      if (!data && this.isMongoConnected) {
        data = await Transfer.findById(transferIdOrData);
      }
    }
    if (!data) throw new Error("Transfer record not found");

    const prod = await this.getProductBySku(data.productSku);
    if (!prod) throw new Error(`Product ${data.productSku} not found`);

    const locations = this.ensureProductLocations(prod);
    const sourceLoc = locations.find(l => l.location === data.fromLocation);
    const availableAtSource = sourceLoc ? sourceLoc.quantity : 0;
    const requested = Number(data.quantity);

    const isValid = availableAtSource >= requested;
    return {
      isValid,
      productSku: prod.sku,
      productName: prod.name,
      fromLocation: data.fromLocation,
      toLocation: data.toLocation,
      availableAtSource,
      requestedQuantity: requested,
      remainingAfterTransfer: availableAtSource - requested
    };
  }

  async createInternalTransfer(data) {
    const { productSku, fromLocation, toLocation, quantity, transferredBy, notes } = data;
    const numQty = Number(quantity);

    if (!productSku || !fromLocation || !toLocation || !numQty || numQty <= 0) {
      throw new Error("Product SKU, fromLocation, toLocation, and positive quantity are required.");
    }
    if (fromLocation === toLocation) {
      throw new Error("Source and destination locations cannot be identical.");
    }

    const prod = await this.getProductBySku(productSku);
    if (!prod) throw new Error(`Product with SKU ${productSku} not found.`);

    const locations = this.ensureProductLocations(prod);
    const sourceLoc = locations.find(l => l.location === fromLocation);
    const available = sourceLoc ? sourceLoc.quantity : 0;

    // VALIDATION: Can't move more than available at source!
    if (available < numQty) {
      throw new Error(`Insufficient stock at source: requested ${numQty} ${prod.unit || 'units'}, but only ${available} ${prod.unit || 'units'} available at ${fromLocation}.`);
    }

    // Deduct from source
    sourceLoc.quantity -= numQty;

    // Add to destination
    let destLoc = locations.find(l => l.location === toLocation);
    if (!destLoc) {
      destLoc = { location: toLocation, quantity: 0 };
      locations.push(destLoc);
    }
    destLoc.quantity += numQty;

    // Total stock remains UNCHANGED!
    const totalBefore = prod.quantity;
    const totalAfter = prod.quantity; // unchanged

    // Update product
    await this.updateProduct(prod.sku, { locations, updatedAt: new Date() });

    const transferNumber = `TRF-2026-${Math.floor(100 + Math.random() * 900)}`;
    const transferRecord = {
      id: `trf-${Date.now()}`,
      transferNumber,
      productSku: prod.sku,
      productName: prod.name,
      quantity: numQty,
      fromLocation,
      toLocation,
      transferredBy: transferredBy || 'Warehouse Staff',
      status: 'Completed',
      notes: notes || '',
      createdAt: new Date()
    };

    if (this.isMongoConnected) {
      const tItem = new Transfer(transferRecord);
      await tItem.save();
    }
    this.transfers.unshift(transferRecord);

    // Record in Stock Ledger
    await this.createLedgerEntry({
      type: 'INTERNAL_TRANSFER',
      productSku: prod.sku,
      productName: prod.name,
      sourceLocation: fromLocation,
      destinationLocation: toLocation,
      quantity: numQty,
      beforeQuantity: totalBefore,
      afterQuantity: totalAfter,
      delta: 0, // Total stock unchanged
      reason: `Internal Transfer: ${fromLocation} → ${toLocation}`,
      referenceId: transferNumber,
      performedBy: transferredBy || 'Warehouse Staff',
      notes: notes || `Moved ${numQty} ${prod.unit || 'units'} from ${fromLocation} to ${toLocation}`
    });

    return {
      transfer: transferRecord,
      product: {
        sku: prod.sku,
        totalQuantity: prod.quantity,
        locations: prod.locations
      }
    };
  }

  // --- Stock Adjustments (Deliverable 2) ---
  async getAdjustments() {
    if (this.isMongoConnected) {
      return await Adjustment.find().sort({ createdAt: -1 });
    }
    return [...this.adjustments];
  }

  async createStockAdjustment(data) {
    const { productSku, location, countedQuantity, reason, adjustedBy, notes } = data;
    const numCounted = Number(countedQuantity);

    if (!productSku || !location || isNaN(numCounted) || numCounted < 0 || !reason) {
      throw new Error("Product SKU, location, valid counted quantity, and reason are required.");
    }

    const prod = await this.getProductBySku(productSku);
    if (!prod) throw new Error(`Product ${productSku} not found.`);

    const locations = this.ensureProductLocations(prod);
    let targetLoc = locations.find(l => l.location === location);
    if (!targetLoc) {
      targetLoc = { location, quantity: 0 };
      locations.push(targetLoc);
    }

    const recordedQtyAtLocation = targetLoc.quantity;
    const delta = numCounted - recordedQtyAtLocation;
    const totalBefore = prod.quantity;
    const totalAfter = totalBefore + delta;

    // Update location and total
    targetLoc.quantity = numCounted;
    prod.quantity = Math.max(0, totalAfter);

    await this.updateProduct(prod.sku, {
      quantity: prod.quantity,
      locations,
      updatedAt: new Date()
    });

    const adjustmentNumber = `ADJ-2026-${Math.floor(100 + Math.random() * 900)}`;
    const adjustmentRecord = {
      id: `adj-${Date.now()}`,
      adjustmentNumber,
      productSku: prod.sku,
      productName: prod.name,
      location,
      previousQuantity: recordedQtyAtLocation,
      newQuantity: numCounted,
      difference: delta,
      reason,
      adjustedBy: adjustedBy || 'Inventory Manager',
      notes: notes || '',
      createdAt: new Date()
    };

    if (this.isMongoConnected) {
      const aItem = new Adjustment(adjustmentRecord);
      await aItem.save();
    }
    this.adjustments.unshift(adjustmentRecord);

    // Record in Stock Ledger
    await this.createLedgerEntry({
      type: 'STOCK_ADJUSTMENT',
      productSku: prod.sku,
      productName: prod.name,
      sourceLocation: location,
      destinationLocation: location,
      quantity: Math.abs(delta),
      beforeQuantity: totalBefore,
      afterQuantity: totalAfter,
      delta: delta,
      reason: `${reason} (${delta >= 0 ? '+' : ''}${delta} ${prod.unit || 'units'})`,
      referenceId: adjustmentNumber,
      performedBy: adjustedBy || 'Inventory Manager',
      notes: notes || `Adjusted count at ${location} from ${recordedQtyAtLocation} to ${numCounted}`
    });

    return {
      adjustment: adjustmentRecord,
      product: {
        sku: prod.sku,
        totalQuantity: prod.quantity,
        locations: prod.locations
      }
    };
  }

  // --- Move History / Stock Ledger (Deliverable 3) ---
  async getLedger(filters = {}) {
    const { product, location, type, date_from, date_to } = filters;

    let entries = this.isMongoConnected
      ? await StockLedger.find().sort({ timestamp: -1 })
      : [...this.ledger];

    if (product) {
      const pLower = product.toLowerCase();
      entries = entries.filter(e =>
        e.productSku.toLowerCase().includes(pLower) ||
        e.productName.toLowerCase().includes(pLower)
      );
    }

    if (location) {
      const lLower = location.toLowerCase();
      entries = entries.filter(e =>
        (e.sourceLocation && e.sourceLocation.toLowerCase().includes(lLower)) ||
        (e.destinationLocation && e.destinationLocation.toLowerCase().includes(lLower))
      );
    }

    if (type && type !== 'ALL') {
      entries = entries.filter(e => e.type === type);
    }

    if (date_from) {
      const fromTime = new Date(date_from).getTime();
      entries = entries.filter(e => new Date(e.timestamp).getTime() >= fromTime);
    }

    if (date_to) {
      const toTime = new Date(date_to).getTime();
      entries = entries.filter(e => new Date(e.timestamp).getTime() <= toTime);
    }

    // Sort newest first
    return entries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  async createLedgerEntry(entryData) {
    const entryNumber = entryData.entryNumber || `LED-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullEntry = {
      ...entryData,
      entryNumber,
      timestamp: entryData.timestamp || new Date()
    };

    if (this.isMongoConnected) {
      const item = new StockLedger(fullEntry);
      return await item.save();
    }
    this.ledger.unshift(fullEntry);
    return fullEntry;
  }

  // --- Deliverable 4: Verify "100kg steel → transfer → deliver 20 → damage 3" ---
  async runSteelVerificationScenario() {
    // 1. Reset or initialize "PRD-STEEL-100" to 100kg at "Main Warehouse - Rack A"
    let steel = await this.getProductBySku("PRD-STEEL-100");
    const initialLocations = [
      { location: "Main Warehouse - Rack A", quantity: 100 },
      { location: "Production Floor", quantity: 0 },
      { location: "Warehouse 2", quantity: 0 }
    ];

    if (!steel) {
      steel = await this.createProduct({
        sku: "PRD-STEEL-100",
        name: "Structural Carbon Steel Rods (100kg Lot)",
        category: "Raw Materials",
        quantity: 100,
        minThreshold: 20,
        unit: "kg",
        location: "Main Warehouse - Rack A",
        locations: initialLocations,
        price: 45.00,
        supplier: "National Steel Foundries"
      });
    } else {
      await this.updateProduct(steel.sku, {
        quantity: 100,
        locations: initialLocations
      });
    }

    // Step 1: Initial Inbound Ledger Entry (100kg Received)
    const step1Ledger = await this.createLedgerEntry({
      type: "RECEIPT",
      productSku: "PRD-STEEL-100",
      productName: "Structural Carbon Steel Rods (100kg Lot)",
      sourceLocation: "National Steel Foundries",
      destinationLocation: "Main Warehouse - Rack A",
      quantity: 100,
      beforeQuantity: 0,
      afterQuantity: 100,
      delta: 100,
      reason: "Initial baseline: 100kg steel received at Main Warehouse",
      referenceId: "REC-STEEL-INIT",
      performedBy: "Dock Supervisor",
      notes: "Baseline 100kg structural steel"
    });

    // Step 2: Transfer 50kg from Rack A to Production Floor (Total stock stays 100kg!)
    const step2 = await this.createInternalTransfer({
      productSku: "PRD-STEEL-100",
      fromLocation: "Main Warehouse - Rack A",
      toLocation: "Production Floor",
      quantity: 50,
      transferredBy: "Warehouse Operator",
      notes: "Transfer 50kg steel to Production Floor (total stock unchanged at 100kg)"
    });

    // Step 3: Deliver 20kg from Production Floor (Total stock becomes 80kg)
    const prodAfterTransfer = await this.getProductBySku("PRD-STEEL-100");
    const prodFloorLoc = prodAfterTransfer.locations.find(l => l.location === "Production Floor");
    prodFloorLoc.quantity -= 20; // 50 -> 30
    prodAfterTransfer.quantity -= 20; // 100 -> 80
    await this.updateProduct("PRD-STEEL-100", {
      quantity: prodAfterTransfer.quantity,
      locations: prodAfterTransfer.locations
    });

    const step3Ledger = await this.createLedgerEntry({
      type: "DELIVERY",
      productSku: "PRD-STEEL-100",
      productName: "Structural Carbon Steel Rods (100kg Lot)",
      sourceLocation: "Production Floor",
      destinationLocation: "Customer Dispatch",
      quantity: 20,
      beforeQuantity: 100,
      afterQuantity: 80,
      delta: -20,
      reason: "Dispatched 20kg order to customer from Production Floor",
      referenceId: "DEL-STEEL-020",
      performedBy: "Logistics Team",
      notes: "Delivery completed: 20kg deducted"
    });

    // Step 4: Damage 3kg at Production Floor (Counted 27kg, delta -3kg, total becomes 77kg)
    const step4 = await this.createStockAdjustment({
      productSku: "PRD-STEEL-100",
      location: "Production Floor",
      countedQuantity: 27, // 30 - 3 = 27
      reason: "Damaged Stock",
      adjustedBy: "Floor Quality Inspector",
      notes: "Damage 3kg during cutting process at Production Floor"
    });

    const finalProduct = await this.getProductBySku("PRD-STEEL-100");
    const scenarioLedger = await this.getLedger({ product: "PRD-STEEL-100" });

    return {
      success: true,
      message: "Spec scenario verified: 100kg steel → transfer 50kg → deliver 20kg → damage 3kg",
      finalStock: {
        totalQuantity: finalProduct.quantity, // 77 kg
        expectedTotal: 77,
        locations: finalProduct.locations
      },
      auditTrail: scenarioLedger.slice(0, 4)
    };
  }

  // --- Receipts & Deliveries ---
  async getReceipts() {
    if (this.isMongoConnected) return await Receipt.find().sort({ createdAt: -1 });
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
    const rec = this.isMongoConnected
      ? await Receipt.findOne({ receiptNumber })
      : this.receipts.find(r => r.receiptNumber === receiptNumber);

    if (!rec) return null;
    rec.status = status;

    if (status === 'Completed') {
      for (const item of rec.items) {
        const prod = await this.getProductBySku(item.productSku);
        if (prod) {
          const qty = item.quantityReceived || item.quantityExpected;
          const totalBefore = prod.quantity;
          const totalAfter = totalBefore + qty;
          const locs = this.ensureProductLocations(prod);
          const targetLoc = locs.find(l => l.location === rec.destinationLocation) || locs[0];
          targetLoc.quantity += qty;
          prod.quantity = totalAfter;

          await this.updateProduct(prod.sku, { quantity: totalAfter, locations: locs });
          await this.createLedgerEntry({
            type: 'RECEIPT',
            productSku: prod.sku,
            productName: prod.name,
            sourceLocation: rec.supplier,
            destinationLocation: rec.destinationLocation || targetLoc.location,
            quantity: qty,
            beforeQuantity: totalBefore,
            afterQuantity: totalAfter,
            delta: qty,
            reason: `Supplier receipt completed from ${rec.supplier}`,
            referenceId: rec.receiptNumber,
            performedBy: 'Dock Intake'
          });
        }
      }
    }

    if (this.isMongoConnected) {
      await rec.save();
    }
    return rec;
  }

  async getDeliveries() {
    if (this.isMongoConnected) return await Delivery.find().sort({ createdAt: -1 });
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
    const del = this.isMongoConnected
      ? await Delivery.findOne({ deliveryNumber })
      : this.deliveries.find(d => d.deliveryNumber === deliveryNumber);

    if (!del) return null;
    del.status = status;

    if (status === 'Dispatched') {
      for (const item of del.items) {
        const prod = await this.getProductBySku(item.productSku);
        if (prod) {
          const qty = item.quantity;
          const totalBefore = prod.quantity;
          const totalAfter = Math.max(0, totalBefore - qty);
          const locs = this.ensureProductLocations(prod);
          if (locs.length > 0) {
            locs[0].quantity = Math.max(0, locs[0].quantity - qty);
          }
          prod.quantity = totalAfter;

          await this.updateProduct(prod.sku, { quantity: totalAfter, locations: locs });
          await this.createLedgerEntry({
            type: 'DELIVERY',
            productSku: prod.sku,
            productName: prod.name,
            sourceLocation: locs.length > 0 ? locs[0].location : 'Main Warehouse',
            destinationLocation: del.destination,
            quantity: qty,
            beforeQuantity: totalBefore,
            afterQuantity: totalAfter,
            delta: -qty,
            reason: `Customer dispatch order to ${del.destination}`,
            referenceId: del.deliveryNumber,
            performedBy: 'Shipping Team'
          });
        }
      }
    }

    if (this.isMongoConnected) {
      await del.save();
    }
    return del;
  }

  // --- Dashboard KPIs ---
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
    if (this.isMongoConnected) return await User.findOne({ email: email.toLowerCase() });
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  async registerUser(userData) {
    if (this.isMongoConnected) {
      const user = new User(userData);
      return await user.save();
    }
    const exists = this.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (exists) throw new Error("User with this email already exists");
    const user = { ...userData, createdAt: new Date() };
    this.users.push(user);
    return user;
  }
}

const store = new DataStore();
module.exports = store;
