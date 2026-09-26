import React, { useState, useEffect } from 'react';
import { X, Warehouse, Sliders, AlertTriangle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { api } from '../api';

export default function ProductDetailModal({
  productId,
  isOpen,
  onClose,
  onOpenAdjustStock
}) {
  const [productData, setProductData] = useState(null);
  const [locationsStock, setLocationsStock] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !productId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    Promise.all([
      api.getProductById(productId),
      api.getProductStock(productId)
    ])
      .then(([prodRes, stockRes]) => {
        if (!isMounted) return;
        setProductData(prodRes.data);
        setLocationsStock(stockRes.locations || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Error loading stock detail');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [productId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 className="modal-title">
                {isLoading ? 'Loading Product...' : productData?.name}
              </h2>
              {productData && (
                <span className="sku-pill">{productData.sku}</span>
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Per-Location Stock Availability &bull; Reorder Trigger Analysis
            </div>
          </div>
          <button className="action-icon-btn" onClick={onClose} id="btn-close-detail">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {isLoading && (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Querying database for multi-warehouse quants...
            </div>
          )}

          {error && (
            <div className="alert-box alert-danger">
              <span>{error}</span>
            </div>
          )}

          {!isLoading && productData && (
            <>
              {/* Status Header Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                  border: '1px solid var(--border-color)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Aggregate Stock on Hand
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '1.75rem', fontFamily: 'var(--font-heading)', fontWeight: 700 }}>
                      {Number(productData.total_quantity).toFixed(0)}
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      {productData.uom_code} available
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Inventory Status
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    {productData.stock_status === 'in_stock' && (
                      <span className="stock-badge in-stock">
                        <span className="badge-dot" />
                        In Stock (Healthy)
                      </span>
                    )}
                    {productData.stock_status === 'low_stock' && (
                      <span className="stock-badge low-stock">
                        <span className="badge-dot" />
                        Low Stock &bull; Trigger Active
                      </span>
                    )}
                    {productData.stock_status === 'out_of_stock' && (
                      <span className="stock-badge out-stock">
                        <span className="badge-dot" />
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Low stock warning banner if triggered */}
              {productData.stock_status === 'low_stock' && (
                <div className="alert-box alert-warning">
                  <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Reorder Trigger Fired:</strong> On-hand quantity ({Number(productData.total_quantity).toFixed(0)}) is at or below the reorder threshold ({Number(productData.min_stock_level).toFixed(0)}). Suggested replenishment: {Number(productData.reorder_quantity).toFixed(0)} {productData.uom_code}.
                  </div>
                </div>
              )}

              {/* Specifications Pills */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Category</div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{productData.category_name}</div>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Sale Price</div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#34d399' }}>${Number(productData.sale_price).toFixed(2)}</div>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Cost Price</div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>${Number(productData.cost_price).toFixed(2)}</div>
                </div>

                <div style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Total Valuation</div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#93c5fd' }}>${Number(productData.total_valuation || 0).toFixed(2)}</div>
                </div>
              </div>

              {/* Per-Location Stock Availability Table */}
              <div style={{ marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Warehouse size={16} style={{ color: 'var(--brand-primary)' }} />
                    Stock Availability per Warehouse Location
                  </h3>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => onOpenAdjustStock(productData)}
                    id="btn-adjust-from-detail"
                  >
                    <Sliders size={14} />
                    <span>Adjust Stock</span>
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="location-table">
                    <thead>
                      <tr>
                        <th>Location</th>
                        <th>Type</th>
                        <th style={{ textAlign: 'right' }}>On Hand</th>
                        <th style={{ textAlign: 'right' }}>Reserved</th>
                        <th style={{ textAlign: 'right' }}>Available</th>
                        <th style={{ textAlign: 'right' }}>Min Threshold</th>
                        <th>Location Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {locationsStock.map((loc) => {
                        const qty = Number(loc.quantity || 0);
                        const min = Number(loc.min_threshold || 0);
                        const isLow = qty <= min && qty > 0;
                        const isOut = qty <= 0;

                        return (
                          <tr key={loc.location_id}>
                            <td>
                              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                                {loc.location_name}
                              </div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                                {loc.location_code}
                              </span>
                            </td>
                            <td>
                              <span style={{ textTransform: 'capitalize', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                {loc.location_type}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600 }}>
                              {qty.toFixed(0)} {productData.uom_code}
                            </td>
                            <td style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                              {Number(loc.reserved_quantity || 0).toFixed(0)}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: '#38bdf8' }}>
                              {Number(loc.available_quantity || 0).toFixed(0)}
                            </td>
                            <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                              {min.toFixed(0)}
                            </td>
                            <td>
                              {isOut ? (
                                <span className="stock-badge out-stock" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                                  Out of Stock
                                </span>
                              ) : isLow ? (
                                <span className="stock-badge low-stock" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                                  Low Stock
                                </span>
                              ) : (
                                <span className="stock-badge in-stock" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>
                                  In Stock
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stock Movement Audit Trail */}
              {productData.recent_moves && productData.recent_moves.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontFamily: 'var(--font-heading)', color: 'var(--text-main)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={16} style={{ color: '#06b6d4' }} />
                    Audit Ledger &bull; Recent Stock Moves
                  </h3>
                  <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '12px', border: '1px solid var(--border-color)' }}>
                    {productData.recent_moves.map((m) => (
                      <div
                        key={m.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 4px',
                          borderBottom: '1px solid var(--border-subtle)',
                          fontSize: '0.8rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontFamily: 'monospace', color: '#93c5fd', fontWeight: 600 }}>
                            {m.reference}
                          </span>
                          <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>
                            {m.move_type.replace('_', ' ')}
                          </span>
                          {m.notes && (
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                              &bull; {m.notes}
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                            {Number(m.quantity).toFixed(0)} {productData.uom_code}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                            {m.created_at}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
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
