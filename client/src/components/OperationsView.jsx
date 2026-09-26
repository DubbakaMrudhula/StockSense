import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Inbox, Send, RefreshCw, FileText, CheckCircle2, Clock } from 'lucide-react';

export default function OperationsView({ warehouses }) {
  const [activeTab, setActiveTab] = useState('receipts');
  const [data, setData] = useState({ receipts: [], deliveries: [], transfers: [], adjustments: [] });
  const [loading, setLoading] = useState(true);

  const fetchOps = async () => {
    try {
      const res = await fetch('/api/operations/all');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load operations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOps();
  }, []);

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-white flex items-center gap-2.5">
            <ArrowLeftRight className="w-6 h-6 text-cyan-400" />
            Inventory Operations Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracks inbound Receipts (Slice 2), outbound Deliveries (Slice 3), and internal Transfers (Slice 4).
          </p>
        </div>

        <button onClick={fetchOps} className="btn-secondary text-xs py-2 px-3">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Orders
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button 
          onClick={() => setActiveTab('receipts')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'receipts' ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Inbox className="w-4 h-4" /> Receipts (Inbound) ({data.receipts.length})
        </button>

        <button 
          onClick={() => setActiveTab('deliveries')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'deliveries' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Send className="w-4 h-4" /> Delivery Orders ({data.deliveries.length})
        </button>

        <button 
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'transfers' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" /> Internal Transfers ({data.transfers.length})
        </button>
      </div>

      {/* RECEIPTS TAB */}
      {activeTab === 'receipts' && (
        <div className="glass-panel p-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Receipt #</th>
                <th className="py-2.5 px-3">Supplier Name</th>
                <th className="py-2.5 px-3">Expected Date</th>
                <th className="py-2.5 px-3">Created By</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.receipts.map(r => (
                <tr key={r.id} className="hover:bg-slate-900/50">
                  <td className="py-3 px-3 font-mono font-bold text-cyan-400">{r.receipt_number}</td>
                  <td className="py-3 px-3 font-semibold text-slate-100">{r.supplier_name}</td>
                  <td className="py-3 px-3 text-slate-400">{r.expected_date}</td>
                  <td className="py-3 px-3 text-slate-300">{r.created_by}</td>
                  <td className="py-3 px-3">
                    <span className={`badge ${r.status === 'Done' ? 'badge-emerald' : 'badge-cyan'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* DELIVERIES TAB */}
      {activeTab === 'deliveries' && (
        <div className="glass-panel p-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">DO Number</th>
                <th className="py-2.5 px-3">Customer Name</th>
                <th className="py-2.5 px-3">Scheduled Date</th>
                <th className="py-2.5 px-3">Created By</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.deliveries.map(d => (
                <tr key={d.id} className="hover:bg-slate-900/50">
                  <td className="py-3 px-3 font-mono font-bold text-amber-400">{d.do_number}</td>
                  <td className="py-3 px-3 font-semibold text-slate-100">{d.customer_name}</td>
                  <td className="py-3 px-3 text-slate-400">{d.scheduled_date}</td>
                  <td className="py-3 px-3 text-slate-300">{d.created_by}</td>
                  <td className="py-3 px-3">
                    <span className={`badge ${d.status === 'Done' ? 'badge-emerald' : 'badge-amber'}`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TRANSFERS TAB */}
      {activeTab === 'transfers' && (
        <div className="glass-panel p-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Transfer #</th>
                <th className="py-2.5 px-3">Source Warehouse</th>
                <th className="py-2.5 px-3">Dest Warehouse</th>
                <th className="py-2.5 px-3">Qty</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.transfers.map(t => (
                <tr key={t.id} className="hover:bg-slate-900/50">
                  <td className="py-3 px-3 font-mono font-bold text-indigo-400">{t.transfer_number}</td>
                  <td className="py-3 px-3 text-slate-300">{t.src_warehouse_id}</td>
                  <td className="py-3 px-3 text-slate-300">{t.dest_warehouse_id}</td>
                  <td className="py-3 px-3 font-mono text-white font-bold">{t.qty} units</td>
                  <td className="py-3 px-3">
                    <span className="badge badge-slate">{t.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
