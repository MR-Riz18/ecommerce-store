export const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  shipped: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

// Must match the server enum in server/models/Order.js and the check in
// server/controllers/orderController.js: 'cod' | 'card' | 'bank_transfer'.
// ('bank' is not a valid value — the server rejected it with 400.)
export const PAYMENT_METHODS = [
  { value: 'cod', label: 'Cash on Delivery' },
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
];

// Must match the server's shipping rules (server/controllers/orderController.js):
// standard Rs 150, free when the order subtotal is Rs 5000 or more;
// express Rs 350. Prices are in PKR (Rs), not USD.
export const FREE_SHIPPING_THRESHOLD = 5000;

export const DELIVERY_METHODS = [
  {
    value: 'standard',
    label: 'Standard Delivery',
    desc: '5-7 business days · Free on orders Rs 5,000+',
    price: 150,
    freeAbove: FREE_SHIPPING_THRESHOLD,
  },
  {
    value: 'express',
    label: 'Express Delivery',
    desc: '2-3 business days',
    price: 350,
  },
];

// Server-side tax rate (server/controllers/orderController.js): 5%.
export const TAX_RATE = 0.05;

// Sort values must match the server's sortMap
// (server/controllers/productController.js): featured, newest,
// 'price-asc', 'price-desc', rating, popular.
// ('price_asc' / 'price_desc' were silently ignored and fell back to newest.)
export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export const BRANDS = [
  'NovaTech',
  'UrbanThread',
  'Solstice',
  'Everlane Studio',
  'Pulse Audio',
  'Heritage Leather',
  'AeroFit',
  'Lumen Home',
];
