-- Migration 001: Initial Core Inventory and Product Schema with Indexes
-- Author: Member 1 (Database Architect & Product Management)
-- Database: odoo_inventory

SET FOREIGN_KEY_CHECKS = 0;

-- Schema Migrations Tracking Table
CREATE TABLE IF NOT EXISTS schema_migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(255) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 1. Unit of Measure Categories
CREATE TABLE IF NOT EXISTS uom_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Units of Measure (UoM)
CREATE TABLE IF NOT EXISTS uoms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    ratio DECIMAL(12, 4) NOT NULL DEFAULT 1.0000,
    rounding DECIMAL(12, 4) NOT NULL DEFAULT 0.0100,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_uoms_category FOREIGN KEY (category_id) 
        REFERENCES uom_categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_uoms_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Product Categories (Hierarchical with parent_id self-reference)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_categories_parent FOREIGN KEY (parent_id) 
        REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_categories_parent (parent_id),
    INDEX idx_categories_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Warehouse & Inventory Locations
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_id INT NULL,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    location_type ENUM('internal', 'vendor', 'customer', 'inventory_loss', 'transit') NOT NULL DEFAULT 'internal',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_locations_parent FOREIGN KEY (parent_id) 
        REFERENCES locations(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_locations_parent (parent_id),
    INDEX idx_locations_type (location_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Products Core Table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(64) NOT NULL UNIQUE,
    barcode VARCHAR(64) NULL UNIQUE,
    category_id INT NOT NULL,
    uom_id INT NOT NULL,
    cost_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    sale_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    min_stock_level DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    max_stock_level DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    reorder_quantity DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) 
        REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_products_uom FOREIGN KEY (uom_id) 
        REFERENCES uoms(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    INDEX idx_products_name (name),
    INDEX idx_products_category_active (category_id, is_active),
    INDEX idx_products_min_stock (min_stock_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Stock Quants (Inventory availability per physical/logical location)
CREATE TABLE IF NOT EXISTS stock_quants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    location_id INT NOT NULL,
    quantity DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    reserved_quantity DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_quants_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_quants_location FOREIGN KEY (location_id) 
        REFERENCES locations(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uq_product_location UNIQUE (product_id, location_id),
    INDEX idx_stock_quants_location (location_id),
    INDEX idx_stock_quants_prod_qty (product_id, quantity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Reordering Rules per Location
CREATE TABLE IF NOT EXISTS reordering_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    location_id INT NOT NULL,
    min_quantity DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    max_quantity DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    reorder_quantity DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reorder_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_reorder_location FOREIGN KEY (location_id) 
        REFERENCES locations(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT uq_reorder_product_location UNIQUE (product_id, location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Stock Moves / Ledger (Full audit trail of all inventory transactions)
CREATE TABLE IF NOT EXISTS stock_moves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(64) NOT NULL,
    product_id INT NOT NULL,
    source_location_id INT NULL,
    dest_location_id INT NULL,
    quantity DECIMAL(12, 2) NOT NULL,
    move_type ENUM('initial_stock', 'adjustment', 'transfer', 'receipt', 'delivery') NOT NULL DEFAULT 'initial_stock',
    status ENUM('draft', 'waiting', 'confirmed', 'done', 'cancelled') NOT NULL DEFAULT 'done',
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_moves_product FOREIGN KEY (product_id) 
        REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_moves_source FOREIGN KEY (source_location_id) 
        REFERENCES locations(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_moves_dest FOREIGN KEY (dest_location_id) 
        REFERENCES locations(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_stock_moves_prod_time (product_id, created_at),
    INDEX idx_stock_moves_source (source_location_id),
    INDEX idx_stock_moves_dest (dest_location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
