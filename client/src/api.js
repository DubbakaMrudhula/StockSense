const API_BASE = 'http://localhost:5000/api';

// Fallback in-browser data if backend server is not running during standalone preview
const fallbackData = {
  kpis: {
    totalProducts: 8,
    lowStockCount: 2,
    outOfStockCount: 1,
    criticalStockTotal: 3,
    pendingReceipts: 2,
    activeDeliveries: 2,
    activeTransfers: 1
  },
  products: [
    { sku: "PRD-1001", name: "Heavy-Duty Pallet Wrap (500mm)", category: "Packaging Supplies", quantity: 145, minThreshold: 40, unit: "rolls", location: "Aisle 1 - Bay A", price: 18.50, supplier: "Pacific Pack Co." },
    { sku: "PRD-1002", name: "Industrial Steel Flange 2-Inch", category: "Hardware & Fittings", quantity: 8, minThreshold: 25, unit: "pcs", location: "Aisle 4 - Shelf 3", price: 34.00, supplier: "Apex Castings Ltd." },
    { sku: "PRD-1003", name: "Silicone Sealing Gasket 4-Inch", category: "Hardware & Fittings", quantity: 0, minThreshold: 30, unit: "pcs", location: "Aisle 4 - Shelf 4", price: 12.25, supplier: "Apex Castings Ltd." },
    { sku: "PRD-1004", name: "Corrugated Shipping Cartons (Large)", category: "Packaging Supplies", quantity: 520, minThreshold: 150, unit: "boxes", location: "Bulk Staging Zone", price: 3.75, supplier: "Pacific Pack Co." },
    { sku: "PRD-1005", name: "Hydraulic Fluid ISO 46 (20L Drum)", category: "Maintenance & Fluids", quantity: 14, minThreshold: 10, unit: "drums", location: "Hazard Staging Bay", price: 88.00, supplier: "TotalLube Industrial" },
    { sku: "PRD-1006", name: "Hex Head Bolts M12 x 50mm (Pack of 100)", category: "Fasteners", quantity: 85, minThreshold: 20, unit: "packs", location: "Aisle 2 - Bin 14", price: 24.50, supplier: "Fastenal Supply" },
    { sku: "PRD-1007", name: "High-Visibility Safety Vests (XL)", category: "Safety Equipment", quantity: 6, minThreshold: 15, unit: "pcs", location: "Safety Cabinet S1", price: 14.00, supplier: "SafeWork Gear" },
    { sku: "PRD-1008", name: "Thermal Shipping Labels (Roll of 1000)", category: "Office & Logistics", quantity: 72, minThreshold: 25, unit: "rolls", location: "Packing Desk 2", price: 15.00, supplier: "Pacific Pack Co." }
  ],
  receipts: [
    {
      receiptNumber: "REC-2026-001",
      supplier: "Apex Castings Ltd.",
      status: "Pending Dock",
      destinationLocation: "Inbound Dock Bay 1",
      notes: "Requires visual inspection upon unloading",
      items: [
        { productSku: "PRD-1002", productName: "Industrial Steel Flange 2-Inch", quantityExpected: 50, quantityReceived: 0 },
        { productSku: "PRD-1003", productName: "Silicone Sealing Gasket 4-Inch", quantityExpected: 100, quantityReceived: 0 }
      ]
    },
    {
      receiptNumber: "REC-2026-002",
      supplier: "Pacific Pack Co.",
      status: "In Inspection",
      destinationLocation: "Bulk Staging Zone",
      notes: "Arriving via scheduled freight carrier",
      items: [
        { productSku: "PRD-1004", productName: "Corrugated Shipping Cartons (Large)", quantityExpected: 300, quantityReceived: 300 }
      ]
    }
  ],
  deliveries: [
    {
      deliveryNumber: "DEL-2026-101",
      destination: "West Coast Distribution Center",
      carrier: "Express Freight Line",
      status: "Staging",
      items: [
        { productSku: "PRD-1001", productName: "Heavy-Duty Pallet Wrap (500mm)", quantity: 20 },
        { productSku: "PRD-1006", productName: "Hex Head Bolts M12 x 50mm", quantity: 15 }
      ]
    },
    {
      deliveryNumber: "DEL-2026-102",
      destination: "Metro Assembly Plant #3",
      carrier: "Internal Transport Van 2",
      status: "Picked",
      items: [
        { productSku: "PRD-1004", productName: "Corrugated Shipping Cartons", quantity: 100 }
      ]
    }
  ],
  transfers: [
    {
      transferNumber: "TRF-2026-501",
      productSku: "PRD-1001",
      productName: "Heavy-Duty Pallet Wrap (500mm)",
      quantity: 30,
      fromLocation: "Bulk Staging Zone",
      toLocation: "Aisle 1 - Bay A",
      transferredBy: "Floor Team",
      status: "Completed"
    },
    {
      transferNumber: "TRF-2026-502",
      productSku: "PRD-1006",
      productName: "Hex Head Bolts M12 x 50mm",
      quantity: 25,
      fromLocation: "Receiving Bay 2",
      toLocation: "Aisle 2 - Bin 14",
      transferredBy: "Warehouse Operator",
      status: "Completed"
    }
  ],
  adjustments: [
    {
      adjustmentNumber: "ADJ-2026-901",
      productSku: "PRD-1002",
      productName: "Industrial Steel Flange 2-Inch",
      previousQuantity: 10,
      newQuantity: 8,
      difference: -2,
      reason: "Damaged Stock",
      adjustedBy: "Inventory Manager",
      notes: "Bent thread noted during morning shelf audit"
    },
    {
      adjustmentNumber: "ADJ-2026-902",
      productSku: "PRD-1004",
      productName: "Corrugated Shipping Cartons (Large)",
      previousQuantity: 500,
      newQuantity: 520,
      difference: 20,
      reason: "Physical Cycle Count",
      adjustedBy: "Warehouse Staff",
      notes: "Extra bundle located in overflow area"
    }
  ]
};

