import React from 'react';
import { Package, CheckCircle2, AlertTriangle, XCircle, DollarSign, Warehouse } from 'lucide-react';

export default function StatsOverview({ stats, currentStatusFilter, onStatusFilterChange }) {
  if (!stats) return null;

  const cards = [
    {
      id: 'all',
      label: 'Total Products',
      value: stats.total_products,
      sub: `${stats.categories_count} Categories`,
      icon: Package,
      color: '#6366f1',
      bg: 'rgba(99, 102, 241, 0.12)'
    },
    {
      id: 'in_stock',
      label: 'Healthy Stock',
      value: stats.in_stock_count,
      sub: 'Above reorder rule',
      icon: CheckCircle2,
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.12)'
    },
    {
      id: 'low_stock',
      label: 'Low Stock Alert',
      value: stats.low_stock_count,
      sub: 'Action required &bull; Reorder trigger',
      icon: AlertTriangle,
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)'
    },
    {
      id: 'out_of_stock',
      label: 'Out of Stock',
      value: stats.out_of_stock_count,
      sub: 'Zero inventory on hand',
      icon: XCircle,
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)'
    },
    {
      id: 'valuation',
      label: 'Total Valuation',
      value: `$${Number(stats.total_inventory_valuation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: `${Number(stats.total_units_on_hand || 0).toLocaleString()} units on hand`,
      icon: DollarSign,
      color: '#06b6d4',
      bg: 'rgba(6, 182, 212, 0.12)',
      isAction: false
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((c) => {
        const Icon = c.icon;
        const isActive = c.isAction !== false && currentStatusFilter === c.id;

        return (
          <div
            key={c.id}
            className={`stat-card ${isActive ? 'active' : ''}`}
            onClick={() => {
              if (c.isAction !== false) {
                onStatusFilterChange(c.id);
              }
            }}
            title={c.isAction !== false ? `Filter by ${c.label}` : 'Inventory Valuation'}
            id={`stat-card-${c.id}`}
          >
            <div className="stat-icon-wrapper" style={{ backgroundColor: c.bg, color: c.color }}>
              <Icon size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">{c.label}</span>
              <span className="stat-value">{c.value}</span>
              <span className="stat-sub" dangerouslySetInnerHTML={{ __html: c.sub }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
