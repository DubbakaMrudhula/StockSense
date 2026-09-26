import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  MapPin, 
  User, 
  Layers, 
  Boxes, 
  ChevronDown, 
  ChevronRight, 
  CheckCircle2, 
  Wrench,
  Sparkles,
  X
} from 'lucide-react';

export default function WarehousesView({ warehouses, onRefreshWarehouses, token }) {
  const [expandedWhId, setExpandedWhId] = useState(warehouses[0]?.id || null);
  
  // Modal states
  const [showCreateWhModal, setShowCreateWhModal] = useState(false);
  const [showAddLocModal, setShowAddLocModal] = useState(false);
  const [selectedWhForLoc, setSelectedWhForLoc] = useState(null);

  // Form fields: Warehouse
  const [whCode, setWhCode] = useState('');
  const [whName, setWhName] = useState('');
  const [whAddress, setWhAddress] = useState('');
  const [whManager, setWhManager] = useState('');
  const [whCapacity, setWhCapacity] = useState('8000');
  const [whStatus, setWhStatus] = useState('Active');

  // Form fields: Location
  const [locCode, setLocCode] = useState('');
  const [locName, setLocName] = useState('');
  const [locType, setLocType] = useState('High Density Rack');
  const [locCapacity, setLocCapacity] = useState('1500');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const res = await fetch('/api/warehouses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: whCode || `WH-${Date.now().toString().slice(-4)}`,
          name: whName,
          address: whAddress,
          manager_name: whManager,
          capacity: parseInt(whCapacity),
          status: whStatus
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to create warehouse');

      setMsg('Warehouse created successfully!');
      setShowCreateWhModal(false);
      onRefreshWarehouses();
      // Reset form
      setWhCode('');
      setWhName('');
      setWhAddress('');
      setWhManager('');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!selectedWhForLoc) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/warehouses/${selectedWhForLoc.id}/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: locCode || `${selectedWhForLoc.code}-LOC-${Date.now().toString().slice(-3)}`,
          name: locName,
          type: locType,
          capacity: parseInt(locCapacity)
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to add location');

      setShowAddLocModal(false);
      onRefreshWarehouses();
      setLocCode('');
      setLocName('');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title Header */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-white flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-emerald-400" />
            Warehouse & Location Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global warehouse settings owned by Slice 1. Defines structural storage locations consumed across all vertical slices.
          </p>
        </div>

        <button 
          onClick={() => setShowCreateWhModal(true)}
          className="btn-primary shrink-0 text-xs py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          Create New Warehouse
        </button>
      </div>

      {/* Warehouses Grid */}
      <div className="grid grid-cols-1 gap-4">
        {warehouses.map((wh) => {
          const isExpanded = expandedWhId === wh.id;
          const capacityUsed = wh.total_stock_units || 0;
          const capPercent = Math.min(100, Math.round((capacityUsed / (wh.capacity || 10000)) * 100));

          return (
            <div key={wh.id} className="glass-panel p-5 transition-all">
              
              {/* Header Info */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-heading font-bold text-white">{wh.name}</h3>
                      <span className="font-mono text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {wh.code}
                      </span>
                      <span className={`badge ${wh.status === 'Active' ? 'badge-emerald' : 'badge-amber'}`}>
                        {wh.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <Wrench className="w-3 h-3" />}
                        {wh.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> {wh.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" /> Lead: <strong className="text-slate-200">{wh.manager_name}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Capacity Gauge & Expand Button */}
                <div className="flex items-center gap-6">
                  <div className="w-44 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Capacity Usage</span>
                      <span className="font-mono font-bold text-slate-200">{capPercent}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/10">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          capPercent > 90 ? 'bg-rose-500' : capPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${capPercent}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-slate-500 text-right">
                      {capacityUsed} / {wh.capacity} Units
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setSelectedWhForLoc(wh);
                        setShowAddLocModal(true);
                      }}
                      className="btn-secondary py-1.5 px-3 text-xs"
                      title="Add Bin / Rack Location"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Location
                    </button>
                    <button 
                      onClick={() => setExpandedWhId(isExpanded ? null : wh.id)}
                      className="p-2 rounded-lg bg-slate-900 border border-white/10 text-slate-300 hover:text-white"
                    >
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expandable Locations Breakdown Table */}
              {isExpanded && (
                <div className="mt-5 pt-4 border-t border-white/10 animate-in fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-cyan-400" />
                      Assigned Storage Locations ({wh.locations?.length || 0})
                    </h4>
                  </div>

                  {(!wh.locations || wh.locations.length === 0) ? (
                    <div className="p-4 rounded-xl bg-slate-900/50 text-center text-xs text-slate-500 italic">
                      No locations registered in this warehouse yet. Click "+ Location" to create one.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {wh.locations.map((loc) => (
                        <div key={loc.id} className="p-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/30 transition-all">
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-cyan-400">{loc.code}</span>
                            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                              {loc.type}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-200 mt-1.5">{loc.name}</div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            Storage Limit: <strong className="text-slate-300">{loc.capacity} Units</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* MODAL 1: CREATE WAREHOUSE */}
      {showCreateWhModal && (
        <div className="modal-overlay">
          <div className="glass-panel max-w-lg w-full p-6 relative">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" /> Create Warehouse Facility
              </h3>
              <button onClick={() => setShowCreateWhModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Warehouse Code</label>
                  <input 
                    type="text" 
                    value={whCode} 
                    onChange={(e) => setWhCode(e.target.value)} 
                    placeholder="WH-SOUTH-04" 
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select 
                    value={whStatus} 
                    onChange={(e) => setWhStatus(e.target.value)} 
                    className="w-full glass-input text-xs"
                  >
                    <option value="Active">Active</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Warehouse Name</label>
                <input 
                  type="text" 
                  value={whName} 
                  onChange={(e) => setWhName(e.target.value)} 
                  placeholder="South Region Transit Depot" 
                  className="w-full glass-input text-xs"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Physical Address</label>
                <input 
                  type="text" 
                  value={whAddress} 
                  onChange={(e) => setWhAddress(e.target.value)} 
                  placeholder="55 Logistics Boulevard, Tech Corridor" 
                  className="w-full glass-input text-xs"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Warehouse Manager</label>
                  <input 
                    type="text" 
                    value={whManager} 
                    onChange={(e) => setWhManager(e.target.value)} 
                    placeholder="David Miller" 
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Total Unit Capacity</label>
                  <input 
                    type="number" 
                    value={whCapacity} 
                    onChange={(e) => setWhCapacity(e.target.value)} 
                    className="w-full glass-input text-xs"
                    required 
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowCreateWhModal(false)} className="btn-secondary py-2 text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary py-2 text-xs">
                  {loading ? 'Creating...' : 'Save Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD LOCATION */}
      {showAddLocModal && selectedWhForLoc && (
        <div className="modal-overlay">
          <div className="glass-panel max-w-md w-full p-6 relative">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" /> Add Location to {selectedWhForLoc.code}
              </h3>
              <button onClick={() => setShowAddLocModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLocation} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location Code</label>
                <input 
                  type="text" 
                  value={locCode} 
                  onChange={(e) => setLocCode(e.target.value)} 
                  placeholder={`${selectedWhForLoc.code}-RACK-B1`} 
                  className="w-full glass-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location Name</label>
                <input 
                  type="text" 
                  value={locName} 
                  onChange={(e) => setLocName(e.target.value)} 
                  placeholder="Rack B1 - Fast Moving Sensors" 
                  className="w-full glass-input text-xs"
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location Type</label>
                  <select 
                    value={locType} 
                    onChange={(e) => setLocType(e.target.value)} 
                    className="w-full glass-input text-xs"
                  >
                    <option value="High Density Rack">High Density Rack</option>
                    <option value="Parts Bin">Parts Bin</option>
                    <option value="Floor Pallet">Floor Pallet</option>
                    <option value="Cold Storage Shelf">Cold Storage Shelf</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Capacity</label>
                  <input 
                    type="number" 
                    value={locCapacity} 
                    onChange={(e) => setLocCapacity(e.target.value)} 
                    className="w-full glass-input text-xs"
                    required 
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowAddLocModal(false)} className="btn-secondary py-2 text-xs">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary py-2 text-xs">
                  {loading ? 'Adding...' : 'Add Storage Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
