import pool from '../config/db.js';

// SKU validation regex: alphanumeric, dashes, underscores, dots (2 to 64 chars)
const SKU_REGEX = /^[A-Za-z0-9\-_.]+$/;

/**
 * GET /products
 * List all products with stock aggregations and smart filter support
 */
export async function getProducts(req, res) {
  try {
    const { category, status, search, sortBy = 'name', sortOrder = 'ASC' } = req.query;

    let query = `
      SELECT 
        v.id,
        v.product_id,
        v.name,
        v.sku,
        v.barcode,
        v.category_id,
        v.category_name,
        v.uom_id,
        v.uom_name,
        v.uom_code,
        v.cost_price,
        v.sale_price,
        v.min_stock_level,
        v.max_stock_level,
        v.reorder_quantity,
        v.is_active,
        v.description,
        v.created_at,
        v.updated_at,
        v.total_quantity,
        v.total_reserved,
        v.total_available,
        v.total_valuation,
        v.stock_status
      FROM view_product_stock_summary v
      WHERE 1=1
    `;
    const params = [];

    // Filter by Category (ID or hierarchy)
    if (category && category !== 'all') {
      query += ` AND (v.category_id = ? OR v.category_name = ?)`;
      params.push(category, category);
    }

    // Filter by Stock Status
    if (status && status !== 'all') {
      query += ` AND v.stock_status = ?`;
      params.push(status);
    }

    // General Search (SKU, Name, Barcode)
    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      query += ` AND (v.name LIKE ? OR v.sku LIKE ? OR v.barcode LIKE ?)`;
      params.push(term, term, term);
    }

    // Allowed sort columns
    const allowedSort = ['name', 'sku', 'sale_price', 'cost_price', 'total_quantity', 'stock_status', 'created_at'];
    const validSort = allowedSort.includes(sortBy) ? sortBy : 'name';
    const validOrder = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    query += ` ORDER BY v.${validSort} ${validOrder}`;

    const [rows] = await pool.query(query, params);
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: 'Database error fetching products', details: error.message });
  }
}

/**
 * GET /products/search?sku=&category=
 * Smart Search endpoint
 */
export async function searchProducts(req, res) {
  try {
    const { sku, category, q, status } = req.query;

    let query = `
      SELECT 
        v.id,
        v.product_id,
        v.name,
        v.sku,
        v.barcode,
        v.category_id,
        v.category_name,
        v.uom_id,
        v.uom_name,
        v.uom_code,
        v.cost_price,
        v.sale_price,
        v.min_stock_level,
        v.max_stock_level,
        v.reorder_quantity,
        v.is_active,
        v.total_quantity,
        v.total_available,
        v.stock_status
      FROM view_product_stock_summary v
      WHERE 1=1
    `;
    const params = [];

    if (sku && sku.trim()) {
      query += ` AND v.sku LIKE ?`;
      params.push(`%${sku.trim()}%`);
    }

    if (category && category !== 'all') {
      if (!isNaN(category)) {
        query += ` AND v.category_id = ?`;
        params.push(Number(category));
      } else {
        query += ` AND v.category_name LIKE ?`;
        params.push(`%${category}%`);
      }
    }

    if (q && q.trim()) {
      const term = `%${q.trim()}%`;
      query += ` AND (v.name LIKE ? OR v.sku LIKE ? OR v.barcode LIKE ? OR v.description LIKE ?)`;
      params.push(term, term, term, term);
    }

    if (status && status !== 'all') {
      query += ` AND v.stock_status = ?`;
      params.push(status);
    }

    query += ` ORDER BY v.name ASC`;

    const [rows] = await pool.query(query, params);
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ success: false, error: 'Database search error', details: error.message });
  }
}

/**
 * GET /products/:id
 * Single product detailed record
 */
