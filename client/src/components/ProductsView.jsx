import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Tag, DollarSign, Layers, CheckCircle2, X } from 'lucide-react';

export default function ProductsView({ categories, warehouses, token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [catId, setCatId] = useState(categories[0]?.id || 'cat_1');
  const [uomId, setUomId] = useState('uom_1');
  const [minThreshold, setMinThreshold] = useState('50');
  const [reorderQty, setReorderQty] = useState('200');
  const [price, setPrice] = useState('9.99');
  const [initialQty, setInitialQty] = useState('100');
  const [warehouseId, setWarehouseId] = useState('wh_1');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sku,
          name,
          category_id: catId,
          uom_id: uomId,
          min_stock_threshold: parseInt(minThreshold),
          reorder_qty: parseInt(reorderQty),
          price: parseFloat(price),
          initial_qty: parseInt(initialQty),
          warehouse_id: warehouseId
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to create product');

      setShowAddModal(false);
      fetchProducts();
      setSku('');
      setName('');
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-white flex items-center gap-2.5">
            <Package className="w-6 h-6 text-emerald-400" />
            Product Catalog Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Master SKU catalog definition with reorder threshold boundaries & initial stock intake.
          </p>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary shrink-0 text-xs py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          Add Product SKU
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-panel p-4 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by SKU or product name..."
            className="w-full glass-input pl-9 text-xs"
          />
        </div>
        <div className="text-xs text-slate-400 font-semibold">
          Showing <strong className="text-white">{filteredProducts.length}</strong> Products
        </div>
      </div>

      {/* Products Table */}
      <div className="glass-panel p-5 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-3">SKU Code</th>
              <th className="py-2.5 px-3">Product Name</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Unit Price</th>
              <th className="py-2.5 px-3 text-right">Total Stock</th>
              <th className="py-2.5 px-3 text-right">Min Threshold</th>
              <th className="py-2.5 px-3">Stock Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredProducts.map((p) => {
              const isLow = p.total_qty_on_hand <= p.min_stock_threshold;
              const isOut = p.total_qty_on_hand === 0;

              return (
                <tr key={p.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                    {p.sku}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-100">
                    {p.name}
                  </td>
                  <td className="py-3 px-3 text-slate-400">
                    {p.category_name}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    ${p.price.toFixed(2)} / {p.uom_abbr}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-white">
                    {p.total_qty_on_hand} {p.uom_abbr}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">
                    {p.min_stock_threshold} {p.uom_abbr}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`badge ${isOut ? 'badge-rose' : isLow ? 'badge-amber' : 'badge-emerald'}`}>
                      {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'Optimal'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="glass-panel max-w-lg w-full p-6 relative">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
              <h3 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-emerald-400" /> Create Product SKU
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">SKU Code</label>
                  <input 
                    type="text" 
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="ELEC-MCU-64"
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select 
                    value={catId} 
                    onChange={(e) => setCatId(e.target.value)}
                    className="w-full glass-input text-xs"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Product Description / Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="STM32 H7 Dual Core High Performance MCU"
                  className="w-full glass-input text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Min Threshold</label>
                  <input 
                    type="number" 
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(e.target.value)}
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Reorder Qty</label>
                  <input 
                    type="number" 
                    value={reorderQty}
                    onChange={(e) => setReorderQty(e.target.value)}
                    className="w-full glass-input text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Stock Intake Qty</label>
                  <input 
                    type="number" 
                    value={initialQty}
                    onChange={(e) => setInitialQty(e.target.value)}
                    className="w-full glass-input text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Warehouse</label>
                  <select 
                    value={warehouseId} 
                    onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full glass-input text-xs"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id} className="bg-slate-900">{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary py-2 text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary py-2 text-xs">
                  Save & Intake Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
