-- =============================================================================
-- StockSense — Enterprise Inventory Management System
-- Complete Relational Database Schema & Migrations (12 Core Entities)
-- Compatible with MySQL 8.0+ / PostgreSQL 14+
-- =============================================================================

-- 1. User Entity (Slice 1: Auth & User Management)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Inventory Specialist',
    warehouse_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Warehouse Entity (Slice 1: Settings & Facility Management)
CREATE TABLE IF NOT EXISTS warehouses (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    manager_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',
    capacity INT DEFAULT 5000,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Location Entity (Slice 1: Internal Storage Sub-Locations)
CREATE TABLE IF NOT EXISTS locations (
    id VARCHAR(50) PRIMARY KEY,
    warehouse_id VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'High Density Rack',
    capacity INT DEFAULT 1000,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id) ON DELETE CASCADE
);

-- 4. Category Entity (Slice 2: Products & Master Catalog)
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT
);

-- 5. UnitOfMeasure Entity (Slice 2: UOM Standards)
CREATE TABLE IF NOT EXISTS units_of_measure (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    abbreviation VARCHAR(15) NOT NULL
);

-- 6. Product Entity (Slice 2: SKU Catalog Definition)
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    uom_id VARCHAR(50) NOT NULL,
    min_stock_threshold INT NOT NULL DEFAULT 50,
    reorder_qty INT NOT NULL DEFAULT 200,
    price DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (uom_id) REFERENCES units_of_measure(id)
);

-- 7. StockQuantity Entity (Slice 3: Real-Time Location Quantities & Reservations)
CREATE TABLE IF NOT EXISTS stock_quantities (
    id VARCHAR(50) PRIMARY KEY,
    product_id VARCHAR(50) NOT NULL,
    warehouse_id VARCHAR(50) NOT NULL,
    location_id VARCHAR(50) NOT NULL,
    qty_on_hand INT NOT NULL DEFAULT 0,
    qty_reserved INT NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (location_id) REFERENCES locations(id)
);

-- 8. Receipt Entity (Slice 2: Supplier Inbound PO Receipts)
CREATE TABLE IF NOT EXISTS receipts (
    id VARCHAR(50) PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_name VARCHAR(150) NOT NULL,
    warehouse_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Draft', -- Draft, Waiting, Ready, Done, Canceled
    expected_date DATE,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- 9. DeliveryOrder Entity (Slice 3: Customer Outbound Sales Deliveries)
CREATE TABLE IF NOT EXISTS delivery_orders (
    id VARCHAR(50) PRIMARY KEY,
    do_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    warehouse_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'Draft', -- Draft, Waiting, Ready, Done, Canceled
    scheduled_date DATE,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- 10. InternalTransfer Entity (Slice 4: Warehouse Stock Transfers)
CREATE TABLE IF NOT EXISTS internal_transfers (
    id VARCHAR(50) PRIMARY KEY,
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    src_warehouse_id VARCHAR(50) NOT NULL,
    src_location_id VARCHAR(50) NOT NULL,
    dest_warehouse_id VARCHAR(50) NOT NULL,
    dest_location_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    qty INT NOT NULL,
    status VARCHAR(20) DEFAULT 'Draft', -- Draft, Scheduled, Done, Canceled
    scheduled_date DATE,
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (src_warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (dest_warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 11. StockAdjustment Entity (Slice 4: Inventory Physical Audits)
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id VARCHAR(50) PRIMARY KEY,
    adj_number VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id VARCHAR(50) NOT NULL,
    location_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    old_qty INT NOT NULL,
    new_qty INT NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'Done',
    created_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    FOREIGN KEY (location_id) REFERENCES locations(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 12. StockLedger Entity (Slice 4: Immutable Transaction Movement Audit Log)
CREATE TABLE IF NOT EXISTS stock_ledger (
    id VARCHAR(50) PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    doc_type VARCHAR(30) NOT NULL, -- Receipt, Delivery, Transfer, Adjustment
    doc_number VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    product_name VARCHAR(150) NOT NULL,
    warehouse_id VARCHAR(50) NOT NULL,
    warehouse_name VARCHAR(100) NOT NULL,
    location_id VARCHAR(50) NOT NULL,
    location_name VARCHAR(100) NOT NULL,
    qty_change INT NOT NULL,
    balance_after INT NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id)
);

-- Performance Indexes for Multi-Filter Dashboard Queries
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_stock_wh_loc ON stock_quantities(warehouse_id, location_id);
CREATE INDEX idx_ledger_doc_type ON stock_ledger(doc_type);
CREATE INDEX idx_ledger_timestamp ON stock_ledger(timestamp DESC);
