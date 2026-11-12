# CHANGES — ShopNova (ecommerce-store) modernised — 2026-11-11

Fixed and modernised from the uploaded `ecommerce-store.zip`. No features, routes
or branding were changed; the backend API contract was not changed — the client
was aligned to the API the server actually exposes, and two small server gaps
were filled (a documented-but-missing route, and fields the admin UI already
expected). App name, pages, flows and seed data are untouched.

## 1. Bugs found and fixed

### Broken API calls (client called endpoints that don't exist → 404/403)
| File | Was | Fixed to |
|---|---|---|
| `client/src/api/cartApi.js` | `POST /cart/items`, `PUT/DELETE /cart/items/:id` | `POST /cart/add`, `PUT/DELETE /cart/item/:id` |
| `client/src/api/wishlistApi.js` | `POST /wishlist` | `POST /wishlist/add` |
| `client/src/api/reviewApi.js` | `GET/POST /products/:id/reviews` | `GET /reviews/product/:id`, `POST /reviews` (+ update/delete added) |
| `client/src/api/orderApi.js` | `GET /orders` for "my orders" (admin-only → 403 for users) | `GET /orders/my-orders`; added `cancel()` → `PATCH /orders/:id/cancel` |
| `client/src/api/couponApi.js` | sent `{ code, subtotal }` — server reads `orderAmount`, so every coupon with a minimum order failed | sends `{ code, orderAmount }` |
| `client/src/api/userApi.js` | `PUT /users/password` | `PUT /users/change-password` |
| `client/src/api/productApi.js` | `GET /products/:id/related` (404) | `GET /products/related/:id`; added `getFeatured` / `getBestSellers` / `getNewArrivals` |
| `client/src/api/adminApi.js` | all CRUD went to `/admin/products`, `/admin/categories`, `/admin/orders`, `/admin/customers`, `/admin/coupons`, `/admin/inventory` — **none of these routes exist**, so the whole admin backend was dead | remapped to the real routes: products/categories/coupons on their resource routers (`/products`, `/categories`, `/coupons`), orders on `GET /orders` + `PATCH /orders/:id/status`, customers on `GET /users` + `PATCH /users/:id/toggle-active`, inventory on `GET /products`; added the 4 chart calls (`/admin/sales-chart`, `/admin/orders-chart`, `/admin/best-sellers`, `/admin/revenue-by-category`). Order filters translated (`search` → `customer`, `date` → `startDate`/`endDate`). |

