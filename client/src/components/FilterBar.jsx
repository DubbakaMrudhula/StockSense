import React from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

export default function FilterBar({
  searchTerm,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onToggleSortOrder
}) {
  return (
    <div className="filter-bar">
      {/* Search Input */}
      <div className="search-group">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search by SKU, Product Name, or Barcode..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          id="input-sku-search"
        />
      </div>

      <div className="filters-wrapper">
        {/* Category Filter */}
        <select
          className="select-filter"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          id="select-category-filter"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.parent_name ? `${cat.parent_name} > ${cat.name}` : cat.name}
            </option>
          ))}
        </select>

        {/* Status Filter Tabs */}
        <div className="status-tabs" role="tablist">
          <button
            className={`status-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => onStatusChange('all')}
            id="tab-status-all"
          >
            All
          </button>
          <button
            className={`status-tab ${statusFilter === 'in_stock' ? 'active' : ''}`}
            onClick={() => onStatusChange('in_stock')}
            id="tab-status-in-stock"
          >
            In Stock
          </button>
          <button
            className={`status-tab ${statusFilter === 'low_stock' ? 'active' : ''}`}
            onClick={() => onStatusChange('low_stock')}
            id="tab-status-low-stock"
          >
            Low Stock
          </button>
          <button
            className={`status-tab ${statusFilter === 'out_of_stock' ? 'active' : ''}`}
            onClick={() => onStatusChange('out_of_stock')}
            id="tab-status-out-stock"
          >
            Out of Stock
          </button>
        </div>

        {/* Sorting Dropdown */}
        <select
          className="select-filter"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          id="select-sort-by"
        >
          <option value="name">Sort by Name</option>
          <option value="sku">Sort by SKU</option>
          <option value="total_quantity">Sort by Stock On Hand</option>
          <option value="sale_price">Sort by Sale Price</option>
        </select>

        {/* Sort Order Toggle */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onToggleSortOrder}
          title={`Order: ${sortOrder === 'ASC' ? 'Ascending' : 'Descending'}`}
          id="btn-sort-order"
        >
          <ArrowUpDown size={14} />
          <span>{sortOrder}</span>
        </button>
      </div>
    </div>
  );
}
