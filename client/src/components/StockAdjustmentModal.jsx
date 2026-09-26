import React, { useState } from 'react';
import { X, Sliders, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function StockAdjustmentModal({
  isOpen,
  onClose,
  product,
  locations,
  onAdjustmentComplete
}) {
  if (!isOpen || !product) return null;

  const internalLocations = locations.filter((l) => l.location_type === 'internal');
  const [locationId, setLocationId] = useState(internalLocations[0]?.id || '');
  const [newQuantity, setNewQuantity] = useState(0);
  const [reason, setReason] = useState('Physical inventory recount');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newQuantity < 0 || isNaN(newQuantity)) {
      setError('Please provide a valid non-negative quantity');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await api.adjustStock(product.id, {
        location_id: Number(locationId),
        new_quantity: Number(newQuantity),
        reason
      });
      onAdjustmentComplete();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Adjust Stock Level</h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {product.name} ({product.sku})
            </div>
          </div>
          <button className="action-icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert-box alert-danger">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Warehouse Location</label>
              <select
                className="form-select"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                id="select-adjust-location"
              >
                {internalLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} ({l.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">New Counted Quantity</label>
              <input
                type="number"
                min="0"
                className="form-input"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                id="input-adjust-qty"
              />
              <span className="form-hint">
                Current aggregate on hand: {product.total_quantity} {product.uom_code}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Reason / Audit Note</label>
              <input
                type="text"
                className="form-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Physical inventory audit cycle count"
                id="input-adjust-reason"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} id="btn-submit-adjust">
              <Sliders size={16} />
              <span>{isSubmitting ? 'Adjusting...' : 'Confirm Adjustment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
