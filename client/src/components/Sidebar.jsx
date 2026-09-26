import React from 'react';
import { 
  LayoutDashboard, 
  Warehouse, 
  Package, 
  ArrowLeftRight, 
  History, 
  BookOpen, 
  Layers
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard & KPIs', icon: LayoutDashboard },
    { id: 'warehouses', label: 'Warehouse Settings', icon: Warehouse },
    { id: 'products', label: 'Products & SKUs', icon: Package },
    { id: 'operations', label: 'Operations Hub', icon: ArrowLeftRight },
    { id: 'ledger', label: 'Stock Ledger Trail', icon: History },
    { id: 'team-plan', label: 'Team ERD & Plan', icon: BookOpen }
  ];

  return (
    <aside className="w-64 shrink-0 hidden lg:block border-r border-white/10 bg-slate-950/70 p-5 min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 mb-3">
            Main Application Navigation
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-xs transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/10 text-emerald-300 border-l-4 border-l-emerald-400 border-y border-r border-white/10 shadow-sm font-semibold' 
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Slice Ownership Highlight Box */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-slate-900/80 border border-indigo-500/20">
          <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs mb-1.5">
            <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Vertical Slice Ownership</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
            Owning <strong className="text-slate-200">Slice 1: Auth, Dashboard, Settings & UI/UX Cohesion</strong>.
          </p>
          <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 text-center">
            ✓ End-to-End Database & API Active
          </div>
        </div>
      </div>
    </aside>
  );
}
