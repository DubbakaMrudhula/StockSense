import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AuthModal from './components/AuthModal';
import DashboardView from './components/DashboardView';
import WarehousesView from './components/WarehousesView';
import ProfileModal from './components/ProfileModal';
import TeamPlanModal from './components/TeamPlanModal';
import ProductsView from './components/ProductsView';
import OperationsView from './components/OperationsView';
import StockLedgerView from './components/StockLedgerView';

export default function App() {
  // Session & User State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('stocksense_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('stocksense_token') || '');

  // UI Theme & Nav State
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeWarehouse, setActiveWarehouse] = useState('all');

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showTeamPlanModal, setShowTeamPlanModal] = useState(false);

  // Metadata Data
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [kpisData, setKpisData] = useState(null);

  // Dynamic Dashboard Filters State
  const [filters, setFilters] = useState({
    doc_type: 'all',
    status: 'all',
    warehouse_id: 'all',
    category_id: 'all'
  });

  // Handle Theme Toggle
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
  };

  // Fetch Metadata (Categories & Warehouses)
  const fetchMetadata = async () => {
    try {
      const res = await fetch('/api/meta');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
        setWarehouses(data.warehouses || []);
      }
    } catch (err) {
      console.error('Failed to fetch metadata:', err);
    }
  };

  // Fetch Dashboard KPIs dynamically matching active filters
  const fetchDashboardKPIs = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filters.doc_type !== 'all') params.append('doc_type', filters.doc_type);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.warehouse_id !== 'all') params.append('warehouse_id', filters.warehouse_id);
      if (filters.category_id !== 'all') params.append('category_id', filters.category_id);

      const res = await fetch(`/api/dashboard/kpis?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setKpisData(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch KPIs:', err);
    }
  }, [filters]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchDashboardKPIs();
  }, [fetchDashboardKPIs]);

  // Auth Handlers
  const handleLoginSuccess = (userData, tokenStr) => {
    setUser(userData);
    setToken(tokenStr);
    localStorage.setItem('stocksense_user', JSON.stringify(userData));
    localStorage.setItem('stocksense_token', tokenStr);
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('stocksense_user');
    localStorage.removeItem('stocksense_token');
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleResetFilters = () => {
    setFilters({
      doc_type: 'all',
      status: 'all',
      warehouse_id: 'all',
      category_id: 'all'
    });
    setActiveWarehouse('all');
  };

  const handleWarehouseDropdownChange = (whId) => {
    setActiveWarehouse(whId);
    handleFilterChange('warehouse_id', whId);
  };

  // Quick Reorder action trigger for low stock table
  const handleReorderModal = async (product) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sku: `${product.sku}-REORDER-${Date.now().toString().slice(-3)}`,
          name: `${product.name} (Restock)`,
          category_id: categories[0]?.id || 'cat_1',
          uom_id: 'uom_1',
          min_stock_threshold: product.threshold,
          reorder_qty: product.reorderQty,
          price: 15.00,
          initial_qty: product.reorderQty,
          warehouse_id: filters.warehouse_id !== 'all' ? filters.warehouse_id : 'wh_1'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`Reorder purchase order created! Added +${product.reorderQty} units to inventory.`);
        fetchDashboardKPIs();
        fetchMetadata();
      }
    } catch (err) {
      alert('Failed to restock: ' + err.message);
    }
  };

  if (!user || !token) {
    return (
      <AuthModal 
        onLoginSuccess={handleLoginSuccess}
        warehouses={warehouses}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white">
      
      {/* Top Navigation */}
      <Navbar 
        user={user}
        warehouses={warehouses}
        activeWarehouse={filters.warehouse_id}
        onSelectWarehouse={handleWarehouseDropdownChange}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onOpenProfile={() => setShowProfileModal(true)}
        onLogout={handleLogout}
        onOpenTeamPlan={() => setShowTeamPlanModal(true)}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Left Sidebar */}
        <Sidebar 
          activeTab={activeTab === 'team-plan' ? 'team-plan' : activeTab}
          setActiveTab={(tab) => {
            if (tab === 'team-plan') {
              setShowTeamPlanModal(true);
            } else {
              setActiveTab(tab);
            }
          }}
        />

        {/* View Router Workspace */}
        <main className="flex-1 p-4 lg:p-8 space-y-6 overflow-x-hidden">
          
          {activeTab === 'dashboard' && (
            <DashboardView 
              kpisData={kpisData}
              categories={categories}
              warehouses={warehouses}
              filters={filters}
              onFilterChange={handleFilterChange}
              onResetFilters={handleResetFilters}
              onOpenReorderModal={handleReorderModal}
            />
          )}

          {activeTab === 'warehouses' && (
            <WarehousesView 
              warehouses={warehouses}
              onRefreshWarehouses={fetchMetadata}
              token={token}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView 
              categories={categories}
              warehouses={warehouses}
              token={token}
            />
          )}

          {activeTab === 'operations' && (
            <OperationsView warehouses={warehouses} />
          )}

          {activeTab === 'ledger' && (
            <StockLedgerView ledgerTimeline={kpisData?.ledgerTimeline || []} />
          )}

        </main>
      </div>

      {/* Modals */}
      {showProfileModal && (
        <ProfileModal 
          user={user}
          warehouses={warehouses}
          token={token}
          onClose={() => setShowProfileModal(false)}
          onUpdateUser={(updated) => {
            setUser(updated);
            localStorage.setItem('stocksense_user', JSON.stringify(updated));
          }}
        />
      )}

      {showTeamPlanModal && (
        <TeamPlanModal onClose={() => setShowTeamPlanModal(false)} />
      )}

    </div>
  );
}
