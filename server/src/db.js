const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, '../data/database.json');

// Default initial seed data for StockSense 12 entities
const initialData = () => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync('Password123!', salt);

  return {
    users: [
      {
        id: 'usr_1',
        name: 'Alex Rivera',
        email: 'alex.rivera@stocksense.io',
        password_hash: hashedPassword,
        role: 'Inventory Manager',
        warehouse_id: 'wh_1',
        created_at: '2026-09-01T08:00:00.000Z'
      },
      {
        id: 'usr_2',
        name: 'Sarah Chen',
        email: 'sarah.chen@stocksense.io',
        password_hash: hashedPassword,
        role: 'Warehouse Lead',
        warehouse_id: 'wh_2',
        created_at: '2026-09-05T09:30:00.000Z'
      },
      {
        id: 'usr_3',
        name: 'Michael Scott',
        email: 'michael.scott@stocksense.io',
        password_hash: hashedPassword,
        role: 'Logistics Coordinator',
        warehouse_id: 'wh_1',
        created_at: '2026-09-10T11:15:00.000Z'
      }
    ],
    categories: [
      { id: 'cat_1', name: 'Electronics & Components', code: 'ELEC', description: 'Microcontrollers, sensors, chips & display modules' },
      { id: 'cat_2', name: 'Industrial Hardware', code: 'HDW', description: 'Fasteners, brackets, chassis, and metal fittings' },
      { id: 'cat_3', name: 'Packaging & Supplies', code: 'PKG', description: 'Corrugated boxes, bubble wrap, ESD shielding bags' },
      { id: 'cat_4', name: 'Raw Materials', code: 'RAW', description: 'Copper wiring, aluminum extrusions, polymer pellets' }
    ],
    uoms: [
      { id: 'uom_1', name: 'Pieces', abbreviation: 'pcs' },
      { id: 'uom_2', name: 'Kilograms', abbreviation: 'kg' },
      { id: 'uom_3', name: 'Meters', abbreviation: 'm' },
      { id: 'uom_4', name: 'Boxes', abbreviation: 'box' }
    ],
    warehouses: [
      {
        id: 'wh_1',
        code: 'WH-MAIN-01',
        name: 'Central Logistics Hub',
        address: '104 Industrial Parkway, Sector 4, Silicon Hub',
        manager_name: 'Alex Rivera',
        status: 'Active',
        capacity: 10000,
        locations_count: 3
      },
      {
        id: 'wh_2',
        code: 'WH-EAST-02',
        name: 'East Coast Distribution Center',
        address: '88 Freight Depot Rd, Port Terminal Area',
        manager_name: 'Sarah Chen',
        status: 'Active',
        capacity: 7500,
        locations_count: 3
      },
      {
        id: 'wh_3',
        code: 'WH-WEST-03',
        name: 'West Coast Overflow Facility',
        address: '42 Harbor View Ave, Bay Area',
        manager_name: 'Michael Scott',
        status: 'Maintenance',
        capacity: 4000,
        locations_count: 2
      }
    ],
    locations: [
      { id: 'loc_1', warehouse_id: 'wh_1', code: 'WH1-RACK-A1', name: 'Rack A1 - Microcontroller Storage', type: 'High Density Rack', capacity: 1500 },
      { id: 'loc_2', warehouse_id: 'wh_1', code: 'WH1-BIN-B3', name: 'Bin B3 - Small Sensors & Modules', type: 'Parts Bin', capacity: 800 },
      { id: 'loc_3', warehouse_id: 'wh_1', code: 'WH1-PALLET-C', name: 'Pallet Zone C - Bulk Hardware', type: 'Floor Pallet', capacity: 3000 },
      { id: 'loc_4', warehouse_id: 'wh_2', code: 'WH2-RACK-01', name: 'Rack 01 - Heavy Metal Stock', type: 'Heavy Duty Rack', capacity: 2500 },
      { id: 'loc_5', warehouse_id: 'wh_2', code: 'WH2-BIN-A4', name: 'Bin A4 - Cable & Connectors', type: 'Parts Bin', capacity: 1000 },
      { id: 'loc_6', warehouse_id: 'wh_2', code: 'WH2-PALLET-E', name: 'Pallet E - Packaging Materials', type: 'Floor Pallet', capacity: 2000 },
      { id: 'loc_7', warehouse_id: 'wh_3', code: 'WH3-RACK-X1', name: 'Rack X1 - Overflow Stock', type: 'High Density Rack', capacity: 2000 },
      { id: 'loc_8', warehouse_id: 'wh_3', code: 'WH3-BIN-Y2', name: 'Bin Y2 - Spares Shelf', type: 'Shelf', capacity: 1000 }
    ],
    products: [
      {
        id: 'prod_1',
        sku: 'ELEC-MCU-32',
        name: 'STM32F4 ARM Cortex Microcontroller',
        category_id: 'cat_1',
        uom_id: 'uom_1',
        min_stock_threshold: 150,
        reorder_qty: 500,
        price: 4.85,
        created_at: '2026-09-02T10:00:00.000Z'
      },
      {
        id: 'prod_2',
        sku: 'ELEC-OLED-096',
        name: '0.96 inch I2C OLED Display Module',
        category_id: 'cat_1',
        uom_id: 'uom_1',
        min_stock_threshold: 80,
        reorder_qty: 300,
        price: 3.20,
        created_at: '2026-09-02T11:00:00.000Z'
      },
      {
        id: 'prod_3',
        sku: 'HDW-M4-BOLT',
        name: 'Stainless Steel M4 Hex Socket Bolts (Pack of 100)',
        category_id: 'cat_2',
        uom_id: 'uom_4',
        min_stock_threshold: 40,
        reorder_qty: 150,
        price: 12.50,
        created_at: '2026-09-04T09:00:00.000Z'
      },
      {
        id: 'prod_4',
        sku: 'PKG-BOX-MED',
        name: 'Double-Wall Corrugated Shipping Box (30x20x20 cm)',
        category_id: 'cat_3',
        uom_id: 'uom_1',
        min_stock_threshold: 200,
        reorder_qty: 1000,
        price: 0.95,
        created_at: '2026-09-06T14:20:00.000Z'
      },
      {
        id: 'prod_5',
        sku: 'RAW-COP-WIRE',
        name: 'Insulated 18 AWG Stranded Copper Wire Roll (100m)',
        category_id: 'cat_4',
        uom_id: 'uom_3',
        min_stock_threshold: 25,
        reorder_qty: 100,
        price: 45.00,
        created_at: '2026-09-08T15:45:00.000Z'
      },
      {
        id: 'prod_6',
        sku: 'ELEC-BLE-50',
        name: 'Bluetooth 5.0 Low Energy Transceiver IC',
        category_id: 'cat_1',
        uom_id: 'uom_1',
        min_stock_threshold: 100,
        reorder_qty: 400,
        price: 2.10,
        created_at: '2026-09-12T10:00:00.000Z'
      }
    ],
    stock_quantities: [
      { id: 'sq_1', product_id: 'prod_1', warehouse_id: 'wh_1', location_id: 'loc_1', qty_on_hand: 650, qty_reserved: 50 },
      { id: 'sq_2', product_id: 'prod_2', warehouse_id: 'wh_1', location_id: 'loc_2', qty_on_hand: 45, qty_reserved: 10 }, // Low stock (<80)
      { id: 'sq_3', product_id: 'prod_3', warehouse_id: 'wh_1', location_id: 'loc_3', qty_on_hand: 120, qty_reserved: 20 },
      { id: 'sq_4', product_id: 'prod_4', warehouse_id: 'wh_2', location_id: 'loc_6', qty_on_hand: 1100, qty_reserved: 150 },
      { id: 'sq_5', product_id: 'prod_5', warehouse_id: 'wh_2', location_id: 'loc_4', qty_on_hand: 12, qty_reserved: 5 }, // Low stock (<25)
      { id: 'sq_6', product_id: 'prod_6', warehouse_id: 'wh_3', location_id: 'loc_7', qty_on_hand: 0, qty_reserved: 0 } // Out of stock (0)
    ],
    receipts: [
      {
        id: 'rec_101',
        receipt_number: 'REC-2026-001',
        supplier_name: 'Apex Semiconductor Distributors',
        warehouse_id: 'wh_1',
        status: 'Ready',
        expected_date: '2026-09-28',
        created_by: 'Alex Rivera',
        created_at: '2026-09-20T09:00:00.000Z',
        items_count: 2,
        line_items: [
          { product_id: 'prod_1', qty: 500, unit_price: 4.50 },
          { product_id: 'prod_2', qty: 300, unit_price: 2.95 }
        ]
      },
      {
        id: 'rec_102',
        receipt_number: 'REC-2026-002',
        supplier_name: 'Titan Fasteners & Alloys',
        warehouse_id: 'wh_2',
        status: 'Waiting',
        expected_date: '2026-09-30',
        created_by: 'Sarah Chen',
        created_at: '2026-09-22T14:15:00.000Z',
        items_count: 1,
        line_items: [
          { product_id: 'prod_3', qty: 200, unit_price: 11.00 }
        ]
      },
      {
        id: 'rec_103',
        receipt_number: 'REC-2026-003',
        supplier_name: 'PolyPack Logistics Solutions',
        warehouse_id: 'wh_1',
        status: 'Done',
        expected_date: '2026-09-18',
        created_by: 'Michael Scott',
        created_at: '2026-09-15T11:00:00.000Z',
        items_count: 1,
        line_items: [
          { product_id: 'prod_4', qty: 1000, unit_price: 0.85 }
        ]
      }
    ],
    delivery_orders: [
      {
        id: 'del_201',
        do_number: 'DO-2026-881',
        customer_name: 'RoboTech Automation Labs',
        warehouse_id: 'wh_1',
        status: 'Waiting',
        scheduled_date: '2026-09-29',
        created_by: 'Alex Rivera',
        created_at: '2026-09-21T10:30:00.000Z',
        items_count: 2,
        line_items: [
          { product_id: 'prod_1', qty: 50, unit_price: 6.20 },
          { product_id: 'prod_3', qty: 10, unit_price: 16.00 }
        ]
      },
      {
        id: 'del_202',
        do_number: 'DO-2026-882',
        customer_name: 'Global Circuit Assembly Inc.',
        warehouse_id: 'wh_2',
        status: 'Ready',
        scheduled_date: '2026-09-27',
        created_by: 'Sarah Chen',
        created_at: '2026-09-23T08:45:00.000Z',
        items_count: 1,
        line_items: [
          { product_id: 'prod_4', qty: 150, unit_price: 1.40 }
        ]
      },
      {
        id: 'del_203',
        do_number: 'DO-2026-883',
        customer_name: 'NextGen IoT Systems',
        warehouse_id: 'wh_1',
        status: 'Done',
        scheduled_date: '2026-09-24',
        created_by: 'Alex Rivera',
        created_at: '2026-09-19T16:00:00.000Z',
        items_count: 1,
        line_items: [
          { product_id: 'prod_2', qty: 25, unit_price: 4.50 }
        ]
      }
    ],
    internal_transfers: [
      {
        id: 'trf_301',
        transfer_number: 'TRF-2026-044',
        src_warehouse_id: 'wh_1',
        src_location_id: 'loc_1',
        dest_warehouse_id: 'wh_2',
        dest_location_id: 'loc_5',
        status: 'Waiting',
        scheduled_date: '2026-09-30',
        created_by: 'Alex Rivera',
        created_at: '2026-09-24T12:00:00.000Z',
        product_id: 'prod_1',
        qty: 100
      },
      {
        id: 'trf_302',
        transfer_number: 'TRF-2026-045',
        src_warehouse_id: 'wh_2',
        src_location_id: 'loc_6',
        dest_warehouse_id: 'wh_3',
        dest_location_id: 'loc_7',
        status: 'Ready',
        scheduled_date: '2026-09-28',
        created_by: 'Sarah Chen',
        created_at: '2026-09-25T09:10:00.000Z',
        product_id: 'prod_4',
        qty: 250
      }
    ],
    stock_adjustments: [
      {
        id: 'adj_401',
        adj_number: 'ADJ-2026-012',
        warehouse_id: 'wh_1',
        location_id: 'loc_2',
        product_id: 'prod_2',
        old_qty: 55,
        new_qty: 45,
        reason: 'Damaged packaging discovered during audit',
        status: 'Done',
        created_by: 'Alex Rivera',
        created_at: '2026-09-22T15:30:00.000Z'
      }
    ],
    stock_ledger: [
      {
        id: 'ledg_1',
        timestamp: '2026-09-22T15:30:00.000Z',
        doc_type: 'Adjustment',
        doc_number: 'ADJ-2026-012',
        product_id: 'prod_2',
        product_name: '0.96 inch I2C OLED Display Module',
        warehouse_id: 'wh_1',
        warehouse_name: 'Central Logistics Hub',
        location_id: 'loc_2',
        location_name: 'Bin B3 - Small Sensors & Modules',
        qty_change: -10,
        balance_after: 45,
        user_name: 'Alex Rivera'
      },
      {
        id: 'ledg_2',
        timestamp: '2026-09-24T16:00:00.000Z',
        doc_type: 'Delivery',
        doc_number: 'DO-2026-883',
        product_id: 'prod_2',
        product_name: '0.96 inch I2C OLED Display Module',
        warehouse_id: 'wh_1',
        warehouse_name: 'Central Logistics Hub',
        location_id: 'loc_2',
        location_name: 'Bin B3 - Small Sensors & Modules',
        qty_change: -25,
        balance_after: 55,
        user_name: 'Alex Rivera'
      },
      {
        id: 'ledg_3',
        timestamp: '2026-09-18T11:00:00.000Z',
        doc_type: 'Receipt',
        doc_number: 'REC-2026-003',
        product_id: 'prod_4',
        product_name: 'Double-Wall Corrugated Shipping Box (30x20x20 cm)',
        warehouse_id: 'wh_2',
        warehouse_name: 'East Coast Distribution Center',
        location_id: 'loc_6',
        location_name: 'Pallet E - Packaging Materials',
        qty_change: +1000,
        balance_after: 1100,
        user_name: 'Michael Scott'
      }
    ],
    otp_requests: {}
  };
};