export async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT * FROM view_product_stock_summary WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: `Product with ID ${id} not found` });
    }

    const product = rows[0];

    // Fetch reordering rules for this product
    const [reorderRules] = await pool.query(
      `SELECT rr.*, l.name AS location_name, l.code AS location_code
       FROM reordering_rules rr
       JOIN locations l ON rr.location_id = l.id
       WHERE rr.product_id = ?`,
      [id]
    );

    // Fetch recent stock movements for this product
    const [moves] = await pool.query(
      `SELECT sm.*, 
              sl.name AS source_name, 
              dl.name AS dest_name 
       FROM stock_moves sm
       LEFT JOIN locations sl ON sm.source_location_id = sl.id
       LEFT JOIN locations dl ON sm.dest_location_id = dl.id
       WHERE sm.product_id = ?
       ORDER BY sm.created_at DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...product,
        reordering_rules: reorderRules,
        recent_moves: moves
      }
    });
  } catch (error) {
    console.error('Error getting product by id:', error);
    res.status(500).json({ success: false, error: 'Database error', details: error.message });
  }
}

/**
 * POST /products
 * Create product with validation + initial stock + reordering rule
 */
export async function createProduct(req, res) {
  const connection = await pool.getConnection();
  try {
    const {
      name,
      sku,
      barcode,
      category_id,
      uom_id,
      cost_price = 0,
      sale_price = 0,
      min_stock_level = 0,
      max_stock_level = 0,
      reorder_quantity = 0,
      description = '',
      initial_stock = 0,
      initial_location_id = null
    } = req.body;

    const errors = {};

    // 1. Validation: Name
    if (!name || !name.trim()) {
      errors.name = 'Product name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Product name must be at least 2 characters';
    }

    // 2. Validation: SKU
    if (!sku || !sku.trim()) {
      errors.sku = 'SKU is required';
    } else if (!SKU_REGEX.test(sku.trim())) {
      errors.sku = 'Invalid SKU format. Use only alphanumeric characters, hyphens, underscores, or dots (e.g., PROD-001)';
    }

    // 3. Validation: Category
    if (!category_id) {
      errors.category_id = 'Product category is required';
    }

    // 4. Validation: UoM
    if (!uom_id) {
      errors.uom_id = 'Unit of Measure (UoM) is required';
    }

    // 5. Numeric validations
    if (isNaN(cost_price) || Number(cost_price) < 0) {
      errors.cost_price = 'Cost price must be a non-negative number';
    }
    if (isNaN(sale_price) || Number(sale_price) < 0) {
      errors.sale_price = 'Sale price must be a non-negative number';
    }
    if (isNaN(min_stock_level) || Number(min_stock_level) < 0) {
      errors.min_stock_level = 'Min stock level must be 0 or higher';
    }
    if (isNaN(max_stock_level) || Number(max_stock_level) < 0) {
      errors.max_stock_level = 'Max stock level must be 0 or higher';
    }
    if (isNaN(initial_stock) || Number(initial_stock) < 0) {
      errors.initial_stock = 'Initial stock must be 0 or higher';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors, message: 'Validation failed' });
    }

    const cleanSku = sku.trim().toUpperCase();

    // Check for SKU uniqueness
    const [existingSku] = await connection.query(
      'SELECT id FROM products WHERE sku = ? LIMIT 1',
      [cleanSku]
    );
    if (existingSku.length > 0) {
      return res.status(409).json({
        success: false,
        errors: { sku: `SKU '${cleanSku}' already exists. SKU must be unique across all products.` },
        message: 'Duplicate SKU error'
      });
    }

    // Check category exists
    const [catExists] = await connection.query('SELECT id FROM categories WHERE id = ?', [category_id]);
    if (catExists.length === 0) {
      return res.status(400).json({ success: false, errors: { category_id: 'Selected category does not exist' } });
    }

    // Check UoM exists
    const [uomExists] = await connection.query('SELECT id FROM uoms WHERE id = ?', [uom_id]);
    if (uomExists.length === 0) {
      return res.status(400).json({ success: false, errors: { uom_id: 'Selected Unit of Measure does not exist' } });
    }

    // Begin ACID transaction
    await connection.beginTransaction();

    // Insert Product
    const [prodResult] = await connection.query(
      `INSERT INTO products 
        (name, sku, barcode, category_id, uom_id, cost_price, sale_price, min_stock_level, max_stock_level, reorder_quantity, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        cleanSku,
        barcode && barcode.trim() ? barcode.trim() : null,
        category_id,
        uom_id,
        cost_price,
        sale_price,
        min_stock_level,
        max_stock_level,
        reorder_quantity,
        description ? description.trim() : null
      ]
    );

    const newProductId = prodResult.insertId;

    // Resolve initial warehouse location
    let targetLocationId = initial_location_id;
    if (!targetLocationId) {
      const [defaultLoc] = await connection.query(
        "SELECT id FROM locations WHERE location_type = 'internal' ORDER BY id ASC LIMIT 1"
      );
      if (defaultLoc.length > 0) {
        targetLocationId = defaultLoc[0].id;
      }
    }

    // If initial stock provided (> 0), create stock quant and ledger entry
    const stockQty = Number(initial_stock) || 0;
    if (stockQty > 0 && targetLocationId) {
      await connection.query(
        `INSERT INTO stock_quants (product_id, location_id, quantity, reserved_quantity)
         VALUES (?, ?, ?, 0.00)`,
        [newProductId, targetLocationId, stockQty]
      );

      // Audit move entry
      await connection.query(
        `INSERT INTO stock_moves (reference, product_id, source_location_id, dest_location_id, quantity, move_type, status, notes)
         VALUES (?, ?, NULL, ?, ?, 'initial_stock', 'done', ?)`,
        [`INIT/${String(newProductId).padStart(4, '0')}`, newProductId, targetLocationId, stockQty, 'Initial product setup intake']
      );
    }

    // If reordering threshold defined, create reordering rule
    if (Number(min_stock_level) > 0 && targetLocationId) {
      await connection.query(
        `INSERT INTO reordering_rules (product_id, location_id, min_quantity, max_quantity, reorder_quantity, is_active)
         VALUES (?, ?, ?, ?, ?, TRUE)`,
        [newProductId, targetLocationId, min_stock_level, max_stock_level, reorder_quantity]
      );
    }

    await connection.commit();

    // Fetch newly created record from view
    const [createdRows] = await connection.query(
      'SELECT * FROM view_product_stock_summary WHERE id = ?',
      [newProductId]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: createdRows[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, error: 'Database transaction error', details: error.message });
  } finally {
    connection.release();
  }
}

