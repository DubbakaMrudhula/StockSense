import React, { useState, useEffect } from 'react';
import { api } from './api';

export default function App() {
  // Navigation & Authentication
  const [user, setUser] = useState(null); // null = landing view, otherwise logged in user
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authRole, setAuthRole] = useState('Inventory Manager');

  // Operational Datasets
  const [kpis, setKpis] = useState({
    totalProducts: 9,
    lowStockCount: 2,
    outOfStockCount: 1,
    criticalStockTotal: 3,
    pendingReceipts: 2,
    activeDeliveries: 2,
    activeTransfers: 2
  });
  const [products, setProducts] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [adjustments, setAdjustments] = useState([]);
  const [ledgerEntries, setLedgerEntries] = useState([]);

  // Product Filter
  const [productSearch, setProductSearch] = useState('');
  const [productFilter, setProductFilter] = useState('all');

  // Ledger Filters
  const [ledgerFilters, setLedgerFilters] = useState({
    product: '',
    location: '',
    type: 'ALL',
    date_from: '',
    date_to: ''
  });

  // Modals & Spec Scenario
  const [modalType, setModalType] = useState(null); // 'transfer' | 'adjustment' | 'product' | 'receipt' | 'delivery' | null
  const [scenarioResult, setScenarioResult] = useState(null);
  const [scenarioRunning, setScenarioRunning] = useState(false);

  // Form states: Transfer Form with Live Validation
  const [transferForm, setTransferForm] = useState({
    productSku: 'PRD-STEEL-100',
    fromLocation: 'Main Warehouse - Rack A',
    toLocation: 'Production Floor',
    quantity: 10,
    notes: ''
  });

  // Form states: Adjustment Form with Live Delta Computation
  const [adjustmentForm, setAdjustmentForm] = useState({
    productSku: 'PRD-STEEL-100',
    location: 'Main Warehouse - Rack A',
    countedQuantity: 100,
    reason: 'Physical Cycle Count',
    notes: ''
  });

  // Product Creation
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: 'Packaging Supplies',
    quantity: 50,
    minThreshold: 15,
    unit: 'units',
    location: 'Main Warehouse - Rack A',
    price: 10,
    supplier: 'General Supplier'
  });

  // Data Refresh
  const refreshData = async () => {
    try {
      const [kpiRes, prodRes, recRes, delRes, trfRes, adjRes, ledRes] = await Promise.all([
        api.getKpis(),
        api.getProducts(),
        api.getReceipts(),
        api.getDeliveries(),
        api.getInternalTransfers(),
        api.getStockAdjustments(),
        api.getStockLedger(ledgerFilters)
      ]);

      if (kpiRes) setKpis(kpiRes);
      if (prodRes) {
        setProducts(prodRes);
        // Default transfer/adjustment sku if not set
        if (prodRes.length > 0 && !transferForm.productSku) {
          setTransferForm(prev => ({ ...prev, productSku: prodRes[0].sku }));
          setAdjustmentForm(prev => ({ ...prev, productSku: prodRes[0].sku }));
        }
      }
      if (recRes) setReceipts(recRes);
      if (delRes) setDeliveries(delRes);
      if (trfRes) setTransfers(trfRes);
      if (adjRes) setAdjustments(adjRes);
      if (ledRes) setLedgerEntries(ledRes);
    } catch (e) {
      console.warn("Refresh error:", e);
    }
  };

  useEffect(() => {
    refreshData();
  }, [user]);

  // When ledger filters change, reload ledger
  useEffect(() => {
    api.getStockLedger(ledgerFilters).then(data => {
      if (data) setLedgerEntries(data);
    });
  }, [ledgerFilters]);

  // Auth Handling
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    const emailToUse = authEmail.trim() || (authRole === 'Inventory Manager' ? 'manager@stocksense.com' : 'staff@stocksense.com');
    const res = await api.login({ email: emailToUse, role: authRole });
    setUser(res.user);
    setAuthModalOpen(false);
    setActiveTab('dashboard');
  };

  const handleDemoLogin = (role) => {
    setUser({
      name: role === 'Inventory Manager' ? 'Alex Morgan' : 'Sam Rivera',
      email: role === 'Inventory Manager' ? 'manager@stocksense.com' : 'staff@stocksense.com',
      role
    });
    setAuthModalOpen(false);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  // Helper: Get active product for forms
  const selectedTransferProduct = products.find(p => p.sku === transferForm.productSku) || products[0];
  const selectedAdjustmentProduct = products.find(p => p.sku === adjustmentForm.productSku) || products[0];

  // Helper: Find stock available at source location for transfer validation
  const getAvailableStockAtLocation = (product, locationName) => {
    if (!product || !product.locations) return product ? product.quantity : 0;
    const loc = product.locations.find(l => l.location === locationName);
    return loc ? loc.quantity : 0;
  };

  // Live Validation for Transfer
  const availableAtSource = getAvailableStockAtLocation(selectedTransferProduct, transferForm.fromLocation);
  const transferQuantityNum = Number(transferForm.quantity) || 0;
  const isTransferQuantityInvalid = transferQuantityNum <= 0 || transferQuantityNum > availableAtSource;
  const isTransferLocationSame = transferForm.fromLocation === transferForm.toLocation;

  // Live Delta Computation for Adjustment
  const recordedQuantityAtAdjLocation = getAvailableStockAtLocation(selectedAdjustmentProduct, adjustmentForm.location);
  const countedQuantityNum = Number(adjustmentForm.countedQuantity);
  const computedDelta = isNaN(countedQuantityNum) ? 0 : (countedQuantityNum - recordedQuantityAtAdjLocation);

  // Submit Internal Transfer (Deliverable 1)
  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (isTransferQuantityInvalid || isTransferLocationSame) return;

    try {
      await api.createInternalTransfer({
        productSku: transferForm.productSku,
        fromLocation: transferForm.fromLocation,
        toLocation: transferForm.toLocation,
        quantity: transferQuantityNum,
        transferredBy: user ? user.name : 'Warehouse Staff',
        notes: transferForm.notes
      });
      setModalType(null);
      setTransferForm(prev => ({ ...prev, quantity: 10, notes: '' }));
      refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Submit Stock Adjustment (Deliverable 2)
  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createStockAdjustment({
        productSku: adjustmentForm.productSku,
        location: adjustmentForm.location,
        countedQuantity: countedQuantityNum,
        reason: adjustmentForm.reason,
        adjustedBy: user ? user.name : 'Inventory Manager',
        notes: adjustmentForm.notes
      });
      setModalType(null);
      refreshData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Run Spec Verification Scenario (Deliverable 4)
  const handleRunSpecScenario = async () => {
    setScenarioRunning(true);
    try {
      const result = await api.runVerificationScenario();
      setScenarioResult(result);
      refreshData();
    } catch (err) {
      alert("Error running scenario: " + err.message);
    } finally {
      setScenarioRunning(false);
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
      {/* Header */}
      <header>
        <div className="container header-inner">
          <div className="brand" onClick={() => !user && setActiveTab('dashboard')}>
            <div className="brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
                <path d="m3.3 7 8.7 5 8.7-5"></path>
                <path d="M12 22V12"></path>
              </svg>
            </div>
            <span>StockSense</span>
          </div>

          {/* Navigation Tabs for Operations */}
          {user && (
            <nav className="header-nav">
              <button className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
              <button className={`nav-tab-btn ${activeTab === 'transfers' ? 'active' : ''}`} onClick={() => setActiveTab('transfers')}>Internal Transfers</button>
              <button className={`nav-tab-btn ${activeTab === 'adjustments' ? 'active' : ''}`} onClick={() => setActiveTab('adjustments')}>Stock Adjustments</button>
              <button className={`nav-tab-btn ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => setActiveTab('ledger')}>Move History / Ledger</button>
              <button className={`nav-tab-btn ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Products</button>
              <button className={`nav-tab-btn ${activeTab === 'receipts' ? 'active' : ''}`} onClick={() => setActiveTab('receipts')}>Receipts</button>
              <button className={`nav-tab-btn ${activeTab === 'deliveries' ? 'active' : ''}`} onClick={() => setActiveTab('deliveries')}>Deliveries</button>
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

      {/* Main Content */}
      <main>
        {!user ? (
          /* ================= LANDING VIEW ================= */
          <div>
            <section className="hero">
              <div className="container hero-grid">
                <div>
                  <h1>Internal Transfers, Stock Adjustments &amp; Real-Time Move History.</h1>
                  <p className="hero-sub">
                    Relocate stock between racks, floors, and warehouses while keeping totals synchronized. Audit physical counts, compute deltas, and inspect the complete chronological stock ledger.
                  </p>

                  <div className="role-highlights">
                    <div>
                      <span className="role-title">Internal Transfers:</span> Move stock from Main Warehouse &rarr; Production Floor, Rack A &rarr; Rack B, or between facilities. Total stock is unchanged, location breakdowns update automatically.
                    </div>
                    <div>
                      <span className="role-title">Stock Adjustments:</span> Select product and location, enter counted quantity, see the calculated delta instantly, and log the reason with audit protection.
                    </div>
                    <div>
                      <span className="role-title">Stock Ledger:</span> Filterable, complete move history covering receipts, deliveries, transfers, and adjustments with before and after quantities.
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

                {/* Stock Snapshot */}
                <div className="summary-card">
                  <div className="summary-card-top">
                    <span>Warehouse Stock Snapshot</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--status-green)' }}>● Live Ledger</span>
                  </div>

                  <div className="summary-grid">
                    <div className="summary-item">
                      <div className="summary-label">Total Tracked Products</div>
                      <div className="summary-value">{kpis.totalProducts}</div>
                      <div className="summary-hint">Across all storage zones</div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-label">Low / Out of Stock</div>
                      <div className="summary-value" style={{ color: 'var(--status-red)' }}>{kpis.criticalStockTotal}</div>
                      <div className="summary-hint" style={{ color: 'var(--status-red)' }}>Needs replenishment</div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-label">Active Transfers</div>
                      <div className="summary-value" style={{ color: 'var(--status-green)' }}>{kpis.activeTransfers}</div>
                      <div className="summary-hint">Relocations between zones</div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-label">Audit Ledger Entries</div>
                      <div className="summary-value" style={{ color: 'var(--status-blue)' }}>{ledgerEntries.length}</div>
                      <div className="summary-hint">Verified movement logs</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Modules Overview */}
            <section className="modules-section">
              <div className="container">
                <div className="section-head">
                  <h2 className="section-title">Ownership &amp; Core Capabilities</h2>
                  <p className="section-sub">Relocation and correction of stock, plus the unified audit trail.</p>
                </div>

                <div className="module-cards-grid">
                  <div className="module-card">
                    <h3 className="module-heading">Internal Transfers</h3>
                    <p className="module-detail">Relocate items between Main Warehouse, Production Floor, and racks. Built-in validation prevents moving more than available at source.</p>
                  </div>
                  <div className="module-card">
                    <h3 className="module-heading">Stock Adjustments</h3>
                    <p className="module-detail">Select product and storage zone, enter verified count, preview calculated delta, and update inventory with audit reasons.</p>
                  </div>
                  <div className="module-card">
                    <h3 className="module-heading">Move History / Ledger</h3>
                    <p className="module-detail">Filterable chronological ledger tracking receipts, deliveries, transfers, and adjustments with before/after balances.</p>
                  </div>
                  <div className="module-card">
                    <h3 className="module-heading">Multi-Warehouse Support</h3>
                    <p className="module-detail">Underlying multi-location structure tracking stock per rack, aisle, and facility simultaneously.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* ================= CONSOLE VIEWS ================= */
          <div className="container app-view">

            {/* Deliverable 4 Spec Verification Banner */}
            <div className="scenario-banner">
              <div className="scenario-banner-text">
                <h3>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-amber)" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  Spec Verification: 100kg Steel Lifecycle
                </h3>
                <p>
                  Execute the spec test: <strong>100kg steel &rarr; transfer 50kg &rarr; deliver 20kg &rarr; damage 3kg</strong> and verify correct end-to-end ledger entries.
                </p>
              </div>
              <button
                className="btn btn-primary"
                onClick={handleRunSpecScenario}
                disabled={scenarioRunning}
              >
                {scenarioRunning ? "Executing Spec..." : "Run Spec Verification Test"}
              </button>
            </div>

            {/* Scenario Result Modal / Alert */}
            {scenarioResult && (
              <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--status-green)', borderRadius: '6px', padding: '16px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ color: 'var(--status-green)', fontSize: '0.95rem' }}>
                    ✓ Spec Scenario Verified Successfully!
                  </h4>
                  <button className="btn btn-secondary btn-sm" onClick={() => setScenarioResult(null)}>Dismiss</button>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '10px' }}>
                  {scenarioResult.message}. Final Total Quantity: <strong>{scenarioResult.finalStock.totalQuantity} kg</strong> (Expected: {scenarioResult.finalStock.expectedTotal} kg).
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {scenarioResult.finalStock.locations.map((loc, i) => (
                    <span key={i} className="location-pill">
                      {loc.location}: <strong>{loc.quantity} kg</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* ================= TAB 1: DASHBOARD ================= */}
            {activeTab === 'dashboard' && (
              <div>
                <div className="view-header">
                  <div className="view-title-group">
                    <h2>Warehouse Control Center</h2>
                    <p>Live inventory overview, location movements, and quick action shortcuts.</p>
                  </div>
                  <div className="view-controls">
                    <button className="btn btn-primary" onClick={() => setModalType('transfer')}>+ New Internal Transfer</button>
                    <button className="btn btn-secondary" onClick={() => setModalType('adjustment')}>+ Record Adjustment</button>
                  </div>
                </div>

                <div className="kpi-row">
                  <div className="kpi-tile">
                    <div className="kpi-tile-label">Total Products</div>
                    <div className="kpi-tile-value">{kpis.totalProducts}</div>
                  </div>
                  <div className="kpi-tile">
                    <div className="kpi-tile-label">Internal Transfers</div>
                    <div className="kpi-tile-value" style={{ color: 'var(--status-green)' }}>{transfers.length}</div>
                  </div>
                  <div className="kpi-tile">
                    <div className="kpi-tile-label">Stock Adjustments</div>
                    <div className="kpi-tile-value" style={{ color: 'var(--accent-amber)' }}>{adjustments.length}</div>
                  </div>
                  <div className="kpi-tile">
                    <div className="kpi-tile-label">Ledger Movements</div>
                    <div className="kpi-tile-value" style={{ color: 'var(--status-blue)' }}>{ledgerEntries.length}</div>
                  </div>
                  <div className="kpi-tile">
                    <div className="kpi-tile-label">Low / Out of Stock</div>
                    <div className="kpi-tile-value" style={{ color: 'var(--status-red)' }}>{kpis.criticalStockTotal}</div>
                  </div>
                </div>

                {/* Recent Ledger Preview */}
                <div style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--text-white)' }}>Recent Stock Movements</h3>
                    <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('ledger')}>View Full Ledger</button>
                  </div>

                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Timestamp</th>
                          <th>Ref #</th>
                          <th>Movement Type</th>
                          <th>Product</th>
                          <th>Route (From &rarr; To)</th>
                          <th>Movement Qty</th>
                          <th>Delta</th>
                          <th>Total After</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledgerEntries.slice(0, 5).map(entry => (
                          <tr key={entry.entryNumber}>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {new Date(entry.timestamp).toLocaleString()}
                            </td>
                            <td className="td-sku">{entry.referenceId || entry.entryNumber}</td>
                            <td>
                              <span className={`badge ${
                                entry.type === 'INTERNAL_TRANSFER' ? 'type-badge-transfer' :
                                entry.type === 'STOCK_ADJUSTMENT' ? 'type-badge-adjustment' :
                                entry.type === 'RECEIPT' ? 'type-badge-receipt' : 'type-badge-delivery'
                              }`}>
                                {entry.type}
                              </span>
                            </td>
                            <td style={{ fontWeight: 500, color: 'var(--text-white)' }}>{entry.productName}</td>
                            <td>{entry.sourceLocation} &rarr; {entry.destinationLocation}</td>
                            <td style={{ fontWeight: 600 }}>{entry.quantity}</td>
                            <td style={{ fontWeight: 700, color: entry.delta > 0 ? 'var(--status-green)' : entry.delta < 0 ? 'var(--status-red)' : 'var(--text-muted)' }}>
                              {entry.delta > 0 ? `+${entry.delta}` : entry.delta === 0 ? '0 (Relocated)' : entry.delta}
                            </td>
                            <td style={{ fontWeight: 600 }}>{entry.afterQuantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ================= TAB 2: INTERNAL TRANSFERS (Deliverable 1) ================= */}
            {activeTab === 'transfers' && (
              <div>
                <div className="view-header">
                  <div className="view-title-group">
                    <h2>Internal Transfers Between Locations</h2>
                    <p>Relocate stock across Main Warehouse, Production Floor, Rack A, Rack B, and Warehouse 2. Total stock remains unchanged while location breakdown updates.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => setModalType('transfer')}>+ New Internal Transfer</button>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Transfer #</th>
                        <th>Product SKU &amp; Name</th>
                        <th>Source Location</th>
                        <th>Destination Location</th>
                        <th>Quantity Moved</th>
                        <th>Total Stock Status</th>
                        <th>Logged By</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transfers.map(trf => (
                        <tr key={trf.id || trf.transferNumber}>
                          <td className="td-sku">{trf.transferNumber}</td>
                          <td style={{ fontWeight: 500, color: 'var(--text-white)' }}>
                            {trf.productName} <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>({trf.productSku})</span>
                          </td>
                          <td>{trf.fromLocation}</td>
                          <td style={{ color: 'var(--accent-amber)', fontWeight: 500 }}>&rarr; {trf.toLocation}</td>
                          <td style={{ fontWeight: 600 }}>{trf.quantity} units</td>
                          <td>
                            <span className="badge badge-normal">Total Stock Unchanged</span>
                          </td>
                          <td>{trf.transferredBy}</td>
                          <td>
                            <span className="badge type-badge-transfer">{trf.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ================= TAB 3: STOCK ADJUSTMENTS (Deliverable 2) ================= */}
            {activeTab === 'adjustments' && (
              <div>
                <div className="view-header">
                  <div className="view-title-group">
                    <h2>Stock Adjustments &amp; Count Reconciliations</h2>
                    <p>Select product and location, enter counted quantity, compute delta, auto-update stock, and maintain the audit reason.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => setModalType('adjustment')}>+ Record Stock Adjustment</button>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Adjustment #</th>
                        <th>Product SKU &amp; Name</th>
                        <th>Storage Location</th>
                        <th>Recorded Count</th>
                        <th>Verified Count</th>
                        <th>Computed Delta</th>
                        <th>Reason</th>
                        <th>Adjusted By</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adjustments.map(adj => (
                        <tr key={adj.id || adj.adjustmentNumber}>
                          <td className="td-sku">{adj.adjustmentNumber}</td>
                          <td style={{ fontWeight: 500, color: 'var(--text-white)' }}>
                            {adj.productName} <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>({adj.productSku})</span>
                          </td>
                          <td>{adj.location || 'Warehouse Floor'}</td>
                          <td>{adj.previousQuantity}</td>
                          <td style={{ fontWeight: 600, color: 'var(--text-white)' }}>{adj.newQuantity}</td>
                          <td style={{ fontWeight: 700, color: adj.difference >= 0 ? 'var(--status-green)' : 'var(--status-red)' }}>
                            {adj.difference >= 0 ? `+${adj.difference}` : adj.difference}
                          </td>
                          <td>
                            <span className="badge type-badge-adjustment">{adj.reason}</span>
                          </td>
                          <td>{adj.adjustedBy}</td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {new Date(adj.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ================= TAB 4: MOVE HISTORY / STOCK LEDGER (Deliverable 3) ================= */}
            {activeTab === 'ledger' && (
              <div>
                <div className="view-header">
                  <div className="view-title-group">
                    <h2>Move History &amp; Stock Ledger</h2>
                    <p>Filterable, chronological audit trail covering receipts, deliveries, internal transfers, and adjustments with before/after balances.</p>
                  </div>
                  <button className="btn btn-secondary" onClick={() => setLedgerFilters({ product: '', location: '', type: 'ALL', date_from: '', date_to: '' })}>
                    Reset Filters
                  </button>
                </div>

                {/* Filterable Bar: GET /stock-ledger?product=&location=&date_from=&date_to= */}
                <div className="ledger-filter-grid">
                  <div className="ledger-filter-item">
                    <label>Filter by Product</label>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="SKU or product name..."
                      value={ledgerFilters.product}
                      onChange={(e) => setLedgerFilters({ ...ledgerFilters, product: e.target.value })}
                    />
                  </div>

                  <div className="ledger-filter-item">
                    <label>Filter by Location</label>
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Rack A, Production Floor..."
                      value={ledgerFilters.location}
                      onChange={(e) => setLedgerFilters({ ...ledgerFilters, location: e.target.value })}
                    />
                  </div>

                  <div className="ledger-filter-item">
                    <label>Movement Type</label>
                    <select
                      className="search-input"
                      value={ledgerFilters.type}
                      onChange={(e) => setLedgerFilters({ ...ledgerFilters, type: e.target.value })}
                    >
                      <option value="ALL">All Types</option>
                      <option value="INTERNAL_TRANSFER">Internal Transfers</option>
                      <option value="STOCK_ADJUSTMENT">Stock Adjustments</option>
                      <option value="RECEIPT">Receipts (Incoming)</option>
                      <option value="DELIVERY">Deliveries (Outgoing)</option>
                    </select>
                  </div>

                  <div className="ledger-filter-item">
                    <label>Date From</label>
                    <input
                      type="date"
                      className="search-input"
                      value={ledgerFilters.date_from}
                      onChange={(e) => setLedgerFilters({ ...ledgerFilters, date_from: e.target.value })}
                    />
                  </div>

                  <div className="ledger-filter-item">
                    <label>Date To</label>
                    <input
                      type="date"
                      className="search-input"
                      value={ledgerFilters.date_to}
                      onChange={(e) => setLedgerFilters({ ...ledgerFilters, date_to: e.target.value })}
                    />
                  </div>
                </div>

                {/* Chronological Table */}
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Date &amp; Time</th>
                        <th>Reference #</th>
                        <th>Movement Type</th>
                        <th>Product SKU &amp; Name</th>
                        <th>Route / Location</th>
                        <th>Move Qty</th>
                        <th>Before &rarr; After</th>
                        <th>Net Delta</th>
                        <th>Audit Reason &amp; Notes</th>
                        <th>Performed By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ledgerEntries.length === 0 ? (
                        <tr>
                          <td colSpan="10" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                            No ledger entries found matching the filter criteria.
                          </td>
                        </tr>
                      ) : (
                        ledgerEntries.map(entry => (
                          <tr key={entry.entryNumber}>
                            <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {new Date(entry.timestamp).toLocaleString()}
                            </td>
                            <td className="td-sku">{entry.referenceId || entry.entryNumber}</td>
                            <td>
                              <span className={`badge ${
                                entry.type === 'INTERNAL_TRANSFER' ? 'type-badge-transfer' :
                                entry.type === 'STOCK_ADJUSTMENT' ? 'type-badge-adjustment' :
                                entry.type === 'RECEIPT' ? 'type-badge-receipt' : 'type-badge-delivery'
                              }`}>
                                {entry.type}
                              </span>
                            </td>
                            <td style={{ fontWeight: 500, color: 'var(--text-white)' }}>
                              {entry.productName} <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>({entry.productSku})</span>
                            </td>
                            <td>
                              {entry.sourceLocation} &rarr; {entry.destinationLocation}
                            </td>
                            <td style={{ fontWeight: 600 }}>{entry.quantity}</td>
                            <td>
                              {entry.beforeQuantity} &rarr; <strong style={{ color: 'var(--text-white)' }}>{entry.afterQuantity}</strong>
                            </td>
                            <td style={{ fontWeight: 700, color: entry.delta > 0 ? 'var(--status-green)' : entry.delta < 0 ? 'var(--status-red)' : 'var(--text-muted)' }}>
                              {entry.delta > 0 ? `+${entry.delta}` : entry.delta === 0 ? '0 (Transfer)' : entry.delta}
                            </td>
                            <td style={{ fontSize: '0.82rem', maxWidth: '220px', whiteSpace: 'normal' }}>
                              {entry.reason}
                              {entry.notes && <div style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>{entry.notes}</div>}
                            </td>
                            <td style={{ fontSize: '0.8rem' }}>{entry.performedBy}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ================= TAB 5: PRODUCTS (Multi-Warehouse Breakdown) ================= */}
            {activeTab === 'products' && (
              <div>
                <div className="view-header">
                  <div className="view-title-group">
                    <h2>Product Catalog &amp; Multi-Warehouse Breakdown</h2>
                    <p>Track inventory across Main Warehouse, Rack A, Rack B, Production Floor, and Warehouse 2.</p>
                  </div>
                  <div className="view-controls">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                    />
                    <select
                      className="search-input"
                      value={productFilter}
                      onChange={(e) => setProductFilter(e.target.value)}
                    >
                      <option value="all">All Products</option>
                      <option value="low">Low Stock</option>
                      <option value="out">Out of Stock</option>
                    </select>
                    <button className="btn btn-primary" onClick={() => setModalType('product')}>+ Add Product</button>
                  </div>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Total Stock</th>
                        <th>Locations Breakdown</th>
                        <th>Min Threshold</th>
                        <th>Unit Price</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(prod => (
                        <tr key={prod.sku}>
                          <td className="td-sku">{prod.sku}</td>
                          <td style={{ fontWeight: 500, color: 'var(--text-white)' }}>{prod.name}</td>
                          <td>{prod.category}</td>
                          <td style={{ fontWeight: 700, color: prod.quantity === 0 ? 'var(--status-red)' : prod.quantity <= prod.minThreshold ? 'var(--accent-amber)' : 'var(--text-white)' }}>
                            {prod.quantity} {prod.unit || 'units'}
                          </td>
                          <td style={{ maxWidth: '300px', whiteSpace: 'normal' }}>
                            {prod.locations && prod.locations.map((loc, idx) => (
                              <span key={idx} className="location-pill">
                                {loc.location}: <strong>{loc.quantity}</strong>
                              </span>
                            ))}
                          </td>
                          <td>{prod.minThreshold} {prod.unit}</td>
                          <td>${Number(prod.price).toFixed(2)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setTransferForm(prev => ({
                                    ...prev,
                                    productSku: prod.sku,
                                    fromLocation: prod.locations && prod.locations[0] ? prod.locations[0].location : 'Main Warehouse - Rack A'
                                  }));
                                  setModalType('transfer');
                                }}
                              >
                                Transfer
                              </button>
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={() => {
                                  setAdjustmentForm(prev => ({
                                    ...prev,
                                    productSku: prod.sku,
                                    location: prod.locations && prod.locations[0] ? prod.locations[0].location : 'Main Warehouse - Rack A',
                                    countedQuantity: prod.locations && prod.locations[0] ? prod.locations[0].quantity : prod.quantity
                                  }));
                                  setModalType('adjustment');
                                }}
                              >
                                Adjust
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ================= TAB 6: RECEIPTS ================= */}
            {activeTab === 'receipts' && (
              <div>
                <div className="view-header">
                  <div className="view-title-group">
                    <h2>Incoming Receipts</h2>
                    <p>Dock intake and supplier deliveries.</p>
                  </div>
                  <button className="btn btn-primary" onClick={() => setModalType('receipt')}>+ Log Inbound Receipt</button>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Receipt #</th>
                        <th>Supplier</th>
                        <th>Intake Location</th>
                        <th>Items</th>
                        <th>Status</th>
                        <th>Actions</th>
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
                            {rec.status !== 'Completed' ? (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={async () => {
                                  await api.updateReceiptStatus(rec.receiptNumber, 'Completed');
                                  refreshData();
                                }}
                              >
                                Complete Intake
                              </button>
                            ) : (
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Received &amp; Stocked</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ================= TAB 7: DELIVERIES ================= */}
            {activeTab === 'deliveries' && (
              <div>
                <div className="view-header">
                  <div className="view-title-group">
                    <h2>Delivery Orders</h2>
                    <p>Outgoing orders to customers, stores, and regional hubs.</p>
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
                        <th>Items</th>
                        <th>Status</th>
                        <th>Actions</th>
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
                            <span className={`badge ${del.status === 'Dispatched' ? 'badge-normal' : 'badge-low'}`}>
                              {del.status}
                            </span>
                          </td>
                          <td>
                            {del.status !== 'Dispatched' ? (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={async () => {
                                  await api.updateDeliveryStatus(del.deliveryNumber, 'Dispatched');
                                  refreshData();
                                }}
                              >
                                Dispatch Order
                              </button>
                            ) : (
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

          </div>
        )}
      </main>

      {/* Footer */}
      <footer>
        <div className="container footer-inner">
          <div>
            <strong>StockSense</strong> &mdash; Inventory Management System (IMS)
          </div>
          <div>
            Internal Transfers, Stock Adjustments &amp; Move History
          </div>
        </div>
      </footer>

      {/* ================= MODALS ================= */}

      {/* 1. DELIVERABLE 1: TRANSFER FORM + VALIDATION MODAL */}
      {modalType === 'transfer' && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setModalType(null)}>
          <div className="modal-box">
            <div className="modal-head">
              <h3>Internal Stock Transfer</h3>
              <button className="close-btn" onClick={() => setModalType(null)}>&times;</button>
            </div>

            <form onSubmit={handleTransferSubmit}>
              {/* Product Select */}
              <div className="form-row">
                <label>Select Product</label>
                <select
                  value={transferForm.productSku}
                  onChange={(e) => {
                    const sel = products.find(p => p.sku === e.target.value);
                    const defaultLoc = sel && sel.locations && sel.locations[0] ? sel.locations[0].location : 'Main Warehouse - Rack A';
                    setTransferForm({
                      ...transferForm,
                      productSku: e.target.value,
                      fromLocation: defaultLoc
                    });
                  }}
                >
                  {products.map(p => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku}) &mdash; Total Stock: {p.quantity} {p.unit || 'units'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Source & Destination Locations */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-row">
                  <label>From Location (Source)</label>
                  <select
                    value={transferForm.fromLocation}
                    onChange={(e) => setTransferForm({ ...transferForm, fromLocation: e.target.value })}
                  >
                    {selectedTransferProduct && selectedTransferProduct.locations ? (
                      selectedTransferProduct.locations.map((loc, idx) => (
                        <option key={idx} value={loc.location}>
                          {loc.location} ({loc.quantity} {selectedTransferProduct.unit || 'units'})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="Main Warehouse - Rack A">Main Warehouse - Rack A</option>
                        <option value="Production Floor">Production Floor</option>
                        <option value="Rack B">Rack B</option>
                        <option value="Warehouse 2">Warehouse 2</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="form-row">
                  <label>To Location (Destination)</label>
                  <select
                    value={transferForm.toLocation}
                    onChange={(e) => setTransferForm({ ...transferForm, toLocation: e.target.value })}
                  >
                    <option value="Production Floor">Production Floor</option>
                    <option value="Main Warehouse - Rack A">Main Warehouse - Rack A</option>
                    <option value="Rack B">Rack B</option>
                    <option value="Warehouse 2">Warehouse 2</option>
                    <option value="Assembly Cell 1">Assembly Cell 1</option>
                  </select>
                </div>
              </div>

              {/* Quantity Input */}
              <div className="form-row">
                <label>Transfer Quantity ({selectedTransferProduct ? selectedTransferProduct.unit || 'units' : 'units'})</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={transferForm.quantity}
                  onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                />
              </div>

              {/* LIVE VALIDATION FEEDBACK (Deliverable 1 Requirement) */}
              <div style={{ margin: '10px 0' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Available at Source ({transferForm.fromLocation}): <strong>{availableAtSource} {selectedTransferProduct ? selectedTransferProduct.unit || 'units' : 'units'}</strong>
                </div>

                {isTransferLocationSame && (
                  <div className="validation-box validation-error">
                    ⚠ Source and destination locations cannot be identical.
                  </div>
                )}

                {transferQuantityNum > availableAtSource && (
                  <div className="validation-box validation-error">
                    ⚠ Validation Error: Cannot transfer {transferQuantityNum} units. Only {availableAtSource} available at {transferForm.fromLocation}.
                  </div>
                )}

                {!isTransferLocationSame && transferQuantityNum > 0 && transferQuantityNum <= availableAtSource && (
                  <div className="validation-box validation-ok">
                    ✓ Validation Passed: Source has sufficient stock. Total stock will remain unchanged.
                  </div>
                )}
              </div>

              <div className="form-row">
                <label>Transfer Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Relocated to production line assembly"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isTransferQuantityInvalid || isTransferLocationSame}
                >
                  Execute Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. DELIVERABLE 2: ADJUSTMENT FORM WITH COMPUTED DELTA */}
      {modalType === 'adjustment' && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setModalType(null)}>
          <div className="modal-box">
            <div className="modal-head">
              <h3>Stock Count Adjustment</h3>
              <button className="close-btn" onClick={() => setModalType(null)}>&times;</button>
            </div>

            <form onSubmit={handleAdjustmentSubmit}>
              {/* Product Select */}
              <div className="form-row">
                <label>Select Product</label>
                <select
                  value={adjustmentForm.productSku}
                  onChange={(e) => {
                    const sel = products.find(p => p.sku === e.target.value);
                    const defaultLoc = sel && sel.locations && sel.locations[0] ? sel.locations[0].location : 'Main Warehouse - Rack A';
                    const defaultQty = sel && sel.locations && sel.locations[0] ? sel.locations[0].quantity : (sel ? sel.quantity : 0);
                    setAdjustmentForm({
                      ...adjustmentForm,
                      productSku: e.target.value,
                      location: defaultLoc,
                      countedQuantity: defaultQty
                    });
                  }}
                >
                  {products.map(p => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Select */}
              <div className="form-row">
                <label>Storage Location to Reconcile</label>
                <select
                  value={adjustmentForm.location}
                  onChange={(e) => {
                    const locName = e.target.value;
                    const recordedQty = getAvailableStockAtLocation(selectedAdjustmentProduct, locName);
                    setAdjustmentForm({
                      ...adjustmentForm,
                      location: locName,
                      countedQuantity: recordedQty
                    });
                  }}
                >
                  {selectedAdjustmentProduct && selectedAdjustmentProduct.locations ? (
                    selectedAdjustmentProduct.locations.map((loc, idx) => (
                      <option key={idx} value={loc.location}>
                        {loc.location} (Currently recorded: {loc.quantity} {selectedAdjustmentProduct.unit || 'units'})
                      </option>
                    ))
                  ) : (
                    <option value="Main Warehouse - Rack A">Main Warehouse - Rack A</option>
                  )}
                </select>
              </div>

              {/* Physical Count Input */}
              <div className="form-row">
                <label>Newly Counted Physical Quantity</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustmentForm.countedQuantity}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, countedQuantity: e.target.value })}
                />
              </div>

              {/* LIVE DELTA COMPUTATION DISPLAY (Deliverable 2 Requirement) */}
              <div className="delta-preview-box">
                <div className="delta-col">
                  <span className="delta-col-title">Recorded Count</span>
                  <span className="delta-col-num">{recordedQuantityAtAdjLocation}</span>
                </div>
                <div className="delta-col">
                  <span className="delta-col-title">Counted Quantity</span>
                  <span className="delta-col-num">{countedQuantityNum || 0}</span>
                </div>
                <div className="delta-col">
                  <span className="delta-col-title">Computed Delta</span>
                  <span
                    className="delta-col-num"
                    style={{ color: computedDelta > 0 ? 'var(--status-green)' : computedDelta < 0 ? 'var(--status-red)' : 'var(--text-muted)' }}
                  >
                    {computedDelta > 0 ? `+${computedDelta}` : computedDelta}
                  </span>
                </div>
              </div>

              {/* Reason Dropdown */}
              <div className="form-row">
                <label>Reason for Adjustment</label>
                <select
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                >
                  <option value="Physical Cycle Count">Physical Cycle Count</option>
                  <option value="Damaged Stock">Damaged Stock</option>
                  <option value="Supplier Shortage">Supplier Shortage</option>
                  <option value="Customer Return">Customer Return</option>
                  <option value="Shelf Loss">Shelf Loss</option>
                </select>
              </div>

              <div className="form-row">
                <label>Audit Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Audit verified by inventory inspector"
                  value={adjustmentForm.notes}
                  onChange={(e) => setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })}
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  Confirm &amp; Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Auth Modal */}
      {authModalOpen && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setAuthModalOpen(false)}>
          <div className="modal-box">
            <div className="modal-head">
              <h3>{authMode === 'login' ? 'Log In to StockSense' : 'Create Warehouse Account'}</h3>
              <button className="close-btn" onClick={() => setAuthModalOpen(false)}>&times;</button>
            </div>

            <form onSubmit={handleAuthSubmit}>
              <div className="form-row">
                <label>Operational Role</label>
                <select value={authRole} onChange={(e) => setAuthRole(e.target.value)}>
                  <option value="Inventory Manager">Inventory Manager (Audit &amp; Oversight)</option>
                  <option value="Warehouse Staff">Warehouse Staff (Floor &amp; Transfers)</option>
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
                Enter Warehouse Console
              </button>
            </form>

            <div style={{ marginTop: '18px', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textAlign: 'center' }}>
                Quick Demo Sign-In:
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

      {/* 4. Add Product Modal */}
      {modalType === 'product' && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setModalType(null)}>
          <div className="modal-box">
            <div className="modal-head">
              <h3>Add New Product</h3>
              <button className="close-btn" onClick={() => setModalType(null)}>&times;</button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              await api.createProduct(newProduct);
              setModalType(null);
              refreshData();
            }}>
              <div className="form-row">
                <label>Product SKU</label>
                <input
                  type="text"
                  placeholder="e.g. PRD-STEEL-200"
                  required
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                />
              </div>

              <div className="form-row">
                <label>Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Structural Steel Angles"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                />
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
                  <label>Unit (kg, pcs, rolls)</label>
                  <input
                    type="text"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <label>Primary Location</label>
                <input
                  type="text"
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

      {/* 5. Inbound Receipt Modal */}
      {modalType === 'receipt' && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setModalType(null)}>
          <div className="modal-box">
            <div className="modal-head">
              <h3>Log Inbound Supplier Receipt</h3>
              <button className="close-btn" onClick={() => setModalType(null)}>&times;</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const supplier = e.target.supplier.value;
              const sku = e.target.sku.value;
              const qty = Number(e.target.quantity.value);
              const prod = products.find(p => p.sku === sku);
              await api.createReceipt({
                supplier,
                destinationLocation: 'Main Warehouse - Rack A',
                items: [{ productSku: sku, productName: prod ? prod.name : sku, quantityExpected: qty }]
              });
              setModalType(null);
              refreshData();
            }}>
              <div className="form-row">
                <label>Supplier Name</label>
                <input name="supplier" type="text" required placeholder="e.g. National Steel Foundries" />
              </div>
              <div className="form-row">
                <label>Product</label>
                <select name="sku">
                  {products.map(p => (
                    <option key={p.sku} value={p.sku}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Quantity Expected</label>
                <input name="quantity" type="number" min="1" defaultValue="50" required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Outbound Delivery Modal */}
      {modalType === 'delivery' && (
        <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && setModalType(null)}>
          <div className="modal-box">
            <div className="modal-head">
              <h3>Create Delivery Order</h3>
              <button className="close-btn" onClick={() => setModalType(null)}>&times;</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const destination = e.target.destination.value;
              const sku = e.target.sku.value;
              const qty = Number(e.target.quantity.value);
              const prod = products.find(p => p.sku === sku);
              await api.createDelivery({
                destination,
                carrier: 'Express Freight Line',
                items: [{ productSku: sku, productName: prod ? prod.name : sku, quantity: qty }]
              });
              setModalType(null);
              refreshData();
            }}>
              <div className="form-row">
                <label>Destination (Customer / Regional Hub)</label>
                <input name="destination" type="text" required placeholder="e.g. West Coast Assembly Hub" />
              </div>
              <div className="form-row">
                <label>Product</label>
                <select name="sku">
                  {products.map(p => (
                    <option key={p.sku} value={p.sku}>{p.name} (Stock: {p.quantity})</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <label>Quantity to Dispatch</label>
                <input name="quantity" type="number" min="1" defaultValue="20" required />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
