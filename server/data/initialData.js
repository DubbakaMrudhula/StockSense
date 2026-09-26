const initialProducts = [
  {
    sku: "PRD-1001",
    name: "Heavy-Duty Pallet Wrap (500mm)",
    category: "Packaging Supplies",
    quantity: 145,
    minThreshold: 40,
    unit: "rolls",
    location: "Aisle 1 - Bay A",
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
    location: "Aisle 4 - Shelf 3",
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
    location: "Aisle 4 - Shelf 4",
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
    location: "Bulk Staging Zone",
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
    location: "Hazard Staging Bay",
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
    location: "Aisle 2 - Bin 14",
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
    location: "Safety Cabinet S1",
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
    location: "Packing Desk 2",
    price: 15.00,
    supplier: "Pacific Pack Co."
  }
];

const initialReceipts = [
  {
    receiptNumber: "REC-2026-001",
    supplier: "Apex Castings Ltd.",
    status: "Pending Dock",
    destinationLocation: "Inbound Dock Bay 1",
    notes: "Requires standard visual inspection upon unloading",
    items: [
      { productSku: "PRD-1002", productName: "Industrial Steel Flange 2-Inch", quantityExpected: 50, quantityReceived: 0, unitPrice: 34.00 },
      { productSku: "PRD-1003", productName: "Silicone Sealing Gasket 4-Inch", quantityExpected: 100, quantityReceived: 0, unitPrice: 12.25 }
    ]
  },
  {
    receiptNumber: "REC-2026-002",
    supplier: "Pacific Pack Co.",
    status: "In Inspection",
    destinationLocation: "Bulk Staging Zone",
    notes: "Pallet shipment arriving via freight carrier",
    items: [
      { productSku: "PRD-1004", productName: "Corrugated Shipping Cartons (Large)", quantityExpected: 300, quantityReceived: 300, unitPrice: 3.75 }
    ]
  },
  {
    receiptNumber: "REC-2026-003",
    supplier: "TotalLube Industrial",
    status: "Completed",
    destinationLocation: "Hazard Staging Bay",
    notes: "Batch inspection cleared by safety supervisor",
    items: [
      { productSku: "PRD-1005", productName: "Hydraulic Fluid ISO 46 (20L Drum)", quantityExpected: 10, quantityReceived: 10, unitPrice: 88.00 }
    ]
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
    ]
  },
  {
    deliveryNumber: "DEL-2026-102",
    destination: "Metro Assembly Plant #3",
    carrier: "Internal Transport Van 2",
    status: "Picked",
    items: [
      { productSku: "PRD-1004", productName: "Corrugated Shipping Cartons (Large)", quantity: 100 }
    ]
  },
  {
    deliveryNumber: "DEL-2026-103",
    destination: "Harbor Operations Branch",
    carrier: "Express Freight Line",
    status: "Dispatched",
    items: [
      { productSku: "PRD-1005", productName: "Hydraulic Fluid ISO 46 (20L Drum)", quantity: 4 }
    ]
  }
];

const initialTransfers = [
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
    productName: "Hex Head Bolts M12 x 50mm (Pack of 100)",
    quantity: 25,
    fromLocation: "Receiving Bay 2",
    toLocation: "Aisle 2 - Bin 14",
    transferredBy: "Warehouse Operator",
    status: "Completed"
  },
  {
    transferNumber: "TRF-2026-503",
    productSku: "PRD-1004",
    productName: "Corrugated Shipping Cartons (Large)",
    quantity: 50,
    fromLocation: "Bulk Staging Zone",
    toLocation: "Packing Desk 1",
    transferredBy: "Warehouse Operator",
    status: "In Transit"
  }
];

const initialAdjustments = [
  {
    adjustmentNumber: "ADJ-2026-901",
    productSku: "PRD-1002",
    productName: "Industrial Steel Flange 2-Inch",
    previousQuantity: 10,
    newQuantity: 8,
    difference: -2,
    reason: "Damaged Stock",
    adjustedBy: "Inventory Manager",
    notes: "Bent flange thread discovered during morning check"
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
    notes: "Found extra unopened bundle in overflow bay"
  }
];

const initialUsers = [
  {
    name: "Alex Morgan",
    email: "manager@stocksense.com",
    password: "password123", // In mock/fallback or hashed in DB
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
  initialUsers
};