### Broken flows (wrong field names / values)
- `client/src/pages/Register.jsx` — never sent `confirmPassword`, so **registration always failed** with "All fields are required". Now sent.
- `client/src/pages/Profile.jsx` — password change never sent `confirmPassword`, so it **always failed**. Now sent.
- `client/src/utils/constants.js` — payment value `'bank'` is not in the server enum (`cod`/`card`/`bank_transfer`), so **Bank Transfer checkout always failed** with 400. Now `'bank_transfer'`.
- `client/src/utils/constants.js` — sort values `price_asc`/`price_desc` are not in the server's sort map, so price sorting silently fell back to "newest". Now `price-asc`/`price-desc`.
- `client/src/pages/ProductDetails.jsx` — `calcDiscountPct(price, originalPrice)` was called with two numbers instead of the product object, so the "Save X%" badge **always showed "Save 0%"**. Now `calcDiscountPct(product)`.
- `client/src/pages/Home.jsx` — "Featured" and "Best Sellers" passed `featured`/`bestSeller` params the list endpoint ignores, so both sections showed the same newest products. Now uses the dedicated `/products/featured`, `/best-sellers`, `/new-arrivals` endpoints.
- `client/src/context/CartContext.jsx`, `WishlistContext.jsx` — effects depended on `user?._id`, but login returns `{ id, … }` (no `_id`), so the **cart and wishlist never loaded after login** until a page reload. Now depend on `user`.
- `client/src/context/WishlistContext.jsx` — `normalize()` expected a bare array, but the server returns `{ products: [...] }`, so the **wishlist always looked empty** (hearts never stayed filled). Now handles both shapes.
- `client/src/pages/Admin/Coupons.jsx` — used discount type `'percentage'`; the server enum is `percent`/`fixed`, so **creating any coupon failed** with 400. Now `'percent'`.
- `client/src/pages/Admin/Products.jsx` — specifications were sent as a plain object, which the server silently drops (it only keeps arrays), so **specs could never be saved**; the edit form also rendered them as `0: [object Object]`. Now sent/read as `[{ key, value }]`. Also added the missing `isNew` checkbox (new arrivals couldn't be flagged from admin).
- `client/src/pages/Admin/Dashboard.jsx` — expected `data.stats.totalRevenue`, `data.stats.lowStock`, `data.salesOverTime`, etc.; the server returns a **flat** object (`totalSales`, `lowStockProducts[]`, `recentOrders[]`) and separate chart endpoints, so **every stat card showed 0 and all 4 charts were empty**. Rewired to the real shape + chart endpoints (mapped to `{ label, value }` for the Chart component); added Low Stock and Recent Orders panels from data the endpoint already returns.
- `client/src/pages/Admin/Products.jsx`, `Orders.jsx`, `Customers.jsx` — pagination read `d.page`/`d.pages`/`d.total`, but the server nests them under `d.pagination`, so the pager always said "Page 1 of 1 · 0 products". Fixed.
- `client/src/pages/Admin/Orders.jsx` — used `o.status` / `o.orderNumber`; the server fields are `orderStatus` / `orderId`, so the status column showed "—" and the drawer opened with a blank status. Fixed.
- `client/src/pages/Admin/Customers.jsx` — recent orders used `o.status` / `o.orderNumber`; fixed to `orderStatus` / `orderId`.
- `client/src/pages/Admin/Inventory.jsx` — called `GET /admin/inventory`, which doesn't exist; low/out-of-stock filters were server params the API doesn't support. Now loads `GET /products` and filters locally.
- `client/src/components/AdminSidebar.jsx` — `AdminMobileNav` ignored its `open`/`onClose` props, so the admin hamburger button did nothing. Now a real slide-over drawer.
- `client/src/components/Navbar.jsx` — used `user?.name`; the user object has `username`, so the avatar initial and dropdown showed the email instead of the name. Fixed.
- `client/src/components/Filters.jsx` — rating buttons compared the URL string `'4'` with the number `4`, so the active rating filter was never highlighted. Fixed with `Number()`.
- `client/src/components/Footer.jsx` — links to `/contact`, `/faq`, `/shipping`, `/returns`, `/privacy`, `/terms` (no such routes → 404) and `/shop?sort=bestsellers` (invalid sort). Retargeted to real pages (`/orders`, `/wishlist`, `/profile`, `/shop`, `sort=popular`).

### Currency / money mismatches (store prices are PKR)
- `client/src/utils/format.js` — `formatPrice` formatted as **USD** (`$2,899.00`) while seed prices are PKR. Now formats as Rs (`Rs 2,899`).
- `client/src/utils/constants.js` — delivery was `$4.99` / `$14.99`; server charges **Rs 150 standard (free ≥ Rs 5,000) / Rs 350 express**. Fixed, including the free-shipping rule.
- `client/src/pages/Cart.jsx`, `Checkout.jsx` — tax shown as **8%**; the server charges **5%**. Fixed (shared `TAX_RATE = 0.05` in constants).
- `client/src/pages/Cart.jsx` — line totals used the populated product price instead of the server's cart-item price snapshot. Now prefers `item.price`.
- `client/src/pages/Checkout.jsx` — shipping display now shows "Free" when standard delivery is free (subtotal ≥ Rs 5,000).
- `client/src/components/Navbar.jsx` — banner said "Free shipping on orders over $150"; now "Free shipping on orders over Rs 5,000".
- Admin Products/Coupons forms said "(USD)"; now "(Rs)".

### Server gaps (no contract change)
- `server/routes/users.js` + `server/controllers/userController.js` — **added the missing `GET /api/users/addresses`** route the README documents and Checkout/Profile call (they silently fell back to "no saved addresses" before).
- `server/controllers/userController.js` — `getAllUsers`/`getUserById` now attach `ordersCount`, `totalSpent` (and recent `orders` for the detail view); the Customers page displayed them but the API never returned them, so every customer showed "0 orders / Rs 0".
- `server/controllers/productController.js` — `updateProduct` now honours the `existingImages` array the admin form already sends: kept images are preserved when new ones are uploaded (before, any new upload silently dropped all kept images).
- `server/models/Order.js` — removed the duplicate `orderId` index (declared twice; Mongoose logged a warning on boot).
- `server/.env.example` — **created** (the README tells you to `cp .env.example .env`, but the file was missing from the zip).

### Dead code removed
- `client/src/api/categoryApi.js` — removed the unused `getCategory(id)` (the server only looks categories up by slug, and nothing called it).

## 2. UI modernisation
- Dark header: the navbar is now slate-900 with white text and a dark search field, matching the dark footer and dark admin sidebar (was white nav under an indigo banner).
- Buttons now have a soft shadow, a hover lift and a pressed state (`shadow-sm`, `hover:shadow`, `active:translate-y-px`); text selection is indigo-tinted.
- New `.card-hover` utility: product cards lift slightly on hover with a soft indigo ring.
- Hero banner and auth cards gained depth (`shadow-xl` / ring).
- Everything else keeps the existing indigo/slate Tailwind system — same layout, spacing, pages and flows, just more consistent and polished. No rebranding, no renamed pages.

## 3. How to run it
```bash
# 1. MongoDB — local install, Atlas, or Docker:
docker compose up -d            # from the project root (MongoDB on :27017)

# 2. Backend
cd server
cp .env.example .env            # set MONGO_URI + a strong JWT_SECRET
npm install
npm run seed                    # 6 categories, 32 products, coupons, admin + demo users
npm run dev                     # http://localhost:5000

# 3. Frontend
cd ../client
npm install
npm run dev                     # http://localhost:5173 (proxies /api + /uploads → :5000)
npm run build                   # production build → client/dist/
```
Seed logins: admin `admin@shop.com` / `Admin123!` · demo user `user@shop.com` / `User123!`
Seed coupons: `WELCOME10` (10% off, min Rs 2,000), `SAVE20` (20% off, min Rs 5,000), `FREESHIP` (Rs 350 off, min Rs 3,000).

## 4. What was tested (2026-11-11)
- **Client build:** `npm install` + `npm run build` — **PASS**. `vite build`: 149 modules transformed, built in ~3.9s, zero errors. `dist/` serves correctly (`vite preview`: index 200, JS asset 200).
- **Server syntax:** `node --check` on **every** server `.js` file — **PASS**.
- **Server boot + seed:** started against a local MongoDB, `npm run seed` — **PASS** (6 users, 6 categories, 32 products, 24 reviews, 3 coupons).
- **Live API smoke test (45 checks, 45 passed, 0 failed)** against the seeded DB, covering every fixed area: register (with/without `confirmPassword`), login, `GET /users/addresses`, change-password, cart add/update, wishlist add, coupon validate (`WELCOME10` on Rs 5,000 → Rs 500 off), order create with server-side totals (subtotal 2499, shipping 150, tax 5% = 112, discount 250, **total 2511**), `GET /orders/my-orders` (and `GET /orders` correctly 403s for a non-admin), review create, admin dashboard + all 4 chart endpoints, admin orders list + status update, admin customers (now with `ordersCount`/`totalSpent`), coupon create with `percent` (and `percentage` correctly 400s), admin product create/update/delete, and confirmation that the old `/admin/products` and `/admin/orders` paths 404.
- **Not runtime-tested:** the browser UI flows end-to-end (no headed browser in this environment) — the build, the API the UI calls, and the served bundle were verified instead. Worth a quick manual click-through: register → shop → add to cart → apply `WELCOME10` → checkout (Bank Transfer) → My Orders → admin dashboard.
- Known pre-existing warnings left as-is: Mongoose logs "`isNew` is a reserved schema pathname" on boot (the Product model uses `isNew` as a field; harmless, renaming it would change the API).

---

## 4. Product images added — 2026-11-12

**Problem:** every product photo came from `picsum.photos` seed URLs
(`server/seed/seed.js`, `toProductDoc()`), so the shop showed random
photos — landscapes and unrelated pictures — that had nothing to do with
the product. Category cards had the same problem.

**Fix — only `server/seed/seed.js` changed (no API, model, or UI change):**
- New `productImages` map, keyed by exact product name, with one real
  photo per product matched to what it actually is. `toProductDoc()`
  now uses that map; the old picsum URL is only a fallback for a product
  with no entry in the map.
- New `categoryImages` map for the 6 category cards (same Unsplash
  photos the client's sample data already uses).
- 29 of the 32 products have 2 images (the product page shows them as
  a gallery). 3 have 1 image each, because no second photo that actually
  showed the product could be verified: Premium Chiffon Hijab Scarf,
  20000mAh Fast-Charging Power Bank, Comfort Slide Sandals.
- Photos are Unsplash (`images.unsplash.com`, 800px, q=80), except two
  noted in the code: the hijab scarf uses a Wikimedia Commons photo of
  a silk scarf worn as a head scarf (no verified Unsplash hijab photo
  could be found), and the candle set's second photo is the product's
  own gift-box photo (Amazon media CDN).
- Also restored `server/.env.example` — it was missing from the
  re-sent zip, so `cp .env.example .env` did not work.

**Checks done 2026-11-12:**
- All 63 image URLs return HTTP 200, and each one was looked at to
  confirm it shows the right kind of product (a few first guesses were
  wrong and were replaced — e.g. two "hijab" photos that showed women
  in plain t-shirts, and a "leather oxfords" photo that showed a man in
  a leather jacket).
- `npm run seed` against a test MongoDB: 32 products, 6 categories —
  0 products without images, 0 picsum URLs left in the database.
- Live API check: `GET /api/products` returns the new image URLs.
- Client build: PASS (vite, 149 modules, 3.30s).

**To see the new photos:** re-run the seed (`cd server && npm run seed`)
— it wipes and re-creates the products, so the old picsum images are
replaced. Your existing orders, users and coupons are also wiped by the
seed, as before, so only re-seed on a fresh database.

---

## 5. Hosting readiness — 2026-11-12

- `client/src/api/axios.js` — the API address now comes from
  `VITE_API_URL` when set (`<api>/api`), falling back to `/api` in dev.
- `client/src/utils/format.js` — `imgUrl()` prefixes backend-hosted
  paths (e.g. `/uploads/...`) with `VITE_API_URL` when set.
- `client/.env.example` — created, documenting `VITE_API_URL`.
