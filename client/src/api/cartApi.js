import api from './axios';

// Server routes (server/routes/cart.js):
//   GET    /cart            — current user's cart
//   POST   /cart/add        — { productId, quantity, size, color }
//   PUT    /cart/item/:id   — { quantity }
//   DELETE /cart/item/:id
//   DELETE /cart            — clear
export const cartApi = {
  getCart: async () => {
    const res = await api.get('/cart');
    return res.data;
  },
  addItem: async (productId, quantity = 1, size, color) => {
    const res = await api.post('/cart/add', { productId, quantity, size, color });
    return res.data;
  },
  updateItem: async (itemId, quantity) => {
    const res = await api.put(`/cart/item/${itemId}`, { quantity });
    return res.data;
  },
  removeItem: async (itemId) => {
    const res = await api.delete(`/cart/item/${itemId}`);
    return res.data;
  },
  clear: async () => {
    const res = await api.delete('/cart');
    return res.data;
  },
};

export default cartApi;
