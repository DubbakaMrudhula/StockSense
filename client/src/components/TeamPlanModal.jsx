import React, { useState } from 'react';
import { 
  BookOpen, 
  Database, 
  Users, 
  X, 
  Box,
  Server
} from 'lucide-react';

export default function TeamPlanModal({ onClose }) {
  const [tab, setTab] = useState('slices'); // 'slices' | 'erd'

  const slices = [
    {
      id: 1,
      title: 'Slice 1: Auth, Dashboard, Settings & UI/UX Cohesion (MY SLICE)',
      owner: 'Alex Rivera (You)',
      color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
      tables: ['User', 'Warehouse', 'Location'],
      endpoints: ['/auth/signup', '/auth/login', '/auth/otp/*', '/dashboard/kpis', '/warehouses', '/profile'],
      desc: 'Owns user authentication, OTP password reset flow, dynamic multi-filter dashboard pulling real aggregated stats from all tables, warehouse/location settings, profile management, and global UI design system.'
    },
    {
      id: 2,
      title: 'Slice 2: Product Catalog & Inbound Receipts',
      owner: 'Member 2',
      color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
      tables: ['Product', 'Category', 'UnitOfMeasure', 'Receipt'],
      endpoints: ['/products', '/categories', '/uom', '/receipts'],
      desc: 'Owns master product catalog creation, categorization, units of measure, purchase orders, and supplier inbound receipts processing into warehouse stock.'
    },
    {
      id: 3,
      title: 'Slice 3: Outbound Delivery Orders & Customer Fulfillment',
      owner: 'Member 3',
      color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
      tables: ['DeliveryOrder', 'StockQuantity'],
      endpoints: ['/deliveries', '/stock/quantities'],
      desc: 'Owns sales customer order dispatching, stock reservation logic, delivery order status progression (Draft -> Waiting -> Ready -> Done), and stock depletion.'
    },
    {
      id: 4,
      title: 'Slice 4: Internal Transfers, Adjustments & Audit Stock Ledger',
      owner: 'Member 4',
      color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
      tables: ['InternalTransfer', 'StockAdjustment', 'StockLedger'],
      endpoints: ['/transfers', '/adjustments', '/ledger'],
      desc: 'Owns warehouse-to-warehouse stock transfers, audit physical inventory count adjustments, and immutable transaction ledger logging for auditing.'
    }
  ];

  const erTables = [
    { name: 'User', pk: 'id', fks: ['warehouse_id'], fields: ['name', 'email', 'password_hash', 'role', 'created_at'] },
    { name: 'Warehouse', pk: 'id', fks: [], fields: ['code', 'name', 'address', 'manager_name', 'status', 'capacity'] },
    { name: 'Location', pk: 'id', fks: ['warehouse_id'], fields: ['code', 'name', 'type', 'capacity'] },
    { name: 'Category', pk: 'id', fks: [], fields: ['name', 'code', 'description'] },
    { name: 'UnitOfMeasure', pk: 'id', fks: [], fields: ['name', 'abbreviation'] },
    { name: 'Product', pk: 'id', fks: ['category_id', 'uom_id'], fields: ['sku', 'name', 'min_stock_threshold', 'reorder_qty', 'price'] },
    { name: 'StockQuantity', pk: 'id', fks: ['product_id', 'warehouse_id', 'location_id'], fields: ['qty_on_hand', 'qty_reserved'] },
    { name: 'Receipt', pk: 'id', fks: ['warehouse_id', 'created_by'], fields: ['receipt_number', 'supplier_name', 'status', 'expected_date', 'line_items'] },
    { name: 'DeliveryOrder', pk: 'id', fks: ['warehouse_id', 'created_by'], fields: ['do_number', 'customer_name', 'status', 'scheduled_date', 'line_items'] },
    { name: 'InternalTransfer', pk: 'id', fks: ['src_warehouse_id', 'dest_warehouse_id', 'product_id'], fields: ['transfer_number', 'qty', 'status', 'scheduled_date'] },
    { name: 'StockAdjustment', pk: 'id', fks: ['warehouse_id', 'location_id', 'product_id'], fields: ['adj_number', 'old_qty', 'new_qty', 'reason', 'status'] },
    { name: 'StockLedger', pk: 'id', fks: ['product_id', 'warehouse_id', 'location_id'], fields: ['doc_type', 'doc_number', 'qty_change', 'balance_after', 'timestamp'] }
  ];

  return (
    <div className="modal-overlay">
      <div className="glass-panel max-w-4xl w-full p-6 sm:p-8 relative max-h-[85vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-bold shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-extrabold text-white">
                StockSense Architecture & Team Work Division
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">4 Vertical Slices • Full-Stack Ownership • 12 ER Entities</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-3">
          <button 
            onClick={() => setTab('slices')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              tab === 'slices' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-white bg-slate-900/80 border border-white/5'
            }`}
          >
            <Users className="w-4 h-4" /> Vertical Slices Division
          </button>

          <button 
            onClick={() => setTab('erd')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              tab === 'erd' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-white bg-slate-900/80 border border-white/5'
            }`}
          >
            <Database className="w-4 h-4" /> Shared 12 Entity ER Diagram
          </button>
        </div>

        {/* TAB 1: VERTICAL SLICES */}
        {tab === 'slices' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-white/10 text-xs text-slate-300 leading-relaxed">
              <strong className="text-emerald-400 font-bold block mb-1">Evaluator Work Division Rule:</strong>
              Instead of horizontal frontend/backend splits, team members own vertical slices end-to-end (Database schema, API, UI) so commit history reflects distinct module ownership for individual Q&A evaluation.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slices.map((s) => (
                <div key={s.id} className={`p-5 rounded-2xl border ${s.color} transition-all space-y-3`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading font-extrabold text-sm text-white">{s.title}</span>
                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-md bg-slate-950 text-slate-200 border border-white/10 shrink-0">
                      {s.owner}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
                  
                  <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>DB Tables:</span>
                      <strong className="text-slate-200">{s.tables.join(', ')}</strong>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Server className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Endpoints:</span>
                      <strong className="text-slate-200 font-mono text-[11px] truncate">{s.endpoints.join(' ')}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ER DIAGRAM */}
        {tab === 'erd' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-300 bg-slate-900/90 p-4 rounded-xl border border-white/10">
              Complete relational database schema containing all 12 core inventory management entities with foreign key constraints.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {erTables.map((tbl) => (
                <div key={tbl.name} className="p-4 rounded-xl glass-panel border border-white/10 space-y-2">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-heading font-extrabold text-xs text-emerald-400 flex items-center gap-1.5">
                      <Box className="w-4 h-4 text-emerald-400" />
                      {tbl.name}
                    </span>
                    <span className="font-mono text-[10px] font-bold bg-slate-900 border border-white/10 px-2 py-0.5 rounded text-slate-300">
                      PK: {tbl.pk}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {tbl.fks.length > 0 && (
                      <div className="text-cyan-400 font-mono text-[11px] font-semibold">
                        FK: {tbl.fks.join(', ')}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {tbl.fields.map(f => (
                        <span key={f} className="bg-slate-900 border border-white/5 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
          <button onClick={onClose} className="btn-primary text-xs py-2.5 px-6">
            Close Architecture Plan
          </button>
        </div>

      </div>
    </div>
  );
}
