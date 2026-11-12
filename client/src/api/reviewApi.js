import api from './axios';

// Server routes (server/routes/reviews.js):
//   GET    /reviews/product/:productId
//   POST   /reviews        — { productId, rating, comment }
//   PUT    /reviews/:id    — own review
//   DELETE /reviews/:id    — own review (or admin)
export const reviewApi = {
  getByProduct: async (productId) => {
    const res = await api.get(`/reviews/product/${productId}`);
    return res.data;
  },
  create: async (productId, payload) => {
    const res = await api.post('/reviews', { productId, ...payload });
    return res.data;
  },
  update: async (id, payload) => {
    const res = await api.put(`/reviews/${id}`, payload);
    return res.data;
  },
  remove: async (id) => {
    const res = await api.delete(`/reviews/${id}`);
    return res.data;
  },
};

export default reviewApi;
