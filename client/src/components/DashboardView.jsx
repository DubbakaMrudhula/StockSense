import React from 'react';
import { 
  PackageCheck, 
  AlertTriangle, 
  Inbox, 
  Send, 
  ArrowLeftRight, 
  RotateCcw, 
  Layers, 
  Building2, 
  FileText, 
  Clock, 
  TrendingUp,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Activity,
  Boxes
} from 'lucide-react';

export default function DashboardView({ 
  kpisData, 
  categories, 
  warehouses, 
  filters, 
  onFilterChange, 
  onResetFilters,
  onOpenReorderModal
}) {
  const { kpis, ledgerTimeline = [], categoryBreakdown = [], lowStockAlerts = [] } = kpisData || {};

  const activeFilterCount = Object.values(filters).filter(val => val !== 'all').length;

  return (
    <div className="space-y-6">
      
      {/* 1. Header & Dynamic Filters Bar */}
      <div className="glass-panel p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-2xl font-heading font-extrabold text-white flex items-center gap-2.5">
              <Activity className="w-6 h-6 text-emerald-400" />
              Inventory Control Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live aggregate KPIs computed dynamically from local database tables across all 4 vertical slices.
            </p>
          </div>

          {/* Applied filters indicator */}
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                {activeFilterCount} Active Filter{activeFilterCount > 1 ? 's' : ''}
              </span>
            )}
            {activeFilterCount > 0 && (
              <button 
                onClick={onResetFilters}
                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-white/10 transition-all shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* 4 DYNAMIC FILTERS BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          
          {/* Filter 1: Document Type */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" /> Document Type
            </label>
            <select 
              value={filters.doc_type}
              onChange={(e) => onFilterChange('doc_type', e.target.value)}
              className="glass-input text-xs py-2 bg-slate-900"
            >
              <option value="all">All Document Types</option>
              <option value="Receipt">Receipt (Inbound)</option>
              <option value="Delivery">Delivery (Outbound)</option>
              <option value="Transfer">Internal Transfer</option>
              <option value="Adjustment">Stock Adjustment</option>
            </select>
          </div>

          {/* Filter 2: Status */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Document Status
            </label>
            <select 
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="glass-input text-xs py-2 bg-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Waiting">Waiting</option>
              <option value="Ready">Ready</option>
              <option value="Done">Done</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          {/* Filter 3: Warehouse & Location */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-amber-400" /> Warehouse / Location
            </label>
            <select 
              value={filters.warehouse_id}
              onChange={(e) => onFilterChange('warehouse_id', e.target.value)}
              className="glass-input text-xs py-2 bg-slate-900"
            >
              <option value="all">All Warehouses</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id}>
                  {wh.code} - {wh.name}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 4: Product Category */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Product Category
            </label>
            <select 
              value={filters.category_id}
              onChange={(e) => onFilterChange('category_id', e.target.value)}
              className="glass-input text-xs py-2 bg-slate-900"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.code} ({cat.name})
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* 2. REAL DYNAMIC KPI CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        
        {/* KPI 1: Products in Stock */}
        <div className="glass-panel p-5 glass-panel-hover relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Total Stock SKUs</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <PackageCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-heading font-extrabold text-white tracking-tight">
            {kpis?.totalProductsInStock ?? 0}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between pt-2 border-t border-white/5">
            <span>Catalog Total:</span>
            <strong className="text-slate-200">{kpis?.totalProductsCatalog ?? 0} SKUs</strong>
          </div>
        </div>

        {/* KPI 2: Low & Out of Stock */}
        <div className="glass-panel p-5 glass-panel-hover relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500"></div>
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Low / Out of Stock</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
            </div>
          </div>
          <div className="text-3xl font-heading font-extrabold text-white tracking-tight flex items-baseline gap-2">
            <span>{(kpis?.lowStockCount ?? 0) + (kpis?.outOfStockCount ?? 0)}</span>
            <span className="text-xs font-semibold text-rose-400">
              ({kpis?.outOfStockCount ?? 0} Out)
            </span>
          </div>
          <div className="text-xs text-rose-300 mt-2 flex items-center justify-between pt-2 border-t border-white/5 font-semibold">
            <span>Requires Action</span>
            <span className="text-[11px] underline">View Table ↓</span>
          </div>
        </div>

        {/* KPI 3: Pending Receipts */}
        <div className="glass-panel p-5 glass-panel-hover relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Pending Receipts</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Inbox className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="text-3xl font-heading font-extrabold text-white tracking-tight">
            {kpis?.pendingReceipts ?? 0}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between pt-2 border-t border-white/5">
            <span>Inbound Purchase</span>
            <span className="text-cyan-400 font-bold text-[11px]">Slice 2</span>
          </div>
        </div>

        {/* KPI 4: Pending Deliveries */}
        <div className="glass-panel p-5 glass-panel-hover relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500"></div>
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Pending Deliveries</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Send className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="text-3xl font-heading font-extrabold text-white tracking-tight">
            {kpis?.pendingDeliveries ?? 0}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between pt-2 border-t border-white/5">
            <span>Outbound Sales</span>
            <span className="text-amber-400 font-bold text-[11px]">Slice 3</span>
          </div>
        </div>

        {/* KPI 5: Scheduled Transfers */}
        <div className="glass-panel p-5 glass-panel-hover relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-violet-500"></div>
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-semibold">Scheduled Transfers</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="text-3xl font-heading font-extrabold text-white tracking-tight">
            {kpis?.scheduledTransfers ?? 0}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between pt-2 border-t border-white/5">
            <span>Internal Moves</span>
            <span className="text-indigo-400 font-bold text-[11px]">Slice 4</span>
          </div>
        </div>

      </div>

      {/* 3. DYNAMIC VISUAL BREAKDOWN & RECENT ACTIVITY TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Stock Distribution */}
        <div className="glass-panel p-6 lg:col-span-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
                <Boxes className="w-4.5 h-4.5 text-emerald-400" />
                Stock by Category
              </h3>
              <span className="text-[11px] text-slate-300 font-bold bg-slate-900 border border-white/10 px-2.5 py-1 rounded-lg">
                Live Units
              </span>
            </div>

            <div className="space-y-4">
              {categoryBreakdown.map((cat) => {
                const totalUnits = categoryBreakdown.reduce((a, b) => a + b.unitsCount, 0) || 1;
                const percentage = Math.round((cat.unitsCount / totalUnits) * 100);

                return (
                  <div key={cat.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{cat.name}</span>
                      <span className="font-mono text-emerald-400 font-bold">{cat.unitsCount} pcs ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-slate-400">
              Active Facilities: <strong className="text-white">{kpis?.activeWarehousesCount ?? 0} Warehouses</strong>
            </p>
          </div>
        </div>

        {/* Live Stock Ledger Operations Feed */}
        <div className="glass-panel p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4.5 h-4.5 text-cyan-400" />
                Live Stock Movement Audit Feed
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time StockLedger transaction log</p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-white/5">
              {ledgerTimeline.length} Entries
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3 whitespace-nowrap">Timestamp</th>
                  <th className="py-3 px-3 whitespace-nowrap">Doc Type</th>
                  <th className="py-3 px-3 whitespace-nowrap">Doc #</th>
                  <th className="py-3 px-3">Product Name</th>
                  <th className="py-3 px-3">Location</th>
                  <th className="py-3 px-3 text-right whitespace-nowrap">Qty Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ledgerTimeline.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 italic text-xs">
                      No stock ledger entries match current filter criteria.
                    </td>
                  </tr>
                ) : (
                  ledgerTimeline.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                          item.doc_type === 'Receipt' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          item.doc_type === 'Delivery' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          item.doc_type === 'Transfer' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                          'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {item.doc_type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-200 whitespace-nowrap">
                        {item.doc_number}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-100">
                        {item.product_name}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-[11px]">
                        {item.warehouse_name} ({item.location_name})
                      </td>
                      <td className={`py-3 px-3 text-right font-mono font-bold whitespace-nowrap ${
                        item.qty_change > 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {item.qty_change > 0 ? `+${item.qty_change}` : item.qty_change}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 4. LOW STOCK ACTION CENTER TABLE */}
      <div className="glass-panel p-6 border border-rose-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-heading font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-400" />
              Low & Out of Stock Urgent Action Table
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Items below minimum stock threshold requiring reorder generation</p>
          </div>
          <span className="badge badge-rose shrink-0">
            {lowStockAlerts.length} Critical SKU{lowStockAlerts.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3.5 whitespace-nowrap">SKU Code</th>
                <th className="py-3 px-3.5">Product Description</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Category</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Stock On Hand</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Min Threshold</th>
                <th className="py-3 px-3.5 whitespace-nowrap">Status</th>
                <th className="py-3 px-3.5 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {lowStockAlerts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-emerald-400 font-semibold text-xs">
                    ✓ All inventory stock levels are operating above minimum thresholds!
                  </td>
                </tr>
              ) : (
                lowStockAlerts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-3.5 font-mono font-bold text-slate-200 whitespace-nowrap">
                      {prod.sku}
                    </td>
                    <td className="py-3.5 px-3.5 font-semibold text-slate-100">
                      {prod.name}
                    </td>
                    <td className="py-3.5 px-3.5 text-slate-400 whitespace-nowrap">
                      {prod.categoryName}
                    </td>
                    <td className="py-3.5 px-3.5 font-mono font-bold text-white whitespace-nowrap">
                      {prod.qtyOnHand} {prod.uom}
                    </td>
                    <td className="py-3.5 px-3.5 font-mono text-slate-400 whitespace-nowrap">
                      {prod.threshold} {prod.uom}
                    </td>
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      <span className={`badge ${prod.status === 'Out of Stock' ? 'badge-rose' : 'badge-amber'}`}>
                        {prod.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                      <button
                        onClick={() => onOpenReorderModal(prod)}
                        className="btn-primary py-1.5 px-3.5 text-[11px]"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Reorder (+{prod.reorderQty})
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
