import api from './axios';

// Server routes (server/routes/categories.js):
//   GET /categories — bare array, each with productCount
//   GET /categories/:slug
// NOTE: there is no get-by-id endpoint — lookup is by slug only.
export const categoryApi = {
  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data;
  },
  getCategory: async (slug) => {
    const res = await api.get(`/categories/${slug}`);
    return res.data;
  },
};

export default categoryApi;
