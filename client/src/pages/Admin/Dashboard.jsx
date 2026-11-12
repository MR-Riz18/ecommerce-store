import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import adminApi from '../../api/adminApi';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/StatCard';
import Chart from '../../components/Chart';
import ErrorState from '../../components/ErrorState';
import { ProductGridSkeleton } from '../../components/Skeleton';
import { formatPrice, formatDate } from '../../utils/format';

const Icon = ({ path }) => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

const ICONS = {
  revenue: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  orders: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
  customers: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
  products: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  pending: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  lowStock: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
};

// The API envelope is { success, message, data } — unwrap to `data`.
const unwrap = (res) => res?.data?.data ?? res?.data ?? {};
// The Chart component needs { label, value } items.
const toChart = (rows, labelKey, valueKey) =>
  (Array.isArray(rows) ? rows : []).map((r) => ({
    label: String(r?.[labelKey] ?? ''),
    value: Number(r?.[valueKey] ?? 0) || 0,
  }));

export default function Dashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [salesOverTime, setSalesOverTime] = useState([]);
  const [ordersOverTime, setOrdersOverTime] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [revenueByCategory, setRevenueByCategory] = useState([]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // GET /admin/dashboard returns a FLAT object:
      // { totalSales, totalOrders, totalCustomers, totalProducts,
      //   pendingOrders, lowStockProducts[], recentOrders[] }
      // Charts come from their own endpoints (arrays, not {label,value}).
      const [dash, sales, orders, best, revenue] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getSalesChart(),
        adminApi.getOrdersChart(),
        adminApi.getBestSellers(),
        adminApi.getRevenueByCategory(),
      ]);
      setStats(unwrap(dash));
      // Sales/orders charts return [{ date: 'YYYY-MM-DD', total|orders }] (30 days).
      setSalesOverTime(
        toChart(unwrap(sales), 'date', 'total').map((d) => ({ ...d, label: d.label.slice(5) }))
      );
      setOrdersOverTime(
        toChart(unwrap(orders), 'date', 'orders').map((d) => ({ ...d, label: d.label.slice(5) }))
      );
      setBestSellers(toChart(unwrap(best), 'name', 'sold').slice(0, 5));
      setRevenueByCategory(toChart(unwrap(revenue), 'category', 'revenue'));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load dashboard data';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-100" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card h-28 animate-pulse bg-gray-50" />
          ))}
        </div>
        <div className="mt-6"><ProductGridSkeleton count={4} /></div>
      </div>
    );
  }

  if (error && !stats) {
    return <ErrorState message={error} onRetry={fetchStats} />;
  }

  const num = (v) => (typeof v === 'number' && !Number.isNaN(v) ? v : 0);
  const lowStockProducts = Array.isArray(stats?.lowStockProducts) ? stats.lowStockProducts : [];
  const recentOrders = Array.isArray(stats?.recentOrders) ? stats.recentOrders : [];

  const cards = [
    { title: 'Total Revenue', value: formatPrice(num(stats?.totalSales)), icon: <Icon path={ICONS.revenue} />, sub: 'All-time store revenue' },
    { title: 'Total Orders', value: num(stats?.totalOrders), icon: <Icon path={ICONS.orders} />, sub: 'All-time orders' },
    { title: 'Total Customers', value: num(stats?.totalCustomers), icon: <Icon path={ICONS.customers} />, sub: 'Registered accounts' },
    { title: 'Total Products', value: num(stats?.totalProducts), icon: <Icon path={ICONS.products} />, sub: 'Active catalog items' },
    { title: 'Pending Orders', value: num(stats?.pendingOrders), icon: <Icon path={ICONS.pending} />, sub: 'Awaiting processing' },
    { title: 'Low Stock Products', value: lowStockProducts.length, icon: <Icon path={ICONS.lowStock} />, sub: 'Fewer than 10 units' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of ShopNova performance</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <StatCard key={c.title} title={c.title} value={c.value} icon={c.icon} sub={c.sub} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Sales Over Time (30 days)</h2>
          <Chart
            type="line"
            data={salesOverTime}
            height={260}
            formatValue={(v) => formatPrice(v)}
          />
        </div>
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Orders Over Time (30 days)</h2>
          <Chart type="bar" data={ordersOverTime} height={260} />
        </div>
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Best-Selling Products</h2>
          <Chart type="bar" data={bestSellers} height={260} />
        </div>
        <div className="card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Revenue by Category</h2>
          <Chart
            type="donut"
            data={revenueByCategory}
            height={260}
            formatValue={(v) => formatPrice(v)}
          />
        </div>
      </div>

      {/* Low stock + recent orders, from the dashboard payload */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
          {lowStockProducts.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">All products are well stocked.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {lowStockProducts.map((p) => (
                <li key={p._id} className="flex items-center justify-between py-2 text-sm">
                  <span className="font-medium text-slate-800">{p.name}</span>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                    {p.stock} left
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/inventory" className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            Manage inventory →
          </Link>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No orders yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {recentOrders.map((o) => (
                <li key={o._id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-xs font-bold text-slate-900">{o.orderId}</p>
                    <p className="text-xs text-slate-500">
                      {o.user?.username || o.user?.email || 'Guest'} · {formatDate(o.createdAt)}
                    </p>
                  </div>
                  <span className="shrink-0 font-bold text-slate-900">{formatPrice(o.total)}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/admin/orders" className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-700">
            View all orders →
          </Link>
        </div>
      </div>
    </div>
  );
}
