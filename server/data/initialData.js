const initialProducts = [
  {
    sku: "PRD-STEEL-100",
    name: "Structural Carbon Steel Rods (100kg Lot)",
    category: "Raw Materials",
    quantity: 100,
    minThreshold: 20,
    unit: "kg",
    location: "Main Warehouse - Rack A",
    locations: [
      { location: "Main Warehouse - Rack A", quantity: 100 },
      { location: "Production Floor", quantity: 0 },
      { location: "Warehouse 2", quantity: 0 }
    ],
    price: 45.00,
    supplier: "National Steel Foundries"
  },
  {
    sku: "PRD-1001",
    name: "Heavy-Duty Pallet Wrap (500mm)",
    category: "Packaging Supplies",
    quantity: 145,
    minThreshold: 40,
    unit: "rolls",
    location: "Main Warehouse - Rack A",
    locations: [
      { location: "Main Warehouse - Rack A", quantity: 100 },
      { location: "Production Floor", quantity: 45 }
    ],
    price: 18.50,
    supplier: "Pacific Pack Co."
  },
  {
    sku: "PRD-1002",
    name: "Industrial Steel Flange 2-Inch",
    category: "Hardware & Fittings",
    quantity: 8,
    minThreshold: 25,
    unit: "pcs",
    location: "Rack B",
    locations: [
      { location: "Rack B", quantity: 8 },
      { location: "Main Warehouse - Rack A", quantity: 0 }
    ],
    price: 34.00,
    supplier: "Apex Castings Ltd."
  },
  {
    sku: "PRD-1003",
    name: "Silicone Sealing Gasket 4-Inch",
    category: "Hardware & Fittings",
    quantity: 0,
    minThreshold: 30,
    unit: "pcs",
    location: "Rack B",
    locations: [
      { location: "Rack B", quantity: 0 }
    ],
    price: 12.25,
    supplier: "Apex Castings Ltd."
  },
  {
    sku: "PRD-1004",
    name: "Corrugated Shipping Cartons (Large)",
    category: "Packaging Supplies",
    quantity: 520,
    minThreshold: 150,
    unit: "boxes",
    location: "Main Warehouse - Rack A",
    locations: [
      { location: "Main Warehouse - Rack A", quantity: 400 },
      { location: "Warehouse 2", quantity: 120 }
    ],
    price: 3.75,
    supplier: "Pacific Pack Co."
  },
  {
    sku: "PRD-1005",
    name: "Hydraulic Fluid ISO 46 (20L Drum)",
    category: "Maintenance & Fluids",
    quantity: 14,
    minThreshold: 10,
    unit: "drums",
    location: "Production Floor",
    locations: [
      { location: "Production Floor", quantity: 14 }
    ],
    price: 88.00,
    supplier: "TotalLube Industrial"
  },
  {
    sku: "PRD-1006",
    name: "Hex Head Bolts M12 x 50mm (Pack of 100)",
    category: "Fasteners",
    quantity: 85,
    minThreshold: 20,
    unit: "packs",
    location: "Rack B",
    locations: [
      { location: "Rack B", quantity: 50 },
      { location: "Production Floor", quantity: 35 }
    ],
    price: 24.50,
    supplier: "Fastenal Supply"
  },
  {
    sku: "PRD-1007",
    name: "High-Visibility Safety Vests (XL)",
    category: "Safety Equipment",
    quantity: 6,
    minThreshold: 15,
    unit: "pcs",
    location: "Main Warehouse - Rack A",
    locations: [
      { location: "Main Warehouse - Rack A", quantity: 6 }
    ],
    price: 14.00,
    supplier: "SafeWork Gear"
  },
  {
    sku: "PRD-1008",
    name: "Thermal Shipping Labels (Roll of 1000)",
    category: "Office & Logistics",
    quantity: 72,
    minThreshold: 25,
    unit: "rolls",
    location: "Warehouse 1",
    locations: [
      { location: "Warehouse 1", quantity: 72 }
    ],
    price: 15.00,
    supplier: "Pacific Pack Co."
  }
];

const initialReceipts = [
  {
    receiptNumber: "REC-2026-001",
    supplier: "National Steel Foundries",
    status: "Completed",
    destinationLocation: "Main Warehouse - Rack A",
    notes: "Initial 100kg steel delivery from supplier",
    items: [
      { productSku: "PRD-STEEL-100", productName: "Structural Carbon Steel Rods (100kg Lot)", quantityExpected: 100, quantityReceived: 100, unitPrice: 45.00 }
    ],
    createdAt: new Date(Date.now() - 3600000 * 24 * 3) // 3 days ago
  },
  {
    receiptNumber: "REC-2026-002",
    supplier: "Apex Castings Ltd.",
    status: "Pending Dock",
    destinationLocation: "Main Warehouse - Rack A",
    notes: "Requires standard visual inspection upon unloading",
    items: [
      { productSku: "PRD-1002", productName: "Industrial Steel Flange 2-Inch", quantityExpected: 50, quantityReceived: 0, unitPrice: 34.00 },
      { productSku: "PRD-1003", productName: "Silicone Sealing Gasket 4-Inch", quantityExpected: 100, quantityReceived: 0, unitPrice: 12.25 }
    ],
    createdAt: new Date(Date.now() - 3600000 * 12)
  }
];

