import api from './axios';

// Server routes (server/routes/users.js):
//   GET   /users/profile
//   PUT   /users/profile            — multipart avatar upload
//   PUT   /users/change-password    — { currentPassword, newPassword, confirmPassword }
//   GET   /users/addresses
//   POST  /users/addresses
//   PUT   /users/addresses/:id
//   DELETE /users/addresses/:id
//   PATCH /users/addresses/:id/default
export const userApi = {
  getProfile: async () => {
    const res = await api.get('/users/profile');
    return res.data;
  },
  updateProfile: async (payload) => {
    const res = await api.put('/users/profile', payload);
    return res.data;
  },
  changePassword: async (payload) => {
    const res = await api.put('/users/change-password', payload);
    return res.data;
  },
  getAddresses: async () => {
    const res = await api.get('/users/addresses');
    return res.data;
  },
  addAddress: async (payload) => {
    const res = await api.post('/users/addresses', payload);
    return res.data;
  },
  updateAddress: async (id, payload) => {
    const res = await api.put(`/users/addresses/${id}`, payload);
    return res.data;
  },
  deleteAddress: async (id) => {
    const res = await api.delete(`/users/addresses/${id}`);
    return res.data;
  },
  setDefaultAddress: async (id) => {
    const res = await api.patch(`/users/addresses/${id}/default`);
    return res.data;
  },
};

export default userApi;
