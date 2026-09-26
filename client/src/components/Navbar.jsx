import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  ChevronDown, 
  Building2, 
  ShieldCheck, 
  BookOpen
} from 'lucide-react';

export default function Navbar({ user, warehouses, activeWarehouse, onSelectWarehouse, isDarkMode, toggleTheme, onOpenProfile, onLogout, onOpenTeamPlan }) {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/90 backdrop-blur-xl px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
              StockSense
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              v2.4 Enterprise
            </span>
          </div>
        </div>

        {/* Global Warehouse Switcher & Quick Search */}
        <div className="hidden md:flex items-center gap-3 flex-1 max-w-xl mx-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Quick search SKU, document #, warehouse..." 
              className="w-full glass-input pl-10 text-xs py-2 bg-slate-900/80 focus:bg-slate-900"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-slate-200 shrink-0">
            <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <select 
              value={activeWarehouse} 
              onChange={(e) => onSelectWarehouse(e.target.value)}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs"
            >
              <option value="all" className="bg-slate-900 text-slate-200">All Warehouses</option>
              {warehouses.map(wh => (
                <option key={wh.id} value={wh.id} className="bg-slate-900 text-slate-200">
                  {wh.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls & User Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Work Division & ER Plan Info button */}
          <button 
            onClick={onOpenTeamPlan}
            className="flex items-center gap-2 text-xs font-semibold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 px-3.5 py-2 rounded-xl border border-cyan-500/30 transition-all shadow-sm"
            title="View Team Work Division & Schema ER Diagram"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Team Plan & ERD</span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-900 border border-white/10 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title={isDarkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>

          {/* User Profile Menu */}
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/40 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow shrink-0">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-bold text-slate-100 line-clamp-1">{user.name}</div>
                  <div className="text-[10px] text-emerald-400 font-medium">{user.role || 'Inventory Lead'}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                <div 
                  className="absolute right-0 mt-2 w-60 glass-panel bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <div className="px-3.5 py-2.5 border-b border-white/10 mb-1">
                    <div className="text-xs font-bold text-white">{user.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                  </div>

                  <button 
                    onClick={() => { setShowDropdown(false); onOpenProfile(); }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <User className="w-4 h-4 text-emerald-400" />
                    My Profile & Settings
                  </button>

                  <button 
                    onClick={() => { setShowDropdown(false); onOpenTeamPlan(); }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    Architecture & Work Division
                  </button>

                  <div className="my-1 border-t border-white/10"></div>

                  <button 
                    onClick={() => { setShowDropdown(false); onLogout(); }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : null}

        </div>
      </div>
    </header>
  );
}
