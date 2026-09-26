const BASE_URL = '';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || data.error || 'API Request failed');
    error.status = response.status;
    error.errors = data.errors || {};
    throw error;
  }

  return data;
}

export const api = {
  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.status && params.status !== 'all') query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.sortOrder) query.set('sortOrder', params.sortOrder);
    const qs = query.toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },

  searchProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products/search?${query}`);
  },

  getProductById: (id) => request(`/products/${id}`),

  createProduct: (productData) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    }),

  updateProduct: (id, productData) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData)
    }),

  getProductStock: (id) => request(`/products/${id}/stock`),

  adjustStock: (id, adjustmentData) =>
    request(`/products/${id}/stock/adjust`, {
      method: 'POST',
      body: JSON.stringify(adjustmentData)
    }),

  // Categories
  getCategories: () => request('/categories'),

  createCategory: (catData) =>
    request('/categories', {
      method: 'POST',
      body: JSON.stringify(catData)
    }),

  updateCategory: (id, catData) =>
    request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(catData)
    }),

  deleteCategory: (id) =>
    request(`/categories/${id}`, {
      method: 'DELETE'
    }),

  // Lookups & Stats
  getUoms: () => request('/uoms'),
  getLocations: () => request('/locations'),
  getStats: () => request('/stats')
};

export default api;
