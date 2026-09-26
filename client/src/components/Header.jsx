import React from 'react';
import { Database, Plus, Layers, ShieldCheck, RefreshCw } from 'lucide-react';

export default function Header({ onOpenCreate, onOpenCategories, onRefresh, isRefreshing }) {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo-badge" title="Odoo Core Architecture">
          <Database size={24} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="brand-title">Odoo Inventory</h1>
            <span className="role-pill">Member 1 &bull; Database Architect</span>
          </div>
          <div className="brand-subtitle">
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            <span>MySQL 8.0 Engine &bull; Normalized 3NF &bull; Product & Stock Module</span>
          </div>
        </div>
      </div>

      <div className="header-actions">
        <button 
          className="btn btn-secondary" 
          onClick={onRefresh} 
          title="Refresh Catalog and Stock Levels"
          disabled={isRefreshing}
        >
          <RefreshCw size={15} className={isRefreshing ? 'spin' : ''} />
          <span>Refresh</span>
        </button>

        <button 
          className="btn btn-secondary" 
          onClick={onOpenCategories}
          id="btn-manage-categories"
        >
          <Layers size={16} />
          <span>Categories</span>
        </button>

        <button 
          className="btn btn-primary" 
          onClick={onOpenCreate}
          id="btn-create-product"
        >
          <Plus size={18} />
          <span>New Product</span>
        </button>
      </div>
    </header>
  );
}
