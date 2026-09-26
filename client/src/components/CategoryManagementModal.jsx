import React, { useState } from 'react';
import { X, Plus, Trash2, AlertCircle, Layers } from 'lucide-react';
import { api } from '../api';

export default function CategoryManagementModal({
  isOpen,
  onClose,
  categories,
  onCategoryCreatedOrDeleted
}) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [parentId, setParentId] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    if (!code.trim()) {
      setError('Category code is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.createCategory({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        parent_id: parentId ? Number(parentId) : null,
        description: description.trim() || null
      });
      setName('');
      setCode('');
      setParentId('');
      setDescription('');
      onCategoryCreatedOrDeleted();
    } catch (err) {
      setError(err.message || 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (catId, productCount) => {
    if (productCount > 0) {
      alert(`Cannot delete category: ${productCount} active product(s) are assigned to it.`);
      return;
    }

    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await api.deleteCategory(catId);
      onCategoryCreatedOrDeleted();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} style={{ color: 'var(--brand-primary)' }} />
            <div>
              <h2 className="modal-title">Product Category Management</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Hierarchical Categories &bull; Foreign Key Integrity Protected
              </div>
            </div>
          </div>
          <button className="action-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert-box alert-danger">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Create Category Form */}
          <form onSubmit={handleCreate} style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <h4 style={{ fontSize: '0.85rem', color: '#a5b4fc', marginBottom: '12px' }}>
              Add New Category
            </h4>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Network Equipment"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  id="input-cat-name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category Code *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. CAT-NET"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  id="input-cat-code"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Parent Category</label>
                <select
                  className="form-select"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  id="select-cat-parent"
                >
                  <option value="">None (Top Level)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.parent_name ? `${c.parent_name} / ${c.name}` : c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Short description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  id="input-cat-desc"
                />
              </div>
            </div>

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting} id="btn-save-category">
                <Plus size={14} />
                <span>{isSubmitting ? 'Saving...' : 'Add Category'}</span>
              </button>
            </div>
          </form>

          {/* Existing Categories Table */}
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Current Categories ({categories.length})
          </h4>
          <div className="table-responsive">
            <table className="products-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Code</th>
                  <th>Parent</th>
                  <th>Assigned Products</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {c.name}
                    </td>
                    <td>
                      <span className="sku-pill">{c.code}</span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {c.parent_name || '—'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#38bdf8' }}>
                        {c.product_count} items
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="action-icon-btn btn-outline-danger"
                        onClick={() => handleDelete(c.id, c.product_count)}
                        title={c.product_count > 0 ? 'Cannot delete category with products' : 'Delete category'}
                        disabled={c.product_count > 0}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
