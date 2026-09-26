import React, { useState } from 'react';
import { History, Download, Filter, Search } from 'lucide-react';

export default function StockLedgerView({ ledgerTimeline = [] }) {
  const [search, setSearch] = useState('');
  const [docFilter, setDocFilter] = useState('all');

  const filtered = ledgerTimeline.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(search.toLowerCase()) || 
                          item.doc_number.toLowerCase().includes(search.toLowerCase()) ||
                          item.warehouse_name.toLowerCase().includes(search.toLowerCase());
    const matchesDoc = docFilter === 'all' || item.doc_type.toLowerCase() === docFilter.toLowerCase();
    return matchesSearch && matchesDoc;
  });

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-emerald-400" />
            Stock Ledger & Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all stock movements, receipts, deliveries, and adjustments.
          </p>
        </div>

        <button 
          onClick={() => alert('Stock Ledger export generated as CSV.')}
          className="btn-secondary text-xs py-2 px-4 shrink-0"
        >
          <Download className="w-4 h-4" /> Export CSV Audit Log
        </button>
      </div>

      {/* Filter bar */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Product, Doc # or Warehouse..."
            className="w-full glass-input pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select 
            value={docFilter}
            onChange={(e) => setDocFilter(e.target.value)}
            className="glass-input text-xs py-1.5 bg-slate-900"
          >
            <option value="all">All Movement Types</option>
            <option value="Receipt">Receipt</option>
            <option value="Delivery">Delivery</option>
            <option value="Transfer">Transfer</option>
            <option value="Adjustment">Adjustment</option>
          </select>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="glass-panel p-5 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Date & Time</th>
              <th className="py-2.5 px-3">Doc Type</th>
              <th className="py-2.5 px-3">Doc Number</th>
              <th className="py-2.5 px-3">Product</th>
              <th className="py-2.5 px-3">Warehouse & Location</th>
              <th className="py-2.5 px-3 text-right">Qty Change</th>
              <th className="py-2.5 px-3 text-right">Balance After</th>
              <th className="py-2.5 px-3">User</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(item => (
              <tr key={item.id} className="hover:bg-slate-900/50">
                <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                  {new Date(item.timestamp).toLocaleString()}
                </td>
                <td className="py-3 px-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.doc_type === 'Receipt' ? 'bg-emerald-500/20 text-emerald-300' :
                    item.doc_type === 'Delivery' ? 'bg-amber-500/20 text-amber-300' :
                    item.doc_type === 'Transfer' ? 'bg-indigo-500/20 text-indigo-300' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {item.doc_type}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono font-bold text-slate-200">{item.doc_number}</td>
                <td className="py-3 px-3 font-semibold text-slate-100">{item.product_name}</td>
                <td className="py-3 px-3 text-slate-400 text-[11px]">
                  {item.warehouse_name} ({item.location_name})
                </td>
                <td className={`py-3 px-3 text-right font-mono font-bold ${item.qty_change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.qty_change > 0 ? `+${item.qty_change}` : item.qty_change}
                </td>
                <td className="py-3 px-3 text-right font-mono font-bold text-white">
                  {item.balance_after}
                </td>
                <td className="py-3 px-3 text-slate-400 text-[11px]">{item.user_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