/**
 * PUT /products/:id
 * Update product details and validate constraints
 */
export async function updateProduct(req, res) {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;

    // Fetch existing product first
    const [current] = await connection.query('SELECT * FROM products WHERE id = ?', [id]);
    if (current.length === 0) {
      return res.status(404).json({ success: false, error: `Product with ID ${id} not found` });
    }
    const curr = current[0];

    const {
      name,
      sku,
      barcode,
      category_id,
      uom_id,
      cost_price,
      sale_price,
      min_stock_level,
      max_stock_level,
      reorder_quantity,
      description,
      is_active
    } = req.body;

    const errors = {};

    const finalName = name !== undefined ? name.trim() : curr.name;
    const finalSku = sku !== undefined ? sku.trim().toUpperCase() : curr.sku;
    const finalBarcode = barcode !== undefined ? (barcode ? barcode.trim() : null) : curr.barcode;
    const finalCategoryId = category_id !== undefined ? category_id : curr.category_id;
    const finalUomId = uom_id !== undefined ? uom_id : curr.uom_id;
    const finalCostPrice = cost_price !== undefined ? cost_price : curr.cost_price;
    const finalSalePrice = sale_price !== undefined ? sale_price : curr.sale_price;
    const finalMinStock = min_stock_level !== undefined ? min_stock_level : curr.min_stock_level;
    const finalMaxStock = max_stock_level !== undefined ? max_stock_level : curr.max_stock_level;
    const finalReorderQty = reorder_quantity !== undefined ? reorder_quantity : curr.reorder_quantity;
    const finalDesc = description !== undefined ? (description ? description.trim() : null) : curr.description;
    const finalIsActive = is_active !== undefined ? is_active : curr.is_active;

    if (!finalName) errors.name = 'Product name cannot be empty';
    if (!finalSku) {
      errors.sku = 'SKU is required';
    } else if (!SKU_REGEX.test(finalSku)) {
      errors.sku = 'Invalid SKU format. Use only alphanumeric characters, hyphens, underscores, or dots';
    }

    if (isNaN(finalCostPrice) || Number(finalCostPrice) < 0) errors.cost_price = 'Cost price must be >= 0';
    if (isNaN(finalSalePrice) || Number(finalSalePrice) < 0) errors.sale_price = 'Sale price must be >= 0';
    if (isNaN(finalMinStock) || Number(finalMinStock) < 0) errors.min_stock_level = 'Min stock level must be >= 0';
    if (isNaN(finalMaxStock) || Number(finalMaxStock) < 0) errors.max_stock_level = 'Max stock level must be >= 0';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors, message: 'Validation failed' });
    }

    // Check SKU collision with other products
    const [existing] = await connection.query(
      'SELECT id FROM products WHERE sku = ? AND id != ? LIMIT 1',
      [finalSku, id]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        errors: { sku: `SKU '${finalSku}' is already assigned to another product.` }
      });
    }

    await connection.beginTransaction();

    await connection.query(
      `UPDATE products 
       SET name = ?, sku = ?, barcode = ?, category_id = ?, uom_id = ?,
           cost_price = ?, sale_price = ?, min_stock_level = ?, max_stock_level = ?, 
           reorder_quantity = ?, description = ?, is_active = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        finalName,
        finalSku,
        finalBarcode,
        finalCategoryId,
        finalUomId,
        finalCostPrice,
        finalSalePrice,
        finalMinStock,
        finalMaxStock,
        finalReorderQty,
        finalDesc,
        finalIsActive,
        id
      ]
    );

    // Update or insert default reordering rule
    const [loc] = await connection.query("SELECT id FROM locations WHERE location_type = 'internal' ORDER BY id ASC LIMIT 1");
    if (loc.length > 0) {
      await connection.query(
        `INSERT INTO reordering_rules (product_id, location_id, min_quantity, max_quantity, reorder_quantity, is_active)
         VALUES (?, ?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE min_quantity=VALUES(min_quantity), max_quantity=VALUES(max_quantity), reorder_quantity=VALUES(reorder_quantity)`,
        [id, loc[0].id, finalMinStock, finalMaxStock, finalReorderQty]
      );
    }

    await connection.commit();

    const [updatedRows] = await connection.query(
      'SELECT * FROM view_product_stock_summary WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedRows[0]
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, error: 'Database update error', details: error.message });
  } finally {
    connection.release();
  }
}

/**
 * GET /products/:id/stock
 * Get stock availability per location for a specific product
 */
export async function getProductStock(req, res) {
  try {
    const { id } = req.params;

    // Check if product exists
    const [prodRows] = await pool.query('SELECT id, name, sku, min_stock_level FROM products WHERE id = ?', [id]);
    if (prodRows.length === 0) {
      return res.status(404).json({ success: false, error: `Product with ID ${id} not found` });
    }
    const product = prodRows[0];

    // Return stock breakdown across all active internal locations
    const [locationsStock] = await pool.query(
      `SELECT 
        l.id AS location_id,
        l.name AS location_name,
        l.code AS location_code,
        l.location_type,
        COALESCE(sq.id, 0) AS quant_id,
        COALESCE(sq.quantity, 0.00) AS quantity,
        COALESCE(sq.reserved_quantity, 0.00) AS reserved_quantity,
        COALESCE(sq.quantity - sq.reserved_quantity, 0.00) AS available_quantity,
        COALESCE(rr.min_quantity, ?) AS min_threshold,
        COALESCE(rr.max_quantity, 0.00) AS max_threshold,
        COALESCE(rr.reorder_quantity, 0.00) AS reorder_quantity,
        CASE
          WHEN COALESCE(sq.quantity, 0.00) <= 0 THEN 'out_of_stock'
          WHEN COALESCE(sq.quantity, 0.00) <= COALESCE(rr.min_quantity, ?) THEN 'low_stock'
          ELSE 'in_stock'
        END AS location_stock_status
       FROM locations l
       LEFT JOIN stock_quants sq ON (sq.location_id = l.id AND sq.product_id = ?)
       LEFT JOIN reordering_rules rr ON (rr.location_id = l.id AND rr.product_id = ? AND rr.is_active = TRUE)
       WHERE l.location_type = 'internal' AND l.is_active = TRUE
       ORDER BY l.id ASC`,
      [product.min_stock_level, product.min_stock_level, id, id]
    );

    const totalQuantity = locationsStock.reduce((sum, item) => sum + Number(item.quantity), 0);
    const totalAvailable = locationsStock.reduce((sum, item) => sum + Number(item.available_quantity), 0);

    res.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        min_stock_level: product.min_stock_level,
        total_quantity: totalQuantity,
        total_available: totalAvailable
      },
      locations: locationsStock
    });
  } catch (error) {
    console.error('Error getting per-location stock:', error);
    res.status(500).json({ success: false, error: 'Database error fetching per-location stock', details: error.message });
  }
}

/**
 * POST /products/:id/stock/adjust
 * Stock quantity adjustment with audit trail move
 */
export async function adjustProductStock(req, res) {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { location_id, new_quantity, reason = 'Inventory adjustment' } = req.body;

    if (!location_id) {
      return res.status(400).json({ success: false, error: 'Location ID is required' });
    }
    if (new_quantity === undefined || isNaN(new_quantity) || Number(new_quantity) < 0) {
      return res.status(400).json({ success: false, error: 'Valid non-negative new quantity is required' });
    }

    await connection.beginTransaction();

    // Fetch existing quant
    const [existing] = await connection.query(
      'SELECT quantity FROM stock_quants WHERE product_id = ? AND location_id = ?',
      [id, location_id]
    );

    const oldQty = existing.length > 0 ? Number(existing[0].quantity) : 0;
    const diffQty = Number(new_quantity) - oldQty;

    // Upsert quant
    await connection.query(
      `INSERT INTO stock_quants (product_id, location_id, quantity, reserved_quantity)
       VALUES (?, ?, ?, 0.00)
       ON DUPLICATE KEY UPDATE quantity = VALUES(quantity)`,
      [id, location_id, new_quantity]
    );

    // Record audit move
    const refCode = `ADJ/${String(id).padStart(4, '0')}-${Date.now().toString().slice(-4)}`;
    await connection.query(
      `INSERT INTO stock_moves (reference, product_id, source_location_id, dest_location_id, quantity, move_type, status, notes)
       VALUES (?, ?, ?, ?, ?, 'adjustment', 'done', ?)`,
      [
        refCode,
        id,
        diffQty < 0 ? location_id : null,
        diffQty >= 0 ? location_id : null,
        Math.abs(diffQty),
        `Stock adjustment from ${oldQty} to ${new_quantity}. Reason: ${reason}`
      ]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: {
        product_id: Number(id),
        location_id: Number(location_id),
        old_quantity: oldQty,
        new_quantity: Number(new_quantity),
        adjustment_diff: diffQty
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error adjusting stock:', error);
    res.status(500).json({ success: false, error: 'Stock adjustment failed', details: error.message });
  } finally {
    connection.release();
  }
}
