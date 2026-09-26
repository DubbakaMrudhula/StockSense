import pool from '../config/db.js';

/**
 * GET /categories
 * List all categories with parent names and product counts
 */
export async function getCategories(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id,
        c.parent_id,
        c.name,
        c.code,
        c.description,
        c.is_active,
        c.created_at,
        c.updated_at,
        p.name AS parent_name,
        COUNT(DISTINCT prod.id) AS product_count
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN products prod ON prod.category_id = c.id
      GROUP BY c.id, c.parent_id, c.name, c.code, c.description, c.is_active, c.created_at, c.updated_at, p.name
      ORDER BY c.parent_id IS NOT NULL, c.name ASC
    `);

    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, error: 'Database error fetching categories', details: error.message });
  }
}

/**
 * POST /categories
 * Create a new category
 */
export async function createCategory(req, res) {
  try {
    const { name, code, parent_id, description } = req.body;
    const errors = {};

    if (!name || !name.trim()) errors.name = 'Category name is required';
    if (!code || !code.trim()) errors.code = 'Category code is required';

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors, message: 'Validation failed' });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check code uniqueness
    const [existing] = await pool.query('SELECT id FROM categories WHERE code = ?', [cleanCode]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        errors: { code: `Category code '${cleanCode}' already exists.` }
      });
    }

    // Check parent exists if provided
    if (parent_id) {
      const [parentExists] = await pool.query('SELECT id FROM categories WHERE id = ?', [parent_id]);
      if (parentExists.length === 0) {
        return res.status(400).json({ success: false, errors: { parent_id: 'Parent category does not exist' } });
      }
    }

    const [result] = await pool.query(
      `INSERT INTO categories (name, code, parent_id, description) VALUES (?, ?, ?, ?)`,
      [name.trim(), cleanCode, parent_id || null, description ? description.trim() : null]
    );

    const [created] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: created[0]
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, error: 'Database error creating category', details: error.message });
  }
}

/**
 * PUT /categories/:id
 * Update a category
 */
export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, code, parent_id, description, is_active } = req.body;

    const errors = {};
    if (!name || !name.trim()) errors.name = 'Category name is required';
    if (!code || !code.trim()) errors.code = 'Category code is required';

    if (Number(parent_id) === Number(id)) {
      errors.parent_id = 'A category cannot be its own parent';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors, message: 'Validation failed' });
    }

    const cleanCode = code.trim().toUpperCase();

    // Check code collision
    const [existing] = await pool.query(
      'SELECT id FROM categories WHERE code = ? AND id != ?',
      [cleanCode, id]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        errors: { code: `Category code '${cleanCode}' already exists.` }
      });
    }

    await pool.query(
      `UPDATE categories 
       SET name = ?, code = ?, parent_id = ?, description = ?, is_active = COALESCE(?, is_active), updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name.trim(), cleanCode, parent_id || null, description !== undefined ? description : null, is_active, id]
    );

    const [updated] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ success: false, error: 'Database error updating category', details: error.message });
  }
}

/**
 * DELETE /categories/:id
 * Delete a category (checks for active products to maintain relational integrity)
 */
export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    // Check if products exist in category
    const [prodCheck] = await pool.query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [id]
    );
    if (prodCheck[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category: ${prodCheck[0].count} product(s) are assigned to it. Reassign products first.`
      });
    }

    // Check if subcategories exist
    const [childCheck] = await pool.query(
      'SELECT COUNT(*) as count FROM categories WHERE parent_id = ?',
      [id]
    );
    if (childCheck[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category: ${childCheck[0].count} child sub-categories reference it.`
      });
    }

    await pool.query('DELETE FROM categories WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ success: false, error: 'Database error deleting category', details: error.message });
  }
}
