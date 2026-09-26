import React from 'react';
import { Eye, Edit3, Sliders, AlertCircle, PackageX } from 'lucide-react';

export default function ProductList({
  products,
  isLoading,
  onViewDetail,
  onEditProduct,
  onAdjustStock
}) {
  if (isLoading) {
    return (
      <div className="table-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <div style={{ color: 'var(--brand-primary)', marginBottom: '12px' }}>
          Loading products & stock inventory...
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="table-card empty-state">
        <PackageX size={48} className="empty-icon" />
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '6px' }}>
          No Products Found
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          No matching inventory records found for your current search and filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-responsive">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product & SKU</th>
              <th>Category</th>
              <th>UoM</th>
              <th>Sale / Cost Price</th>
              <th>Stock On Hand</th>
              <th>Status Flag</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const totalQty = Number(p.total_quantity || 0);
              const minLevel = Number(p.min_stock_level || 0);
              const maxLevel = Number(p.max_stock_level || 0);

              // Percentage for stock bar
              let fillPercent = 0;
              if (maxLevel > 0) {
                fillPercent = Math.min(100, Math.round((totalQty / maxLevel) * 100));
              } else if (minLevel > 0) {
                fillPercent = Math.min(100, Math.round((totalQty / (minLevel * 2)) * 100));
              } else {
                fillPercent = totalQty > 0 ? 100 : 0;
              }

              return (
                <tr key={p.id} id={`product-row-${p.id}`}>
                  {/* Product & SKU */}
                  <td>
                    <div className="product-primary-info">
                      <span
                        className="product-name-link"
                        onClick={() => onViewDetail(p.id)}
                        title="Click to view per-location breakdown"
                      >
                        {p.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                        <span className="sku-pill">{p.sku}</span>
                        {p.barcode && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            UPC: {p.barcode}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td>
                    <span className="category-tag">{p.category_name}</span>
                  </td>

                  {/* UoM */}
                  <td>
                    <span className="uom-tag">
                      {p.uom_name} ({p.uom_code})
                    </span>
                  </td>

                  {/* Pricing */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        ${Number(p.sale_price).toFixed(2)}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        Cost: ${Number(p.cost_price).toFixed(2)}
                      </span>
                    </div>
                  </td>

                  {/* Stock On Hand & Mini Bar */}
                  <td>
                    <div className="stock-bar-wrapper">
                      <div className="stock-qty-display">
                        <span className="qty-val">{totalQty.toFixed(0)}</span>
                        <span className="qty-min">
                          {p.uom_code} &bull; Min: {minLevel.toFixed(0)}
                        </span>
                      </div>
                      <div className="progress-track" title={`Stock ratio: ${fillPercent}%`}>
                        <div
                          className={`progress-fill fill-${p.stock_status.replace('_', '-')}`}
                          style={{ width: `${fillPercent}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Status Flag */}
                  <td>
                    {p.stock_status === 'in_stock' && (
                      <span className="stock-badge in-stock">
                        <span className="badge-dot" />
                        In Stock
                      </span>
                    )}

                    {p.stock_status === 'low_stock' && (
                      <span 
                        className="stock-badge low-stock" 
                        title={`Low stock trigger: current (${totalQty}) <= min threshold (${minLevel})`}
                      >
                        <span className="badge-dot" />
                        Low Stock (Reorder)
                      </span>
                    )}

                    {p.stock_status === 'out_of_stock' && (
                      <span className="stock-badge out-stock">
                        <span className="badge-dot" />
                        Out of Stock
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="action-icon-btn"
                        onClick={() => onViewDetail(p.id)}
                        title="View Location Breakdown & Ledger"
                        id={`btn-view-${p.id}`}
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        className="action-icon-btn"
                        onClick={() => onAdjustStock(p)}
                        title="Adjust Stock Quantity"
                        id={`btn-adjust-${p.id}`}
                      >
                        <Sliders size={16} />
                      </button>

                      <button
                        className="action-icon-btn"
                        onClick={() => onEditProduct(p)}
                        title="Edit Product Details"
                        id={`btn-edit-${p.id}`}
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
