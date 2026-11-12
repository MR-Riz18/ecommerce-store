import api from './axios';

// Server routes (server/routes/products.js):
//   GET /products                 — list (?search, category, brand,
//     minPrice, maxPrice, minRating, inStock, size, color, sort, page, limit)
//   GET /products/featured        — bare array
//   GET /products/best-sellers    — bare array
//   GET /products/new-arrivals    — bare array
//   GET /products/related/:id     — bare array
//   GET /products/:id             — id or slug
export const productApi = {
  getProducts: async (params) => {
    const res = await api.get('/products', { params });
    return res.data;
  },
  getProduct: async (id) => {
    const res = await api.get(`/products/${id}`);
    return res.data;
  },
  getFeatured: async (params) => {
    const res = await api.get('/products/featured', { params });
    return res.data;
  },
  getBestSellers: async (params) => {
    const res = await api.get('/products/best-sellers', { params });
    return res.data;
  },
  getNewArrivals: async (params) => {
    const res = await api.get('/products/new-arrivals', { params });
    return res.data;
  },
  getRelated: async (id) => {
    const res = await api.get(`/products/related/${id}`);
    return res.data;
  },
};

export default productApi;
