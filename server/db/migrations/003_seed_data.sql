-- Migration 003: Realistic Enterprise Seed Data
-- Author: Member 1 (Database Architect & Product Management)
-- Database: odoo_inventory

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Insert UoM Categories
INSERT INTO uom_categories (id, name) VALUES
(1, 'Unit'),
(2, 'Weight'),
(3, 'Volume'),
(4, 'Length')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Insert Units of Measure
INSERT INTO uoms (id, category_id, name, code, ratio, rounding, is_active) VALUES
(1, 1, 'Units', 'pcs', 1.0000, 1.0000, TRUE),
(2, 1, 'Dozen', 'doz', 12.0000, 1.0000, TRUE),
(3, 1, 'Box (50 pcs)', 'bx50', 50.0000, 1.0000, TRUE),
(4, 2, 'Kilogram', 'kg', 1.0000, 0.0100, TRUE),
(5, 2, 'Gram', 'g', 0.0010, 0.1000, TRUE),
(6, 3, 'Liter', 'L', 1.0000, 0.0100, TRUE),
(7, 4, 'Meter', 'm', 1.0000, 0.0100, TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Insert Product Categories
INSERT INTO categories (id, parent_id, name, code, description, is_active) VALUES
(1, NULL, 'All Products', 'CAT-ALL', 'Root enterprise category', TRUE),
(2, 1, 'Electronics', 'CAT-ELEC', 'Electronic devices and hardware', TRUE),
(3, 2, 'Computers & Laptops', 'CAT-COMP', 'Workstations, laptops, and enterprise desktops', TRUE),
(4, 2, 'Peripherals & Accessories', 'CAT-PERI', 'Keyboards, mice, docks, and cables', TRUE),
(5, 1, 'Office Furniture', 'CAT-FURN', 'Ergonomic chairs, sit-stand desks, and cabinets', TRUE),
(6, 1, 'Raw Materials', 'CAT-RAW', 'Base manufacturing components and substrates', TRUE),
(7, 1, 'Packaging & Supplies', 'CAT-PACK', 'Carton boxes, tape, protective padding', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description);

-- 4. Insert Warehouse Locations
INSERT INTO locations (id, parent_id, name, code, location_type, is_active) VALUES
(1, NULL, 'Central Warehouse', 'WH-CENTRAL', 'internal', TRUE),
(2, 1, 'Production Floor', 'WH-PROD', 'internal', TRUE),
(3, 1, 'Downtown Retail Hub', 'WH-RETAIL', 'internal', TRUE),
(4, NULL, 'Transit Bay', 'WH-TRANSIT', 'transit', TRUE),
(5, NULL, 'Supplier Deliveries', 'LOC-SUPPLIER', 'vendor', TRUE),
(6, NULL, 'Customer Deliveries', 'LOC-CUSTOMER', 'customer', TRUE)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 5. Insert Sample Enterprise Products
INSERT INTO products (id, name, sku, barcode, category_id, uom_id, cost_price, sale_price, min_stock_level, max_stock_level, reorder_quantity, is_active, description) VALUES
(1, 'UltraBook Pro 15 Gen 4', 'PROD-LAP-001', '890123400101', 3, 1, 850.00, 1299.99, 10.00, 50.00, 20.00, TRUE, 'High performance 15.6-inch laptop with 32GB RAM and 1TB SSD for enterprise engineers.'),
(2, 'Ergonomic Wireless Mechanical Keyboard', 'PROD-KBD-002', '890123400102', 4, 1, 45.00, 89.99, 15.00, 80.00, 30.00, TRUE, 'Split ergonomic layout with hot-swappable switches and dual Bluetooth/2.4G connectivity.'),
(3, '4K Ultra-Wide Curved Monitor 34"', 'PROD-MON-003', '890123400103', 4, 1, 280.00, 499.00, 8.00, 30.00, 10.00, TRUE, '34-inch 144Hz curved IPS panel with USB-C 90W power delivery.'),
(4, 'Precision Bluetooth Optical Mouse', 'PROD-MOU-004', '890123400104', 4, 1, 12.50, 29.99, 25.00, 120.00, 50.00, TRUE, 'Silent clicks, ergonomic thumb rest, multi-device fast switching.'),
(5, 'Thunderbolt 4 Docking Station 12-in-1', 'PROD-DOC-005', '890123400105', 4, 1, 95.00, 189.50, 12.00, 60.00, 25.00, TRUE, 'Dual 4K HDMI/DisplayPort, Gigabit Ethernet, 100W PD charging.'),
(6, 'Executive Ergonomic Mesh Chair', 'PROD-CHR-006', '890123400106', 5, 1, 140.00, 299.00, 5.00, 25.00, 10.00, TRUE, 'Breathable Korean mesh with 4D armrests, lumbar support and aluminum base.'),
(7, 'Electric Dual-Motor Standing Desk (60x30)', 'PROD-DSK-007', '890123400107', 5, 1, 180.00, 379.00, 5.00, 20.00, 10.00, TRUE, 'Solid bamboo desktop with digital memory preset keypad and anti-collision sensor.'),
(8, 'Aluminum Alloy Ingot Grade 6061', 'RAW-ALU-008', '890123400108', 6, 4, 3.20, 5.50, 500.00, 2500.00, 1000.00, TRUE, 'Structural alloy material for CNC machining and frame fabrications.'),
(9, 'Heavy Duty Double-Wall Shipping Cartons (M)', 'PACK-BOX-009', '890123400109', 7, 3, 18.00, 34.00, 20.00, 100.00, 40.00, TRUE, '32 ECT corrugated boxes bundled in 50 units for secure transit shipping.'),
(10, 'Cat6 Shielded Patch Cable 2m (10-Pack)', 'PROD-CBL-010', '890123400110', 4, 1, 8.00, 18.50, 30.00, 150.00, 60.00, TRUE, 'Pure bare copper 26 AWG with gold-plated RJ45 connectors.')
ON DUPLICATE KEY UPDATE name=VALUES(name), cost_price=VALUES(cost_price), sale_price=VALUES(sale_price);

-- 6. Insert Stock Quants per Location (Demonstrating In-Stock, Low-Stock, and Out-of-Stock)
-- Product 1 (UltraBook Pro): Total = 28 (In Stock, Min=10)
-- Product 2 (Ergonomic Keyboard): Total = 9 (LOW STOCK, Min=15!)
-- Product 3 (4K Monitor): Total = 0 (OUT OF STOCK, Min=8!)
-- Product 4 (Optical Mouse): Total = 18 (LOW STOCK, Min=25!)
-- Product 5 (Thunderbolt Dock): Total = 45 (In Stock, Min=12)
-- Product 6 (Executive Chair): Total = 4 (LOW STOCK, Min=5!)
-- Product 7 (Standing Desk): Total = 14 (In Stock, Min=5)
-- Product 8 (Aluminum Ingot): Total = 1250 (In Stock, Min=500)
-- Product 9 (Shipping Cartons): Total = 65 (In Stock, Min=20)
-- Product 10 (Cat6 Cable): Total = 0 (OUT OF STOCK, Min=30!)

INSERT INTO stock_quants (product_id, location_id, quantity, reserved_quantity) VALUES
-- Product 1
(1, 1, 20.00, 2.00), -- WH-CENTRAL
(1, 3, 8.00, 0.00),  -- WH-RETAIL

-- Product 2 (Low Stock: 9 <= 15)
(2, 1, 6.00, 1.00),
(2, 3, 3.00, 0.00),

-- Product 3 (Out of stock: 0)
(3, 1, 0.00, 0.00),
(3, 3, 0.00, 0.00),

-- Product 4 (Low Stock: 18 <= 25)
(4, 1, 10.00, 2.00),
(4, 3, 8.00, 0.00),

-- Product 5 (Healthy: 45)
(5, 1, 35.00, 5.00),
(5, 3, 10.00, 0.00),

-- Product 6 (Low Stock: 4 <= 5)
(6, 1, 3.00, 0.00),
(6, 3, 1.00, 0.00),

-- Product 7 (Healthy: 14)
(7, 1, 10.00, 1.00),
(7, 3, 4.00, 0.00),

-- Product 8 (Healthy: 1250 kg)
(8, 1, 1000.00, 0.00),
(8, 2, 250.00, 0.00),

-- Product 9 (Healthy: 65 boxes)
(9, 1, 55.00, 0.00),
(9, 2, 10.00, 0.00),

-- Product 10 (Out of stock: 0)
(10, 1, 0.00, 0.00),
(10, 3, 0.00, 0.00)
ON DUPLICATE KEY UPDATE quantity=VALUES(quantity), reserved_quantity=VALUES(reserved_quantity);

-- 7. Insert Reordering Rules for Products per Location
INSERT INTO reordering_rules (product_id, location_id, min_quantity, max_quantity, reorder_quantity, is_active) VALUES
(1, 1, 8.00, 35.00, 15.00, TRUE),
(1, 3, 2.00, 15.00, 5.00, TRUE),
(2, 1, 10.00, 50.00, 20.00, TRUE),
(2, 3, 5.00, 30.00, 10.00, TRUE),
(3, 1, 5.00, 20.00, 10.00, TRUE),
(3, 3, 3.00, 10.00, 5.00, TRUE),
(4, 1, 15.00, 80.00, 35.00, TRUE),
(4, 3, 10.00, 40.00, 15.00, TRUE),
(5, 1, 8.00, 40.00, 15.00, TRUE),
(6, 1, 3.00, 15.00, 5.00, TRUE),
(6, 3, 2.00, 10.00, 5.00, TRUE),
(7, 1, 3.00, 12.00, 5.00, TRUE),
(8, 1, 400.00, 2000.00, 800.00, TRUE),
(9, 1, 15.00, 80.00, 30.00, TRUE),
(10, 1, 20.00, 100.00, 50.00, TRUE),
(10, 3, 10.00, 50.00, 20.00, TRUE)
ON DUPLICATE KEY UPDATE min_quantity=VALUES(min_quantity), max_quantity=VALUES(max_quantity);

-- 8. Insert Stock Moves (Audit Trail)
INSERT INTO stock_moves (reference, product_id, source_location_id, dest_location_id, quantity, move_type, status, notes) VALUES
('INIT/0001', 1, 5, 1, 25.00, 'receipt', 'done', 'Initial receipt from vendor Dell Distribution'),
('INT/0001', 1, 1, 3, 8.00, 'transfer', 'done', 'Transfer to retail showroom'),
('INIT/0002', 2, 5, 1, 15.00, 'receipt', 'done', 'Vendor batch delivery'),
('INT/0002', 2, 1, 3, 3.00, 'transfer', 'done', 'Store stock replenishment'),
('INIT/0003', 4, 5, 1, 20.00, 'receipt', 'done', 'Batch intake Logitech OEM'),
('INIT/0004', 5, 5, 1, 40.00, 'receipt', 'done', 'Docking station shipment intake'),
('INIT/0005', 8, 5, 1, 1250.00, 'receipt', 'done', 'Bulk metal raw material delivery'),
('INIT/0006', 9, 5, 1, 65.00, 'receipt', 'done', 'Packaging supplier delivery');

SET FOREIGN_KEY_CHECKS = 1;
