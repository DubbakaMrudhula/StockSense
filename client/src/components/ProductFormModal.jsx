import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Save, Check } from 'lucide-react';

const SKU_REGEX = /^[A-Za-z0-9\-_.]+$/;

export default function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  categories = [],
  uoms = [],
  locations = []
}) {
  const isEditing = Boolean(initialData && initialData.id);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category_id: '',
    uom_id: '',
    cost_price: 0,
    sale_price: 0,
    min_stock_level: 0,
    max_stock_level: 0,
    reorder_quantity: 0,
    description: '',
    initial_stock: 0,
    initial_location_id: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        sku: initialData.sku || '',
        barcode: initialData.barcode || '',
        category_id: initialData.category_id || (categories[0]?.id || ''),
        uom_id: initialData.uom_id || (uoms[0]?.id || ''),
        cost_price: initialData.cost_price ?? 0,
        sale_price: initialData.sale_price ?? 0,
        min_stock_level: initialData.min_stock_level ?? 0,
        max_stock_level: initialData.max_stock_level ?? 0,
        reorder_quantity: initialData.reorder_quantity ?? 0,
        description: initialData.description || '',
        initial_stock: 0,
        initial_location_id: locations[0]?.id || ''
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        barcode: '',
        category_id: categories[0]?.id || '',
        uom_id: uoms[0]?.id || '',
        cost_price: 0,
        sale_price: 0,
        min_stock_level: 5,
        max_stock_level: 25,
        reorder_quantity: 10,
        description: '',
        initial_stock: 10,
        initial_location_id: locations[0]?.id || ''
      });
    }
    setErrors({});
    setServerError(null);
  }, [initialData, isOpen, categories, uoms, locations]);

  if (!isOpen) return null;

  // Real-time and pre-submit client validation
  const validate = () => {
    const errs = {};

    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Product name is required';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Product name must have at least 2 characters';
    }

    if (!formData.sku || !formData.sku.trim()) {
      errs.sku = 'SKU / Code is required';
    } else if (!SKU_REGEX.test(formData.sku.trim())) {
      errs.sku = 'Invalid SKU format. Only alphanumeric characters, hyphens, underscores, or dots are allowed (e.g. PROD-001)';
    }

    if (!formData.category_id) {
      errs.category_id = 'Please select a product category';
    }

    if (!formData.uom_id) {
      errs.uom_id = 'Please select a Unit of Measure (UoM)';
    }

    if (formData.cost_price < 0 || isNaN(formData.cost_price)) {
      errs.cost_price = 'Cost price cannot be negative';
    }

    if (formData.sale_price < 0 || isNaN(formData.sale_price)) {
      errs.sale_price = 'Sale price cannot be negative';
    }

    if (formData.min_stock_level < 0 || isNaN(formData.min_stock_level)) {
      errs.min_stock_level = 'Min stock level cannot be negative';
    }

    if (!isEditing && (formData.initial_stock < 0 || isNaN(formData.initial_stock))) {
      errs.initial_stock = 'Initial stock cannot be negative';
    }

    return errs;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear specific field error as user types
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
    if (serverError) setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setServerError(null);

    try {
      await onSubmit(formData, isEditing);
      onClose();
    } catch (err) {
      console.error('Submit error:', err);
      if (err.errors) {
        setErrors(err.errors);
      }
      setServerError(err.message || 'Operation failed. Please review the inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {isEditing ? `Edit Product: ${formData.name || 'Details'}` : 'Create New Inventory Product'}
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Database Architect: Schema integrity &amp; foreign key constraints verified
            </div>
          </div>
          <button className="action-icon-btn" onClick={onClose} id="btn-close-modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {serverError && (
              <div className="alert-box alert-danger">
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{serverError}</span>
              </div>
            )}

            <div className="form-grid">
              {/* Product Name */}
              <div className="form-group form-full">
                <label className="form-label">
                  Product Name <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'has-error' : ''}`}
                  placeholder="e.g. Ergonomic Mechanical Keyboard Pro"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  id="input-product-name"
                />
                {errors.name && (
                  <span className="form-error">
                    <AlertCircle size={13} /> {errors.name}
                  </span>
                )}
              </div>

              {/* SKU / Code */}
              <div className="form-group">
                <label className="form-label">
                  SKU / Product Code <span className="req-star">*</span>
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.sku ? 'has-error' : ''}`}
                  placeholder="e.g. PROD-KBD-001"
                  value={formData.sku}
                  onChange={(e) => handleChange('sku', e.target.value)}
                  id="input-product-sku"
                />
                <span className="form-hint">Unique identifier (letters, numbers, hyphens)</span>
                {errors.sku && (
                  <span className="form-error">
                    <AlertCircle size={13} /> {errors.sku}
                  </span>
                )}
              </div>

              {/* Barcode / UPC */}
              <div className="form-group">
                <label className="form-label">Barcode / UPC</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 890123400101"
                  value={formData.barcode}
                  onChange={(e) => handleChange('barcode', e.target.value)}
                  id="input-product-barcode"
                />
                <span className="form-hint">Optional standard barcode</span>
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">
                  Category <span className="req-star">*</span>
                </label>
                <select
                  className={`form-select ${errors.category_id ? 'has-error' : ''}`}
                  value={formData.category_id}
                  onChange={(e) => handleChange('category_id', e.target.value)}
                  id="select-product-category"
                >
                  <option value="">Select Category...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.parent_name ? `${c.parent_name} / ${c.name}` : c.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <span className="form-error">
                    <AlertCircle size={13} /> {errors.category_id}
                  </span>
                )}
              </div>

              {/* Unit of Measure (UoM) */}
              <div className="form-group">
                <label className="form-label">
                  Unit of Measure (UoM) <span className="req-star">*</span>
                </label>
                <select
                  className={`form-select ${errors.uom_id ? 'has-error' : ''}`}
                  value={formData.uom_id}
                  onChange={(e) => handleChange('uom_id', e.target.value)}
                  id="select-product-uom"
                >
                  <option value="">Select UoM...</option>
                  {uoms.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.code}) &bull; {u.category_name}
                    </option>
                  ))}
                </select>
                {errors.uom_id && (
                  <span className="form-error">
                    <AlertCircle size={13} /> {errors.uom_id}
                  </span>
                )}
              </div>

              {/* Cost Price */}
              <div className="form-group">
                <label className="form-label">Cost Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`form-input ${errors.cost_price ? 'has-error' : ''}`}
                  value={formData.cost_price}
                  onChange={(e) => handleChange('cost_price', e.target.value)}
                  id="input-product-cost"
                />
                {errors.cost_price && (
                  <span className="form-error">
                    <AlertCircle size={13} /> {errors.cost_price}
                  </span>
                )}
              </div>

              {/* Sale Price */}
              <div className="form-group">
                <label className="form-label">Sale Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`form-input ${errors.sale_price ? 'has-error' : ''}`}
                  value={formData.sale_price}
                  onChange={(e) => handleChange('sale_price', e.target.value)}
                  id="input-product-sale"
                />
                {errors.sale_price && (
                  <span className="form-error">
                    <AlertCircle size={13} /> {errors.sale_price}
                  </span>
                )}
              </div>

              {/* Section Header: Reordering Rules */}
              <div className="form-full" style={{ marginTop: '10px' }}>
                <h4 style={{ fontSize: '0.9rem', color: '#a5b4fc', marginBottom: '4px' }}>
                  Reordering Rules &bull; Low-Stock Thresholds
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  When total stock falls at or below Minimum Stock Level, the system triggers the Low Stock alert.
                </p>
              </div>

              {/* Min Stock Level */}
              <div className="form-group">
                <label className="form-label">
                  Min Stock Level (Trigger) <span className="req-star">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className={`form-input ${errors.min_stock_level ? 'has-error' : ''}`}
                  value={formData.min_stock_level}
                  onChange={(e) => handleChange('min_stock_level', e.target.value)}
                  id="input-min-stock"
                />
                <span className="form-hint">Triggers low-stock warning when stock &le; min</span>
                {errors.min_stock_level && (
                  <span className="form-error">
                    <AlertCircle size={13} /> {errors.min_stock_level}
                  </span>
                )}
              </div>

              {/* Max Stock Level */}
              <div className="form-group">
                <label className="form-label">Max Stock Level</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.max_stock_level}
                  onChange={(e) => handleChange('max_stock_level', e.target.value)}
                  id="input-max-stock"
                />
                <span className="form-hint">Maximum warehouse storage limit</span>
              </div>

              {/* Reorder Quantity */}
              <div className="form-group">
                <label className="form-label">Suggested Reorder Lot Size</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.reorder_quantity}
                  onChange={(e) => handleChange('reorder_quantity', e.target.value)}
                  id="input-reorder-qty"
                />
              </div>

              {/* Initial Stock (Only for New Products) */}
              {!isEditing && (
                <>
                  <div className="form-group">
                    <label className="form-label">Initial Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      className={`form-input ${errors.initial_stock ? 'has-error' : ''}`}
                      value={formData.initial_stock}
                      onChange={(e) => handleChange('initial_stock', e.target.value)}
                      id="input-initial-stock"
                    />
                    <span className="form-hint">Automatically creates initial stock quant &amp; ledger entry</span>
                    {errors.initial_stock && (
                      <span className="form-error">
                        <AlertCircle size={13} /> {errors.initial_stock}
                      </span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Initial Stock Warehouse Location</label>
                    <select
                      className="form-select"
                      value={formData.initial_location_id}
                      onChange={(e) => handleChange('initial_location_id', e.target.value)}
                      id="select-initial-location"
                    >
                      {locations
                        .filter((l) => l.location_type === 'internal')
                        .map((l) => (
                          <option key={l.id} value={l.id}>
                            {l.name} ({l.code})
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}

              {/* Description */}
              <div className="form-group form-full">
                <label className="form-label">Product Description / Notes</label>
                <textarea
                  rows="3"
                  className="form-textarea"
                  placeholder="Optional internal inventory specs, manufacturer part numbers..."
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  id="input-product-description"
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} id="btn-save-product">
              <Save size={16} />
              <span>{isSubmitting ? 'Saving to Database...' : isEditing ? 'Update Product' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