const initialDeliveries = [
  {
    deliveryNumber: "DEL-2026-101",
    destination: "West Coast Distribution Center",
    carrier: "Express Freight Line",
    status: "Staging",
    items: [
      { productSku: "PRD-1001", productName: "Heavy-Duty Pallet Wrap (500mm)", quantity: 20 },
      { productSku: "PRD-1006", productName: "Hex Head Bolts M12 x 50mm (Pack of 100)", quantity: 15 }
    ],
    createdAt: new Date(Date.now() - 3600000 * 6)
  }
];

const initialTransfers = [
  {
    id: "trf-init-001",
    transferNumber: "TRF-2026-501",
    productSku: "PRD-1001",
    productName: "Heavy-Duty Pallet Wrap (500mm)",
    quantity: 45,
    fromLocation: "Main Warehouse - Rack A",
    toLocation: "Production Floor",
    transferredBy: "Floor Team",
    status: "Completed",
    notes: "Relocated to production line packing zone",
    createdAt: new Date(Date.now() - 3600000 * 48)
  },
  {
    id: "trf-init-002",
    transferNumber: "TRF-2026-502",
    productSku: "PRD-1006",
    productName: "Hex Head Bolts M12 x 50mm (Pack of 100)",
    quantity: 35,
    fromLocation: "Rack B",
    toLocation: "Production Floor",
    transferredBy: "Warehouse Operator",
    status: "Completed",
    notes: "Line assembly replenishment",
    createdAt: new Date(Date.now() - 3600000 * 20)
  }
];

const initialAdjustments = [
  {
    id: "adj-init-001",
    adjustmentNumber: "ADJ-2026-901",
    productSku: "PRD-1002",
    productName: "Industrial Steel Flange 2-Inch",
    location: "Rack B",
    previousQuantity: 10,
    newQuantity: 8,
    difference: -2,
    reason: "Damaged Stock",
    adjustedBy: "Inventory Manager",
    notes: "Bent flange thread discovered during morning check",
    createdAt: new Date(Date.now() - 3600000 * 18)
  },
  {
    id: "adj-init-002",
    adjustmentNumber: "ADJ-2026-902",
    productSku: "PRD-1004",
    productName: "Corrugated Shipping Cartons (Large)",
    location: "Warehouse 2",
    previousQuantity: 100,
    newQuantity: 120,
    difference: 20,
    reason: "Physical Cycle Count",
    adjustedBy: "Warehouse Staff",
    notes: "Found extra unopened bundle in overflow bay",
    createdAt: new Date(Date.now() - 3600000 * 8)
  }
];

const initialLedger = [
  {
    entryNumber: "LED-001",
    timestamp: new Date(Date.now() - 3600000 * 72),
    type: "RECEIPT",
    productSku: "PRD-STEEL-100",
    productName: "Structural Carbon Steel Rods (100kg Lot)",
    sourceLocation: "National Steel Foundries",
    destinationLocation: "Main Warehouse - Rack A",
    quantity: 100,
    beforeQuantity: 0,
    afterQuantity: 100,
    delta: 100,
    reason: "Initial supplier shipment receipt",
    referenceId: "REC-2026-001",
    performedBy: "Dock Supervisor",
    notes: "Inbound verified 100kg net weight"
  },
  {
    entryNumber: "LED-002",
    timestamp: new Date(Date.now() - 3600000 * 48),
    type: "INTERNAL_TRANSFER",
    productSku: "PRD-1001",
    productName: "Heavy-Duty Pallet Wrap (500mm)",
    sourceLocation: "Main Warehouse - Rack A",
    destinationLocation: "Production Floor",
    quantity: 45,
    beforeQuantity: 145,
    afterQuantity: 145,
    delta: 0,
    reason: "Relocated to production floor (total stock unchanged)",
    referenceId: "TRF-2026-501",
    performedBy: "Floor Team",
    notes: "Stock at Rack A reduced by 45, Production Floor increased by 45"
  },
  {
    entryNumber: "LED-003",
    timestamp: new Date(Date.now() - 3600000 * 18),
    type: "STOCK_ADJUSTMENT",
    productSku: "PRD-1002",
    productName: "Industrial Steel Flange 2-Inch",
    sourceLocation: "Rack B",
    destinationLocation: "Rack B",
    quantity: 2,
    beforeQuantity: 10,
    afterQuantity: 8,
    delta: -2,
    reason: "Damaged Stock",
    referenceId: "ADJ-2026-901",
    performedBy: "Inventory Manager",
    notes: "Physical audit: bent threads discarded"
  },
  {
    entryNumber: "LED-004",
    timestamp: new Date(Date.now() - 3600000 * 8),
    type: "STOCK_ADJUSTMENT",
    productSku: "PRD-1004",
    productName: "Corrugated Shipping Cartons (Large)",
    sourceLocation: "Warehouse 2",
    destinationLocation: "Warehouse 2",
    quantity: 20,
    beforeQuantity: 500,
    afterQuantity: 520,
    delta: 20,
    reason: "Physical Cycle Count",
    referenceId: "ADJ-2026-902",
    performedBy: "Warehouse Staff",
    notes: "Unopened bundle found in storage"
  }
];

const initialUsers = [
  {
    name: "Alex Morgan",
    email: "manager@stocksense.com",
    password: "password123",
    role: "Inventory Manager"
  },
  {
    name: "Sam Rivera",
    email: "staff@stocksense.com",
    password: "password123",
    role: "Warehouse Staff"
  }
];

module.exports = {
  initialProducts,
  initialReceipts,
  initialDeliveries,
  initialTransfers,
  initialAdjustments,
  initialLedger,
  initialUsers
};
