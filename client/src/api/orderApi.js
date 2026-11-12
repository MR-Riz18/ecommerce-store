import api from './axios';

// Server routes (server/routes/orders.js):
//   POST  /orders              — create (from cart)
//   GET   /orders/my-orders    — own orders (paginated)
//   GET   /orders/:id          — own order (or any, for admin)
//   PATCH /orders/:id/cancel   — cancel own pending/confirmed order
export const orderApi = {
  create: async (payload) => {
    const res = await api.post('/orders', payload);
    return res.data;
  },
  getMyOrders: async (params) => {
    const res = await api.get('/orders/my-orders', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  },
  cancel: async (id) => {
    const res = await api.patch(`/orders/${id}/cancel`);
    return res.data;
  },
};

export default orderApi;
