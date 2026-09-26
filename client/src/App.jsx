import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsOverview from './components/StatsOverview';
import FilterBar from './components/FilterBar';
import ProductList from './components/ProductList';
import ProductFormModal from './components/ProductFormModal';
import ProductDetailModal from './components/ProductDetailModal';
import StockAdjustmentModal from './components/StockAdjustmentModal';
import CategoryManagementModal from './components/CategoryManagementModal';
import { api } from './api';

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uoms, setUoms] = useState([]);
  const [locations, setLocations] = useState([]);
  const [stats, setStats] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');

  // Modals State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [selectedDetailId, setSelectedDetailId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [adjustingProduct, setAdjustingProduct] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

  // Load Lookups (Categories, UoMs, Locations)
  const loadLookups = useCallback(async () => {
    try {
      const [catsRes, uomsRes, locsRes] = await Promise.all([
        api.getCategories(),
        api.getUoms(),
        api.getLocations()
      ]);
      setCategories(catsRes.data || []);
      setUoms(uomsRes.data || []);
      setLocations(locsRes.data || []);
    } catch (err) {
      console.error('Failed to load lookups:', err);
    }
  }, []);

  // Load KPI Stats
  const loadStats = useCallback(async () => {
    try {
      const statsRes = await api.getStats();
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, []);

  // Fetch Products based on current filters
  const loadProducts = useCallback(async () => {
    try {
      const res = await api.getProducts({
        category: selectedCategory,
        status: statusFilter,
        search: searchTerm,
        sortBy,
        sortOrder
      });
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCategory, statusFilter, searchTerm, sortBy, sortOrder]);

  // Initial Load
  useEffect(() => {
    loadLookups();
    loadStats();
    loadProducts();
  }, [loadLookups, loadStats, loadProducts]);

  // Refresh handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([loadStats(), loadLookups(), loadProducts()]);
  };

  // Toggle sort order
  const handleToggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
  };

  // Handle Create or Update Product submission
  const handleProductSubmit = async (formData, isEditing) => {
    if (isEditing && editingProduct) {
      await api.updateProduct(editingProduct.id, formData);
    } else {
      await api.createProduct(formData);
    }
    await Promise.all([loadProducts(), loadStats()]);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  // Open Product Detail Modal
  const handleOpenDetail = (productId) => {
    setSelectedDetailId(productId);
    setIsDetailModalOpen(true);
  };

  // Open Stock Adjust Modal
  const handleOpenAdjustStock = (product) => {
    setAdjustingProduct(product);
    setIsAdjustModalOpen(true);
  };

  return (
    <div className="app-container">
      {/* App Header */}
      <Header
        onOpenCreate={handleOpenCreate}
        onOpenCategories={() => setIsCategoriesModalOpen(true)}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* KPI Stats Overview Cards */}
      <StatsOverview
        stats={stats}
        currentStatusFilter={statusFilter}
        onStatusFilterChange={(status) => setStatusFilter(status)}
      />

      {/* SKU Search & Smart Filter Bar */}
      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOrder={sortOrder}
        onToggleSortOrder={handleToggleSortOrder}
      />

      {/* Product Catalog Table */}
      <ProductList
        products={products}
        isLoading={isLoading}
        onViewDetail={handleOpenDetail}
        onEditProduct={handleOpenEdit}
        onAdjustStock={handleOpenAdjustStock}
      />

      {/* Product Create / Edit Modal with Validation */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleProductSubmit}
        initialData={editingProduct}
        categories={categories}
        uoms={uoms}
        locations={locations}
      />

      {/* Product Detail Modal (Stock per location & moves) */}
      <ProductDetailModal
        productId={selectedDetailId}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailId(null);
        }}
        onOpenAdjustStock={(prod) => {
          setIsDetailModalOpen(false);
          handleOpenAdjustStock(prod);
        }}
      />

      {/* Instant Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => {
          setIsAdjustModalOpen(false);
          setAdjustingProduct(null);
        }}
        product={adjustingProduct}
        locations={locations}
        onAdjustmentComplete={async () => {
          await Promise.all([loadProducts(), loadStats()]);
        }}
      />

      {/* Categories Management Modal */}
      <CategoryManagementModal
        isOpen={isCategoriesModalOpen}
        onClose={() => setIsCategoriesModalOpen(false)}
        categories={categories}
        onCategoryCreatedOrDeleted={async () => {
          await loadLookups();
          await loadStats();
        }}
      />
    </div>
  );
}