class DB {
  constructor() {
    this.ensureDataDir();
    this.data = this.loadData();
  }

  ensureDataDir() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  loadData() {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse database file, resetting to initial seed.', err);
      }
    }
    const seed = initialData();
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf8');
    return seed;
  }

  save() {
    fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
  }

  // User methods
  findUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  createUser(userData) {
    const newUser = {
      id: `usr_${Date.now()}`,
      name: userData.name,
      email: userData.email,
      password_hash: bcrypt.hashSync(userData.password, 10),
      role: userData.role || 'Inventory Specialist',
      warehouse_id: userData.warehouse_id || 'wh_1',
      created_at: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUserProfile(userId, { name, email, role, warehouse_id }) {
    const user = this.findUserById(userId);
    if (!user) return null;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (warehouse_id) user.warehouse_id = warehouse_id;
    this.save();
    return user;
  }

  updateUserPassword(email, newPassword) {
    const user = this.findUserByEmail(email);
    if (!user) return false;
    user.password_hash = bcrypt.hashSync(newPassword, 10);
    this.save();
    return true;
  }

  // OTP methods
  saveOTP(email, otp) {
    this.data.otp_requests[email.toLowerCase()] = {
      otp: String(otp),
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    };
    this.save();
  }

  verifyOTP(email, otp) {
    const req = this.data.otp_requests[email.toLowerCase()];
    if (!req) return { valid: false, message: 'No OTP requested for this email' };
    if (Date.now() > req.expiresAt) {
      delete this.data.otp_requests[email.toLowerCase()];
      this.save();
      return { valid: false, message: 'OTP has expired. Please request a new one.' };
    }
    if (req.otp !== String(otp)) {
      return { valid: false, message: 'Invalid OTP code. Please try again.' };
    }
    delete this.data.otp_requests[email.toLowerCase()];
    this.save();
    return { valid: true };
  }

  // Warehouse & Location methods
  getWarehouses() {
    return this.data.warehouses.map(wh => {
      const locs = this.data.locations.filter(l => l.warehouse_id === wh.id);
      const stockItems = this.data.stock_quantities.filter(sq => sq.warehouse_id === wh.id);
      const totalUnits = stockItems.reduce((acc, curr) => acc + curr.qty_on_hand, 0);
      return {
        ...wh,
        locations: locs,
        locations_count: locs.length,
        total_stock_units: totalUnits
      };
    });
  }

  createWarehouse({ code, name, address, manager_name, status, capacity }) {
    const newWh = {
      id: `wh_${Date.now()}`,
      code: code || `WH-${Date.now().toString().slice(-4)}`,
      name,
      address,
      manager_name: manager_name || 'Unassigned',
      status: status || 'Active',
      capacity: parseInt(capacity) || 5000,
      locations_count: 0
    };
    this.data.warehouses.push(newWh);
    this.save();
    return newWh;
  }

  updateWarehouse(id, updateData) {
    const wh = this.data.warehouses.find(w => w.id === id);
    if (!wh) return null;
    Object.assign(wh, updateData);
    this.save();
    return wh;
  }

  createLocation({ warehouse_id, code, name, type, capacity }) {
    const newLoc = {
      id: `loc_${Date.now()}`,
      warehouse_id,
      code: code || `LOC-${Date.now().toString().slice(-4)}`,
      name,
      type: type || 'Standard Rack',
      capacity: parseInt(capacity) || 1000
    };
    this.data.locations.push(newLoc);
    this.save();
    return newLoc;
  }

  // KPI & Dashboard aggregator method
  getKPIs({ doc_type, status, warehouse_id, category_id } = {}) {
    // 1. Total Products in Stock
    let productsList = [...this.data.products];
    if (category_id && category_id !== 'all') {
      productsList = productsList.filter(p => p.category_id === category_id);
    }

    let stocksList = [...this.data.stock_quantities];
    if (warehouse_id && warehouse_id !== 'all') {
      stocksList = stocksList.filter(sq => sq.warehouse_id === warehouse_id);
    }

    // Filter products matching active stock items & category
    const validProductIds = new Set(productsList.map(p => p.id));
    const activeStocks = stocksList.filter(sq => validProductIds.has(sq.product_id));

    // Calculate aggregated quantities per product
    const productStockMap = {};
    productsList.forEach(p => {
      productStockMap[p.id] = {
        product: p,
        totalQty: 0,
        locations: []
      };
    });

    activeStocks.forEach(sq => {
      if (productStockMap[sq.product_id]) {
        productStockMap[sq.product_id].totalQty += sq.qty_on_hand;
        productStockMap[sq.product_id].locations.push(sq);
      }
    });

    let totalProductsInStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    Object.values(productStockMap).forEach(item => {
      if (item.totalQty > 0) totalProductsInStock++;
      if (item.totalQty === 0) {
        outOfStockCount++;
      } else if (item.totalQty <= item.product.min_stock_threshold) {
        lowStockCount++;
      }
    });

    // 2. Receipts, Deliveries, Transfers filter by warehouse/status
    let receiptsList = [...this.data.receipts];
    let deliveriesList = [...this.data.delivery_orders];
    let transfersList = [...this.data.internal_transfers];

    if (warehouse_id && warehouse_id !== 'all') {
      receiptsList = receiptsList.filter(r => r.warehouse_id === warehouse_id);
      deliveriesList = deliveriesList.filter(d => d.warehouse_id === warehouse_id);
      transfersList = transfersList.filter(t => t.src_warehouse_id === warehouse_id || t.dest_warehouse_id === warehouse_id);
    }

    if (status && status !== 'all') {
      receiptsList = receiptsList.filter(r => r.status.toLowerCase() === status.toLowerCase());
      deliveriesList = deliveriesList.filter(d => d.status.toLowerCase() === status.toLowerCase());
      transfersList = transfersList.filter(t => t.status.toLowerCase() === status.toLowerCase());
    }

    const pendingReceipts = receiptsList.filter(r => ['draft', 'waiting', 'ready'].includes(r.status.toLowerCase())).length;
    const pendingDeliveries = deliveriesList.filter(d => ['draft', 'waiting', 'ready'].includes(d.status.toLowerCase())).length;
    const scheduledTransfers = transfersList.filter(t => ['draft', 'waiting', 'ready', 'scheduled'].includes(t.status.toLowerCase())).length;

    // Filter Stock Ledger timeline
    let ledgerTimeline = [...this.data.stock_ledger];
    if (doc_type && doc_type !== 'all') {
      ledgerTimeline = ledgerTimeline.filter(l => l.doc_type.toLowerCase() === doc_type.toLowerCase());
    }
    if (warehouse_id && warehouse_id !== 'all') {
      ledgerTimeline = ledgerTimeline.filter(l => l.warehouse_id === warehouse_id);
    }

    // Category Stock Breakdown chart data
    const categoryBreakdown = this.data.categories.map(cat => {
      const catProducts = this.data.products.filter(p => p.category_id === cat.id);
      const catProductIds = new Set(catProducts.map(p => p.id));
      const catStockSum = activeStocks
        .filter(sq => catProductIds.has(sq.product_id))
        .reduce((sum, sq) => sum + sq.qty_on_hand, 0);

      return {
        id: cat.id,
        name: cat.name,
        code: cat.code,
        unitsCount: catStockSum,
        productCount: catProducts.length
      };
    });

    // Low & Out of stock warning items table
    const lowStockAlerts = Object.values(productStockMap)
      .filter(item => item.totalQty <= item.product.min_stock_threshold)
      .map(item => {
        const cat = this.data.categories.find(c => c.id === item.product.category_id);
        const uom = this.data.uoms.find(u => u.id === item.product.uom_id);
        return {
          id: item.product.id,
          sku: item.product.sku,
          name: item.product.name,
          categoryName: cat ? cat.name : 'Uncategorized',
          uom: uom ? uom.abbreviation : 'pcs',
          qtyOnHand: item.totalQty,
          threshold: item.product.min_stock_threshold,
          reorderQty: item.product.reorder_qty,
          status: item.totalQty === 0 ? 'Out of Stock' : 'Low Stock'
        };
      });

    return {
      kpis: {
        totalProductsInStock,
        totalProductsCatalog: this.data.products.length,
        lowStockCount,
        outOfStockCount,
        pendingReceipts,
        pendingDeliveries,
        scheduledTransfers,
        activeWarehousesCount: this.data.warehouses.filter(w => w.status === 'Active').length
      },
      ledgerTimeline,
      categoryBreakdown,
      lowStockAlerts,
      meta: {
        appliedFilters: { doc_type, status, warehouse_id, category_id }
      }
    };
  }

  // Getters for frontend management screens
  getAllData() {
    return {
      users: this.data.users,
      categories: this.data.categories,
      uoms: this.data.uoms,
      warehouses: this.getWarehouses(),
      products: this.data.products,
      stock_quantities: this.data.stock_quantities,
      receipts: this.data.receipts,
      delivery_orders: this.data.delivery_orders,
      internal_transfers: this.data.internal_transfers,
      stock_adjustments: this.data.stock_adjustments,
      stock_ledger: this.data.stock_ledger
    };
  }
}

module.exports = new DB();
