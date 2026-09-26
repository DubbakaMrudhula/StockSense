-- Migration 002: Analytical Views and Reorder Computation
-- Author: Member 1 (Database Architect & Product Management)
-- Database: odoo_inventory

-- Consolidated Product Stock View with Dynamic Low-Stock & Out-of-Stock Status
CREATE OR REPLACE VIEW view_product_stock_summary AS
SELECT 
    p.id AS id,
    p.id AS product_id,
    p.name,
    p.sku,
    p.barcode,
    p.category_id,
    c.name AS category_name,
    p.uom_id,
    u.name AS uom_name,
    u.code AS uom_code,
    p.cost_price,
    p.sale_price,
    p.min_stock_level,
    p.max_stock_level,
    p.reorder_quantity,
    p.is_active,
    p.description,
    p.created_at,
    p.updated_at,
    COALESCE(SUM(sq.quantity), 0.00) AS total_quantity,
    COALESCE(SUM(sq.reserved_quantity), 0.00) AS total_reserved,
    COALESCE(SUM(sq.quantity - sq.reserved_quantity), 0.00) AS total_available,
    ROUND(COALESCE(SUM(sq.quantity), 0.00) * p.cost_price, 2) AS total_valuation,
    CASE 
        WHEN COALESCE(SUM(sq.quantity), 0.00) <= 0 THEN 'out_of_stock'
        WHEN COALESCE(SUM(sq.quantity), 0.00) <= p.min_stock_level THEN 'low_stock'
        ELSE 'in_stock'
    END AS stock_status
FROM products p
JOIN categories c ON p.category_id = c.id
JOIN uoms u ON p.uom_id = u.id
LEFT JOIN stock_quants sq ON p.id = sq.product_id
GROUP BY p.id, c.id, u.id;

-- Location Specific Stock View with Location-Level Reorder Status
CREATE OR REPLACE VIEW view_location_stock_status AS
SELECT 
    sq.id AS quant_id,
    sq.product_id,
    p.name AS product_name,
    p.sku,
    sq.location_id,
    l.name AS location_name,
    l.code AS location_code,
    l.location_type,
    sq.quantity,
    sq.reserved_quantity,
    (sq.quantity - sq.reserved_quantity) AS available_quantity,
    COALESCE(rr.min_quantity, p.min_stock_level, 0.00) AS min_threshold,
    COALESCE(rr.max_quantity, p.max_stock_level, 0.00) AS max_threshold,
    COALESCE(rr.reorder_quantity, p.reorder_quantity, 0.00) AS suggested_reorder_qty,
    CASE
        WHEN sq.quantity <= 0 THEN 'out_of_stock'
        WHEN sq.quantity <= COALESCE(rr.min_quantity, p.min_stock_level, 0.00) THEN 'low_stock'
        ELSE 'in_stock'
    END AS location_stock_status
FROM stock_quants sq
JOIN products p ON sq.product_id = p.id
JOIN locations l ON sq.location_id = l.id
LEFT JOIN reordering_rules rr ON (rr.product_id = sq.product_id AND rr.location_id = sq.location_id AND rr.is_active = TRUE);
