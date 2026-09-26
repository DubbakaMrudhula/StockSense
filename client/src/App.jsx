import React, { useState, useEffect } from 'react';
import { api } from './api';

export default function App() {
  // Authentication & Navigation
  const [user, setUser] = useState(null); // null = landing view, otherwise logged in
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authRole, setAuthRole] = useState('Inventory Manager');

  // Operational Data States
  const [kpis, setKpis] = useState({
    totalProducts: 8,
    lowStockCount: 2,
    outOfStockCount: 1,
    criticalStockTotal: 3,
    pendingReceipts: 2,
    activeDeliveries: 2,
    activeTransfers: 1
  });
  const [products, setProducts] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);

  // Product Filtering
  const [productSearch, setProductSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all'); // 'all', 'low', 'out'

  // Modals for Actions
  const [modalType, setModalType] = useState(null); // 'product' | 'receipt' | 'delivery' | 'transfer' | 'adjustment' | null

  // Form states
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: 'Packaging Supplies',
    quantity: 50,
    minThreshold: 15,
    unit: 'units',
    location: 'Aisle 1 - Bay A',
    price: 10,
    supplier: 'General Supplier'
  });

  const [newReceipt, setNewReceipt] = useState({
    supplier: '',
    destinationLocation: 'Inbound Dock Bay 1',
    productSku: '',
    quantityExpected: 25,
    notes: ''
  });

  const [newDelivery, setNewDelivery] = useState({
    destination: '',
    carrier: 'Express Freight Line',
    productSku: '',
    quantity: 10
  });

  const [newTransfer, setNewTransfer] = useState({
    productSku: '',
    quantity: 10,
    fromLocation: 'Bulk Staging Zone',
    toLocation: 'Aisle 2 - Shelf 1'
  });

  const [newAdjustment, setNewAdjustment] = useState({
    productSku: '',
    newQuantity: 0,
    reason: 'Physical Cycle Count',
    notes: ''
  });

  // Load Initial Data
  const refreshData = async () => {
    try {
      const [kpiRes, prodRes, recRes, delRes, trfRes, adjRes] = await Promise.all([
        api.getKpis(),
        api.getProducts(),
        api.getReceipts(),
        api.getDeliveries(),
        api.getTransfers(),
        api.getAdjustments()
      ]);

      if (kpiRes) setKpis(kpiRes);
      if (prodRes) setProducts(prodRes);
      if (recRes) setReceipts(recRes);
      if (delRes) setDeliveries(delRes);
      if (trfRes) setTransfers(trfRes);
      if (adjRes) setAdjustments(adjRes);
    } catch (err) {
      console.warn("Data load notice:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  // Auth Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const emailToUse = authEmail.trim() || (authRole === 'Inventory Manager' ? 'manager@stocksense.com' : 'staff@stocksense.com');
    const res = await api.login({
      email: emailToUse,
      role: authRole
    });
    setUser(res.user);
    setAuthModalOpen(false);
    setActiveTab('dashboard');
  };

  const handleDemoLogin = (role) => {
    setUser({
      name: role === 'Inventory Manager' ? 'Alex Morgan' : 'Sam Rivera',
      email: role === 'Inventory Manager' ? 'manager@stocksense.com' : 'staff@stocksense.com',
      role: role
    });
    setAuthModalOpen(false);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  // Form Submissions for Modules
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.sku || !newProduct.name) return;
    await api.createProduct(newProduct);
    setModalType(null);
    setNewProduct({
      sku: '',
      name: '',
      category: 'Packaging Supplies',
      quantity: 50,
      minThreshold: 15,
      unit: 'units',
      location: 'Aisle 1 - Bay A',
      price: 10,
      supplier: 'General Supplier'
    });
    refreshData();
  };

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    const prod = products.find(p => p.sku === newReceipt.productSku) || products[0];
    await api.createReceipt({
      supplier: newReceipt.supplier || 'Standard Supplier',
      destinationLocation: newReceipt.destinationLocation,
      notes: newReceipt.notes,
      items: [{
        productSku: prod ? prod.sku : 'PRD-1001',
        productName: prod ? prod.name : 'Heavy-Duty Pallet Wrap',
        quantityExpected: Number(newReceipt.quantityExpected),
        quantityReceived: 0
      }]
    });
    setModalType(null);
    refreshData();
  };

  const handleReceiptStatus = async (receiptNumber, status) => {
    await api.updateReceiptStatus(receiptNumber, status);
    refreshData();
  };

  const handleCreateDelivery = async (e) => {
    e.preventDefault();
    const prod = products.find(p => p.sku === newDelivery.productSku) || products[0];
    await api.createDelivery({
      destination: newDelivery.destination || 'Customer Regional Hub',
      carrier: newDelivery.carrier,
      items: [{
        productSku: prod ? prod.sku : 'PRD-1001',
        productName: prod ? prod.name : 'Heavy-Duty Pallet Wrap',
        quantity: Number(newDelivery.quantity)
      }]
    });
    setModalType(null);
    refreshData();
  };

  const handleDeliveryStatus = async (deliveryNumber, status) => {
    await api.updateDeliveryStatus(deliveryNumber, status);
    refreshData();
  };

  const handleCreateTransfer = async (e) => {
    e.preventDefault();
    const prod = products.find(p => p.sku === newTransfer.productSku) || products[0];
    await api.createTransfer({
      productSku: prod ? prod.sku : 'PRD-1001',
      productName: prod ? prod.name : 'Heavy-Duty Pallet Wrap',
      quantity: Number(newTransfer.quantity),
      fromLocation: newTransfer.fromLocation,
      toLocation: newTransfer.toLocation,
      transferredBy: user ? user.name : 'Warehouse Staff'
    });
    setModalType(null);
    refreshData();
  };

  const handleCreateAdjustment = async (e) => {
    e.preventDefault();
    const prod = products.find(p => p.sku === newAdjustment.productSku) || products[0];
    if (!prod) return;
    await api.createAdjustment({
      productSku: prod.sku,
      productName: prod.name,
      previousQuantity: prod.quantity,
      newQuantity: Number(newAdjustment.newQuantity),
      reason: newAdjustment.reason,
      notes: newAdjustment.notes,
      adjustedBy: user ? user.name : 'Inventory Manager'
    });
    setModalType(null);
    refreshData();
  };

  const handleDeleteProduct = async (sku) => {
    if (window.confirm(`Delete product ${sku}?`)) {
      await api.deleteProduct(sku);
      refreshData();
    }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(productSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (productFilter === 'low') return p.quantity > 0 && p.quantity <= p.minThreshold;
    if (productFilter === 'out') return p.quantity === 0;
    return true;
  });

  return (
    <div className="stocksense-app">
      {/* Top Header */}
      <header>
        <div className="container header-inner">
          <div className="brand" onClick={() => !user && setActiveTab('dashboard')}>
            <div className="brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                <path d="m3.3 7 8.7 5 8.7-5"></path>
                <path d="M12 22V12"></path>
              </svg>
            </div>
            <span>StockSense</span>
          </div>

          {/* Logged in Navigation Tabs */}
          {user && (
            <nav className="header-nav">
              <button className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
              <button className={`nav-tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Products</button>
              <button className={`nav-tab-btn ${activeTab === 'receipts' ? 'active' : ''}`} onClick={() => setActiveTab('receipts')}>Receipts</button>
              <button className={`nav-tab-btn ${activeTab === 'deliveries' ? 'active' : ''}`} onClick={() => setActiveTab('deliveries')}>Deliveries</button>
              <button className={`nav-tab-btn ${activeTab === 'transfers' ? 'active' : ''}`} onClick={() => setActiveTab('transfers')}>Transfers</button>
              <button className={`nav-tab-btn ${activeTab === 'adjustments' ? 'active' : ''}`} onClick={() => setActiveTab('adjustments')}>Adjustments</button>
            </nav>
          )}

          <div className="header-actions">
            {!user ? (
              <>
                <button className="btn btn-secondary" onClick={() => { setAuthMode('login'); setAuthModalOpen(true); }}>Log In</button>
                <button className="btn btn-primary" onClick={() => { setAuthMode('signup'); setAuthModalOpen(true); }}>Sign Up</button>
              </>
            ) : (
              <>
                <div className="user-badge">
                  <span>{user.name}</span>
                  <span className="user-role-tag">({user.role})</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Log Out</button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content: Landing View vs. Logged In Console */}
      <main>
        {!user ? (
          /* ================= LANDING / ENTRY VIEW ================= */
          <div>
            <section className="hero">
              <div className="container hero-grid">
                <div>
                  <h1>Replace paper registers and spreadsheets with simple, real-time inventory tracking.</h1>
                  
                  <p className="hero-sub">
                    StockSense centralizes all inventory operations into one clear screen, giving warehouse staff and inventory managers instant stock accuracy from receiving dock to customer delivery.
                  </p>

                  <div className="role-highlights">
                    <div>
                      <span className="role-title">For Inventory Managers:</span> Monitor supplier deliveries, set minimum reorder thresholds, and maintain reliable stock counts across all locations.
                    </div>
                    <div>
                      <span className="role-title">For Warehouse Staff:</span> Quickly log incoming stock, record shelf-to-shelf transfers, pack orders, and submit physical count checks.
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={() => handleDemoLogin('Inventory Manager')}>
                      Open Manager Console
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleDemoLogin('Warehouse Staff')}>
                      Open Staff Console
                    </button>
                  </div>
                </div>

                {/* Warehouse Stock Snapshot Card */}
                <div className="summary-card">
                  <div className="summary-card-top">
                    <span>Warehouse Stock Snapshot</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--status-green)' }}>● Live Data</span>
                  </div>

                  <div className="summary-grid">
                    <div className="summary-item">
                      <div className="summary-label">Total Tracked Products</div>
                      <div className="summary-value">{kpis.totalProducts}</div>
                      <div className="summary-hint">Catalog items in stock</div>
                    </div>

                    <div className="summary-item">
                      <div className="summary-label">Low or Out of Stock</div>
                      <div className="summary-value" style={{ color: 'var(--status-red)' }}>{kpis.criticalStockTotal}</div>
                      <div className="summary-hint" style={{ color: 'var(--status-red)' }}>Needs replenishment</div>
                    </div>

                    <div className="summary-item">
                      <div className="summary-label">Pending Inbound Receipts</div>
                      <div className="summary-value" style={{ color: 'var(--status-blue)' }}>{kpis.pendingReceipts}</div>
                      <div className="summary-hint">Arriving from suppliers</div>
                    </div>

                    <div className="summary-item">
                      <div className="summary-label">Orders to Dispatch</div>
                      <div className="summary-value" style={{ color: 'var(--accent-amber)' }}>{kpis.activeDeliveries}</div>
                      <div className="summary-hint">Ready for packing &amp; delivery</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Core Modules Presentation */}
            <section className="modules-section">
              <div className="container">
                <div className="section-head">
                  <h2 className="section-title">Core Modules</h2>
                  <p className="section-sub">Straightforward tools for every stage of your inventory lifecycle.</p>
                </div>

                <div className="module-cards-grid">
                  <div className="module-card">
                    <div className="module-icon-wrap">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                      </svg>
                    </div>
                    <h3 className="module-heading">Products</h3>
                    <p className="module-detail">Maintain an up-to-date catalog of items with quantities, minimum threshold alerts, and shelf locations.</p>
                  </div>

                  <div className="module-card">
                    <div className="module-icon-wrap" style={{ color: 'var(--status-blue)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path>
                        <path d="M12 12v9"></path>
                        <path d="m8 17 4 4 4-4"></path>
                      </svg>
                    </div>
                    <h3 className="module-heading">Receipts</h3>
                    <p className="module-detail">Log incoming shipments delivered by suppliers and verify items before moving them to storage shelves.</p>
                  </div>

                  <div className="module-card">
                    <div className="module-icon-wrap" style={{ color: 'var(--accent-amber)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect width="16" height="13" x="1" y="6" rx="2"></rect>
                        <path d="M17 11h4l2 3v5h-6"></path>
                        <circle cx="6" cy="19" r="2"></circle>
                        <circle cx="18" cy="19" r="2"></circle>
                      </svg>
                    </div>
                    <h3 className="module-heading">Delivery Orders</h3>
                    <p className="module-detail">Pick, pack, and record outgoing shipments heading to customers, stores, or other branches.</p>
                  </div>

                  <div className="module-card">
                    <div className="module-icon-wrap" style={{ color: 'var(--status-green)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="m16 3 4 4-4 4"></path>
                        <path d="M20 7H4"></path>
                        <path d="m8 21-4-4 4-4"></path>
                        <path d="M4 17h16"></path>
                      </svg>
                    </div>
                    <h3 className="module-heading">Internal Transfers</h3>
                    <p className="module-detail">Move inventory between aisles, shelves, or storage bins while keeping item locations accurate.</p>
                  </div>

                  <div className="module-card">
                    <div className="module-icon-wrap" style={{ color: 'var(--status-red)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 20v-6"></path>
                        <path d="M6 20V10"></path>
                        <path d="M18 20V4"></path>
                      </svg>
                    </div>
                    <h3 className="module-heading">Stock Adjustments</h3>
                    <p className="module-detail">Quickly correct counts after physical warehouse checks, damaged goods, or returned stock.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* ================= LOGGED IN CONSOLE VIEWS ================= */
          <div className="container app-view">

            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="view-header">
                  <div className="view-title-group">
                    <h2>Inventory Overview</h2>
                    <p>Live summary of items, inbound deliveries, and floor movements.</p>
                  </div>
                  <div className="view-controls">
                    <button className="btn btn-primary" onClick={() => setModalType('product')}>+ Add Product</button>
                    <button className="btn btn-secondary" onClick={() => setModalType('receipt')}>+ Log Receipt</button>
                    <button className="btn btn-secondary" onClick={() => setModalType('transfer')}>+ Stock Transfer</button>
                  </div>
                </div>

                {/* Dashboard KPI Grid */}
                <div className="kpi-row">
                  <div className="kpi-tile">
                    <div className="kpi-tile-label">Total Products</div>
                    <div className="kpi-tile-value">{kpis.totalProducts}</div>
                  </div>
                  <div className="kpi-tile">
                    <div className="kpi-tile-label">Low Stock Items</div>
                    <div className="kpi-tile-value" style={{ color: 'var(--accent-amber)' }}>{kpis.lowStockCount}</div>
                  </div>
                  <div className="kpi-tile">
                    <div className="kpi-tile-label">Out of Stock</div>
                    <div className="kpi-tile-value" style={{ color: 'var(--status-red)' }}>{kpis.outOfStockCount}</div>
                  </div>
                  <div className="kpi-tile">
                    <div className="kpi-tile-label">Pending Receipts</div>
                    <div className="kpi-tile-value" style={{ color: 'var(--status-blue)' }}>{kpis.pendingReceipts}</div>
                  </div>
                  <div className="kpi-tile">
                    <div className="kpi-tile-label">Active Deliveries</div>
                    <div className="kpi-tile-value" style={{ color: 'var(--accent-amber)' }}>{kpis.activeDeliveries}</div>
                  </div>
                  <div className="kpi-tile">
                    <div className="kpi-tile-label">Scheduled Transfers</div>
                    <div className="kpi-tile-value" style={{ color: 'var(--status-green)' }}>{kpis.activeTransfers}</div>
                  </div>
                </div>

                {/* Quick Stock Watch Table */}
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--text-white)' }}>Urgent Stock Watch</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('products')}>View All Products</button>
                  </div>

                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>SKU</th>
                          <th>Product Name</th>
                          <th>Current Stock</th>
                          <th>Reorder Threshold</th>
                          <th>Shelf Location</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.slice(0, 5).map(prod => (
                          <tr key={prod.sku}>
                            <td className="td-sku">{prod.sku}</td>
                            <td style={{ fontWeight: 500, color: 'var(--text-white)' }}>{prod.name}</td>
                            <td>{prod.quantity} {prod.unit}</td>
                            <td>{prod.minThreshold} {prod.unit}</td>
                            <td>{prod.location}</td>
                            <td>
                              {prod.quantity === 0 ? (
                                <span className="badge badge-out">Out of Stock</span>
                              ) : prod.quantity <= prod.minThreshold ? (
                                <span className="badge badge-low">Low Stock</span>
                              ) : (
                                <span className="badge badge-normal">Adequate</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PRODUCTS */}
            {activeTab === 'products' && (
              <div>
                <div className="view-header">
                  <div className="view-title-group">
                    <h2>Product Catalog</h2>
                    <p>Manage all catalog items, quantities, minimum stock alerts, and storage locations.</p>
                  </div>
                  <div className="view-controls">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search by name, SKU, or category..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                    <select
                      className="search-input"
                      style={{ minWidth: '150px' }}
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                    >
                      <option value="all">All Items</option>
                      <option value="low">Low Stock Items</option>
                      <option value="out">Out of Stock Items</option>
                    </select>
                    <button className="btn btn-primary" onClick={() => setModalType('product')}>+ Add Product</button>
                  </div>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Current Quantity</th>
                        <th>Min Threshold</th>
                        <th>Location</th>
                        <th>Unit Price</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(prod => (
                        <tr key={prod.sku}>
                          <td className="td-sku">{prod.sku}</td>
                          <td style={{ fontWeight: 500, color: 'var(--text-white)' }}>{prod.name}</td>
                          <td>{prod.category}</td>
                          <td style={{ fontWeight: 600 }}>{prod.quantity} {prod.unit}</td>
                          <td>{prod.minThreshold}</td>
                          <td>{prod.location}</td>
                          <td>${Number(prod.price).toFixed(2)}</td>
                          <td>
                            {prod.quantity === 0 ? (
                              <span className="badge badge-out">Out of Stock</span>
                            ) : prod.quantity <= prod.minThreshold ? (
                              <span className="badge badge-low">Low Stock</span>
                            ) : (
                              <span className="badge badge-normal">In Stock</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleDeleteProduct(prod.sku)}
                              title="Delete Product"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: RECEIPTS */}
            {activeTab === 'receipts' && (
              <div>
                <div className="view-header">
                  <div className="view-title-group">
                    <h2>Incoming Receipts</h2>
                    <p>Track supplier deliveries arriving at the loading dock.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => setModalType('receipt')}>+ Log New Receipt</button>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Receipt #</th>
                        <th>Supplier</th>
                        <th>Dock Location</th>
                        <th>Items Expected</th>
                        <th>Current Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipts.map(rec => (
                        <tr key={rec.receiptNumber}>
                          <td className="td-sku">{rec.receiptNumber}</td>
                          <td style={{ fontWeight: 500, color: 'var(--text-white)' }}>{rec.supplier}</td>
                          <td>{rec.destinationLocation}</td>
                          <td>
                            {rec.items && rec.items.map((it, idx) => (
                              <div key={idx}>{it.productName} ({it.quantityExpected} units)</div>
                            ))}
                          </td>
                          <td>
                            <span className={`badge ${rec.status === 'Completed' ? 'badge-normal' : rec.status === 'In Inspection' ? 'badge-low' : 'badge-blue'}`}>
                              {rec.status}
                            </span>
                          </td>
                          <td>
                            {rec.status === 'Pending Dock' && (
                              <button className="btn btn-secondary btn-sm" onClick={() => handleReceiptStatus(rec.receiptNumber, 'In Inspection')}>
                                Inspect Items
                              </button>
                            )}
                            {rec.status === 'In Inspection' && (
                              <button className="btn btn-primary btn-sm" onClick={() => handleReceiptStatus(rec.receiptNumber, 'Completed')}>
                                Complete &amp; Shelve
                              </button>
                            )}
                            {rec.status === 'Completed' && (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Received</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: DELIVERIES */}
            {activeTab === 'deliveries' && (
              <div>
                <div className="view-header">
                  <div className="view-title-group">
                    <h2>Delivery Orders</h2>
                    <p>Manage outgoing orders for customers, stores, and branch transfers.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => setModalType('delivery')}>+ Create Delivery Order</button>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Delivery #</th>
                        <th>Destination</th>
                        <th>Carrier</th>
                        <th>Items to Ship</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deliveries.map(del => (
                        <tr key={del.deliveryNumber}>
                          <td className="td-sku">{del.deliveryNumber}</td>
                          <td style={{ fontWeight: 500, color: 'var(--text-white)' }}>{del.destination}</td>
                          <td>{del.carrier}</td>
                          <td>
                            {del.items && del.items.map((it, idx) => (
                              <div key={idx}>{it.productName} ({it.quantity} units)</div>
                            ))}
                          </td>
                          <td>
                            <span className={`badge ${del.status === 'Dispatched' ? 'badge-normal' : del.status === 'Picked' ? 'badge-low' : 'badge-blue'}`}>
                              {del.status}
                            </span>
                          </td>
                          <td>
                            {del.status === 'Staging' && (
                              <button className="btn btn-secondary btn-sm" onClick={() => handleDeliveryStatus(del.deliveryNumber, 'Picked')}>
                                Mark Picked
                              </button>
                            )}
                            {del.status === 'Picked' && (
                              <button className="btn btn-primary btn-sm" onClick={() => handleDeliveryStatus(del.deliveryNumber, 'Dispatched')}>
                                Dispatch Order
                              </button>
                            )}
                            {del.status === 'Dispatched' && (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dispatched</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: TRANSFERS */}
            {activeTab === 'transfers' && (
              <div>
                <div className="view-header">
                  <div className="view-title-group">
                    <h2>Internal Stock Transfers</h2>
                    <p>Shift inventory between aisles, shelves, and storage zones with real-time balance updates.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => setModalType('transfer')}>+ New Stock Transfer</button>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Transfer #</th>
                        <th>Product</th>
                        <th>Quantity Moved</th>
                        <th>From Location</th>
                        <th>To Location</th>
                        <th>Logged By</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transfers.map(trf => (
                        <tr key={trf.transferNumber}>
                          <td className="td-sku">{trf.transferNumber}</td>
                          <td style={{ fontWeight: 500, color: 'var(--text-white)' }}>{trf.productName}</td>
                          <td style={{ fontWeight: 600 }}>{trf.quantity} units</td>
                          <td>{trf.fromLocation}</td>
                          <td style={{ color: 'var(--accent-amber)', fontWeight: 500 }}>&rarr; {trf.toLocation}</td>
                          <td>{trf.transferredBy}</td>
                          <td>
                            <span className="badge badge-normal">{trf.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: ADJUSTMENTS */}
            {activeTab === 'adjustments' && (
              <div>
                <div className="view-header">
                  <div className="view-title-group">
                    <h2>Stock Adjustments</h2>
                    <p>Audit and reconcile inventory counts following cycle checks, damages, or returns.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => setModalType('adjustment')}>+ Record Adjustment</button>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Adjustment #</th>
                        <th>Product</th>
                        <th>Previous Count</th>
                        <th>New Count</th>
                        <th>Difference</th>
                        <th>Reason</th>
                        <th>Adjusted By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adjustments.map(adj => (
                        <tr key={adj.adjustmentNumber}>
                          <td className="td-sku">{adj.adjustmentNumber}</td>
                          <td style={{ fontWeight: 500, color: 'var(--text-white)' }}>{adj.productName}</td>
                          <td>{adj.previousQuantity} units</td>
                          <td style={{ fontWeight: 600, color: 'var(--text-white)' }}>{adj.newQuantity} units</td>
                          <td style={{ fontWeight: 700, color: adj.difference >= 0 ? 'var(--status-green)' : 'var(--status-red)' }}>
                            {adj.difference >= 0 ? `+${adj.difference}` : adj.difference} units
                          </td>
                          <td>{adj.reason}</td>
                          <td>{adj.adjustedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* Simple Footer */}
      <footer>
        <div className="container footer-inner">
          <div>
            <strong>StockSense</strong> &mdash; Warehouse Inventory Management System
          </div>
          <div>
            Designed for inventory managers and warehouse operations teams.
          </div>
        </div>
      </footer>

      {/* ================= MODALS ================= */}

      {/* 1. Auth Modal */}
      {authModalOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setAuthModalOpen(false)}>
          <div className="modal-box">
            <div className="modal-head">
              <h3>{authMode === 'login' ? 'Log In to StockSense' : 'Create Warehouse Account'}</h3>
              <button className="close-btn" onClick={() => setAuthModalOpen(false)}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: '18px', borderBottom: '1px solid var(--border-color)' }}>
              <button
                className={`nav-tab-btn ${authMode === 'login' ? 'active' : ''}`}
                style={{ borderRadius: 0 }}
                onClick={() => setAuthMode('login')}
              >
                Log In
              </button>
              <button
                className={`nav-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
                style={{ borderRadius: 0 }}
                onClick={() => setAuthMode('signup')}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuthSubmit}>
              <div className="form-row">
                <label>Operational Role</label>
                <select value={authRole} onChange={(e) => setAuthRole(e.target.value)}>
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Warehouse Staff">Warehouse Staff</option>
                </select>
              </div>

              <div className="form-row">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <label>Password</label>
                <input type="password" placeholder="••••••••" required defaultValue="password123" />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                {authMode === 'login' ? 'Enter Warehouse Console' : 'Create Account'}
              </button>
            </form>

            <div style={{ marginTop: '18px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                Quick Hackathon Demo Sign-In:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button className="btn btn-secondary btn-sm" onClick={() => handleDemoLogin('Inventory Manager')}>
                  Login as Manager
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleDemoLogin('Warehouse Staff')}>
                  Login as Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Add Product Modal */}
      {modalType === 'product' && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setModalType(null)}>
          <div className="modal-box">
            <div className="modal-head">
              <h3>Add New Product</h3>
              <button className="close-btn" onClick={() => setModalType(null)}>&times;</button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="form-row">
                <label>Product SKU (Code)</label>
                <input
                  type="text"
                  placeholder="e.g. PRD-1009"
                  required
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Safety Glasses Anti-Fog"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option value="Packaging Supplies">Packaging Supplies</option>
                  <option value="Hardware & Fittings">Hardware &amp; Fittings</option>
                  <option value="Fasteners">Fasteners</option>
                  <option value="Safety Equipment">Safety Equipment</option>
                  <option value="Maintenance & Fluids">Maintenance &amp; Fluids</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-row">
                  <label>Initial Quantity</label>
                  <input
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <label>Reorder Threshold</label>
                  <input
                    type="number"
                    value={newProduct.minThreshold}
                    onChange={(e) => setNewProduct({ ...newProduct, minThreshold: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <label>Shelf Location</label>
                <input
                  type="text"
                  placeholder="e.g. Aisle 3 - Shelf 2"
                  value={newProduct.location}
                  onChange={(e) => setNewProduct({ ...newProduct, location: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Log Inbound Receipt Modal */}
      {modalType === 'receipt' && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setModalType(null)}>
          <div className="modal-box">
            <div className="modal-head">
              <h3>Log Inbound Receipt</h3>
              <button className="close-btn" onClick={() => setModalType(null)}>&times;</button>
            </div>

            <form onSubmit={handleCreateReceipt}>
              <div className="form-row">
                <label>Supplier Name</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Industrial Supplies"
                  required
                  value={newReceipt.supplier}
                  onChange={(e) => setNewReceipt({ ...newReceipt, supplier: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Select Product</label>
                <select
                  value={newReceipt.productSku}
                  onChange={(e) => setNewReceipt({ ...newReceipt, productSku: e.target.value })}
                >
                  {products.map(p => (
                    <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>Quantity Expected</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newReceipt.quantityExpected}
                  onChange={(e) => setNewReceipt({ ...newReceipt, quantityExpected: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Dock Bay / Location</label>
                <input
                  type="text"
                  value={newReceipt.destinationLocation}
                  onChange={(e) => setNewReceipt({ ...newReceipt, destinationLocation: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. New Delivery Modal */}
      {modalType === 'delivery' && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setModalType(null)}>
          <div className="modal-box">
            <div className="modal-head">
              <h3>Create Delivery Order</h3>
              <button className="close-btn" onClick={() => setModalType(null)}>&times;</button>
            </div>

            <form onSubmit={handleCreateDelivery}>
              <div className="form-row">
                <label>Destination (Customer / Branch)</label>
                <input
                  type="text"
                  placeholder="e.g. North Distribution Hub"
                  required
                  value={newDelivery.destination}
                  onChange={(e) => setNewDelivery({ ...newDelivery, destination: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Select Product to Dispatch</label>
                <select
                  value={newDelivery.productSku}
                  onChange={(e) => setNewDelivery({ ...newDelivery, productSku: e.target.value })}
                >
                  {products.map(p => (
                    <option key={p.sku} value={p.sku}>{p.name} (Stock: {p.quantity})</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>Quantity to Ship</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newDelivery.quantity}
                  onChange={(e) => setNewDelivery({ ...newDelivery, quantity: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Carrier</label>
                <input
                  type="text"
                  value={newDelivery.carrier}
                  onChange={(e) => setNewDelivery({ ...newDelivery, carrier: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Delivery</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Internal Stock Transfer Modal */}
      {modalType === 'transfer' && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setModalType(null)}>
          <div className="modal-box">
            <div className="modal-head">
              <h3>Transfer Stock Between Locations</h3>
              <button className="close-btn" onClick={() => setModalType(null)}>&times;</button>
            </div>

            <form onSubmit={handleCreateTransfer}>
              <div className="form-row">
                <label>Product to Move</label>
                <select
                  value={newTransfer.productSku}
                  onChange={(e) => setNewTransfer({ ...newTransfer, productSku: e.target.value })}
                >
                  {products.map(p => (
                    <option key={p.sku} value={p.sku}>{p.name} (Current: {p.location})</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>Quantity to Transfer</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={newTransfer.quantity}
                  onChange={(e) => setNewTransfer({ ...newTransfer, quantity: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-row">
                  <label>From Location</label>
                  <input
                    type="text"
                    required
                    value={newTransfer.fromLocation}
                    onChange={(e) => setNewTransfer({ ...newTransfer, fromLocation: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <label>To Location</label>
                  <input
                    type="text"
                    required
                    value={newTransfer.toLocation}
                    onChange={(e) => setNewTransfer({ ...newTransfer, toLocation: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Execute Transfer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Stock Count Adjustment Modal */}
      {modalType === 'adjustment' && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setModalType(null)}>
          <div className="modal-box">
            <div className="modal-head">
              <h3>Record Stock Count Adjustment</h3>
              <button className="close-btn" onClick={() => setModalType(null)}>&times;</button>
            </div>

            <form onSubmit={handleCreateAdjustment}>
              <div className="form-row">
                <label>Product</label>
                <select
                  value={newAdjustment.productSku}
                  onChange={(e) => {
                    const sel = products.find(p => p.sku === e.target.value);
                    setNewAdjustment({
                      ...newAdjustment,
                      productSku: e.target.value,
                      newQuantity: sel ? sel.quantity : 0
                    });
                  }}
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.sku} value={p.sku}>{p.name} (Current recorded: {p.quantity})</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>Newly Verified Physical Count</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newAdjustment.newQuantity}
                  onChange={(e) => setNewAdjustment({ ...newAdjustment, newQuantity: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Reason for Adjustment</label>
                <select
                  value={newAdjustment.reason}
                  onChange={(e) => setNewAdjustment({ ...newAdjustment, reason: e.target.value })}
                >
                  <option value="Physical Cycle Count">Physical Cycle Count</option>
                  <option value="Damaged Stock">Damaged Stock</option>
                  <option value="Supplier Shortage">Supplier Shortage</option>
                  <option value="Customer Return">Customer Return</option>
                  <option value="Shelf Loss">Shelf Loss</option>
                </select>
              </div>

              <div className="form-row">
                <label>Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Recounted by floor team during morning audit"
                  value={newAdjustment.notes}
                  onChange={(e) => setNewAdjustment({ ...newAdjustment, notes: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
