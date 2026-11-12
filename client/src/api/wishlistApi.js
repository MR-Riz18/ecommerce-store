import api from './axios';

// Server routes (server/routes/wishlist.js):
//   GET    /wishlist            — { products: [...] }
//   POST   /wishlist/add        — { productId }
//   DELETE /wishlist/:productId
export const wishlistApi = {
  getWishlist: async () => {
    const res = await api.get('/wishlist');
    return res.data;
  },
  add: async (productId) => {
    const res = await api.post('/wishlist/add', { productId });
    return res.data;
  },
  remove: async (productId) => {
    const res = await api.delete(`/wishlist/${productId}`);
    return res.data;
  },
};

export default wishlistApi;
