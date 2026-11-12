import api from './axios';

// Server route (server/routes/coupons.js + couponController.validateCoupon):
//   POST /coupons/validate — { code, orderAmount } → { valid, code,
//   discountType, discountValue, discountAmount }
// NOTE: the field is `orderAmount`, not `subtotal` — sending the wrong
// name made every coupon with a minimum order fail validation.
export const couponApi = {
  validate: async (code, subtotal) => {
    const res = await api.post('/coupons/validate', { code, orderAmount: subtotal });
    return res.data;
  },
};

export default couponApi;
