import api from './axios';

// The server has NO `/admin/*` CRUD routes. Admin work lives on the
// resource routers (server/routes/*.js) behind the admin role gate:
//   Products   → /products   (POST/PUT/DELETE need admin)
//   Categories → /categories (POST/PUT/DELETE need admin)
//   Orders     → /orders     (GET list + PATCH /:id/status need admin)
//   Customers  → /users      (GET + PATCH /:id/toggle-active need admin)
//   Coupons    → /coupons    (GET/POST/PUT/DELETE need admin)
//   Dashboard + charts only → /admin/dashboard, /admin/sales-chart,
//     /admin/orders-chart, /admin/best-sellers, /admin/revenue-by-category
// Accepts FormData (sent as-is) or a plain object (sent as JSON).
const sendAsIs = (data) => data;

export const adminApi = {
  // Dashboard + charts
  getDashboardStats: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },
  getSalesChart: async () => {
    const res = await api.get('/admin/sales-chart');
    return res.data;
  },
  getOrdersChart: async () => {
    const res = await api.get('/admin/orders-chart');
    return res.data;
  },
  getBestSellers: async () => {
    const res = await api.get('/admin/best-sellers');
    return res.data;
  },
  getRevenueByCategory: async () => {
    const res = await api.get('/admin/revenue-by-category');
    return res.data;
  },

  // Products
  getProducts: async (params) => {
    const res = await api.get('/products', { params });
    return res.data;
  },
  createProduct: async (data) => {
    const res = await api.post('/products', sendAsIs(data));
    return res.data;
  },
  updateProduct: async (id, data) => {
    const res = await api.put(`/products/${id}`, sendAsIs(data));
    return res.data;
  },
  deleteProduct: async (id) => {
    const res = await api.delete(`/products/${id}`);
    return res.data;
  },

  // Categories
  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data;
  },
  createCategory: async (data) => {
    const res = await api.post('/categories', sendAsIs(data));
    return res.data;
  },
  updateCategory: async (id, data) => {
    const res = await api.put(`/categories/${id}`, sendAsIs(data));
    return res.data;
  },
  deleteCategory: async (id) => {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  },

  // Orders — server list accepts status, customer, paymentMethod,
  // startDate, endDate, page, limit. The admin page passes `search`
  // (order # or customer) and a single `date`, translated here.
  getOrders: async (params = {}) => {
    const { search, date, ...rest } = params;
    const query = { ...rest };
    if (search) query.customer = search;
    if (date) {
      query.startDate = date;
      query.endDate = date;
    }
    const res = await api.get('/orders', { params: query });
    return res.data;
  },
  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  updateOrderStatus: async (id, status) => {
    const res = await api.patch(`/orders/${id}/status`, { status });
    return res.data;
  },

  // Customers
  getCustomers: async (params) => {
    const res = await api.get('/users', { params });
    return res.data;
  },
  getCustomer: async (id) => {
    const res = await api.get(`/users/${id}`);
    return res.data;
  },
  toggleCustomerStatus: async (id) => {
    const res = await api.patch(`/users/${id}/toggle-active`);
    return res.data;
  },

  // Coupons
  getCoupons: async () => {
    const res = await api.get('/coupons');
    return res.data;
  },
  createCoupon: async (payload) => {
    const res = await api.post('/coupons', payload);
    return res.data;
  },
  updateCoupon: async (id, payload) => {
    const res = await api.put(`/coupons/${id}`, payload);
    return res.data;
  },
  deleteCoupon: async (id) => {
    const res = await api.delete(`/coupons/${id}`);
    return res.data;
  },

  // Inventory — no dedicated endpoint; the product list supports
  // search + pagination, and the page filters low/out-of-stock locally.
  getInventory: async (params) => {
    const res = await api.get('/products', { params });
    return res.data;
  },
};

export default adminApi;
