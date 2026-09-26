import pool from '../config/db.js';

/**
 * GET /uoms
 * List all Units of Measure
 */
export async function getUoms(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.category_id, u.name, u.code, u.ratio, u.rounding, u.is_active, uc.name AS category_name
      FROM uoms u
      JOIN uom_categories uc ON u.category_id = uc.id
      WHERE u.is_active = TRUE
      ORDER BY uc.name ASC, u.name ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching UoMs:', error);
    res.status(500).json({ success: false, error: 'Database error fetching UoMs' });
  }
}

/**
 * GET /locations
 * List all inventory locations
 */
export async function getLocations(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT l.*, p.name AS parent_name
      FROM locations l
      LEFT JOIN locations p ON l.parent_id = p.id
      WHERE l.is_active = TRUE
      ORDER BY l.location_type = 'internal' DESC, l.name ASC
    `);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ success: false, error: 'Database error fetching locations' });
  }
}

/**
 * GET /stats
 * High-level inventory KPI statistics
 */
export async function getStats(req, res) {
  try {
    const [[stats]] = await pool.query(`
      SELECT 
        COUNT(*) AS total_products,
        COALESCE(SUM(CASE WHEN stock_status = 'in_stock' THEN 1 ELSE 0 END), 0) AS in_stock_count,
        COALESCE(SUM(CASE WHEN stock_status = 'low_stock' THEN 1 ELSE 0 END), 0) AS low_stock_count,
        COALESCE(SUM(CASE WHEN stock_status = 'out_of_stock' THEN 1 ELSE 0 END), 0) AS out_of_stock_count,
        COALESCE(SUM(total_quantity), 0) AS total_units_on_hand,
        COALESCE(SUM(total_valuation), 0) AS total_inventory_valuation
      FROM view_product_stock_summary
      WHERE is_active = TRUE
    `);

    const [[{ catCount }]] = await pool.query('SELECT COUNT(*) as catCount FROM categories WHERE is_active = TRUE');
    const [[{ locCount }]] = await pool.query("SELECT COUNT(*) as locCount FROM locations WHERE location_type = 'internal' AND is_active = TRUE");

    res.json({
      success: true,
      data: {
        total_products: Number(stats.total_products),
        in_stock_count: Number(stats.in_stock_count),
        low_stock_count: Number(stats.low_stock_count),
        out_of_stock_count: Number(stats.out_of_stock_count),
        total_units_on_hand: Number(stats.total_units_on_hand),
        total_inventory_valuation: Number(stats.total_inventory_valuation),
        categories_count: Number(catCount),
        internal_locations_count: Number(locCount)
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, error: 'Database error fetching stats' });
  }
}