async function safeFetch(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      ...options
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    // If backend isn't reached, log and allow fallback handling
    console.info(`[StockSense API Notice] ${endpoint} using local fallback: ${err.message}`);
    return null;
  }
}

export const api = {
  async getKpis() {
    const data = await safeFetch('/dashboard/kpis');
    if (data) return data;
    
    // Compute from fallback
    const prods = fallbackData.products;
    const low = prods.filter(p => p.quantity > 0 && p.quantity <= p.minThreshold).length;
    const out = prods.filter(p => p.quantity === 0).length;
    return {
      totalProducts: prods.length,
      lowStockCount: low,
      outOfStockCount: out,
      criticalStockTotal: low + out,
      pendingReceipts: fallbackData.receipts.filter(r => r.status !== 'Completed').length,
      activeDeliveries: fallbackData.deliveries.filter(d => d.status !== 'Dispatched').length,
      activeTransfers: fallbackData.transfers.length
    };
  },

  async getProducts() {
    const data = await safeFetch('/products');
    return data || [...fallbackData.products];
  },

  async createProduct(productData) {
    const data = await safeFetch('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
    if (data) return data;
    const newP = { ...productData, createdAt: new Date() };
    fallbackData.products.unshift(newP);
    return newP;
  },

  async deleteProduct(sku) {
    const data = await safeFetch(`/products/${sku}`, { method: 'DELETE' });
    if (data) return data;
    fallbackData.products = fallbackData.products.filter(p => p.sku !== sku);
    return { success: true };
  },

  async getReceipts() {
    const data = await safeFetch('/receipts');
    return data || [...fallbackData.receipts];
  },

  async createReceipt(receiptData) {
    const data = await safeFetch('/receipts', {
      method: 'POST',
      body: JSON.stringify(receiptData)
    });
    if (data) return data;
    const newR = {
      ...receiptData,
      receiptNumber: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Pending Dock'
    };
    fallbackData.receipts.unshift(newR);
    return newR;
  },

  async updateReceiptStatus(receiptNumber, status) {
    const data = await safeFetch(`/receipts/${receiptNumber}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    if (data) return data;
    const r = fallbackData.receipts.find(item => item.receiptNumber === receiptNumber);
    if (r) r.status = status;
    return r;
  },

  async getDeliveries() {
    const data = await safeFetch('/deliveries');
    return data || [...fallbackData.deliveries];
  },

  async createDelivery(deliveryData) {
    const data = await safeFetch('/deliveries', {
      method: 'POST',
      body: JSON.stringify(deliveryData)
    });
    if (data) return data;
    const newD = {
      ...deliveryData,
      deliveryNumber: `DEL-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Staging'
    };
    fallbackData.deliveries.unshift(newD);
    return newD;
  },

  async updateDeliveryStatus(deliveryNumber, status) {
    const data = await safeFetch(`/deliveries/${deliveryNumber}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    if (data) return data;
    const d = fallbackData.deliveries.find(item => item.deliveryNumber === deliveryNumber);
    if (d) d.status = status;
    return d;
  },

  async getTransfers() {
    const data = await safeFetch('/transfers');
    return data || [...fallbackData.transfers];
  },

  async createTransfer(transferData) {
    const data = await safeFetch('/transfers', {
      method: 'POST',
      body: JSON.stringify(transferData)
    });
    if (data) return data;
    const newT = {
      ...transferData,
      transferNumber: `TRF-2026-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Completed'
    };
    fallbackData.transfers.unshift(newT);
    return newT;
  },

  async getAdjustments() {
    const data = await safeFetch('/adjustments');
    return data || [...fallbackData.adjustments];
  },

  async createAdjustment(adjData) {
    const data = await safeFetch('/adjustments', {
      method: 'POST',
      body: JSON.stringify(adjData)
    });
    if (data) return data;
    const newAdj = {
      ...adjData,
      adjustmentNumber: `ADJ-2026-${Math.floor(100 + Math.random() * 900)}`,
      difference: Number(adjData.newQuantity) - Number(adjData.previousQuantity)
    };
    fallbackData.adjustments.unshift(newAdj);
    return newAdj;
  },

  async login(credentials) {
    const data = await safeFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
    if (data) return data;
    return {
      message: "Login successful",
      user: {
        name: credentials.email.split('@')[0],
        email: credentials.email,
        role: credentials.role || 'Warehouse Staff'
      }
    };
  }
};
