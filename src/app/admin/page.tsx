"use client";
import { API_URL } from "@/lib/config";
import {
  Activity,
  AlertTriangle,
  DollarSign,
  Filter,
  MapPin,
  MousePointerClick,
  Package,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Area = dynamic(() => import("recharts").then((mod) => mod.Area), {
  ssr: false,
});
const AreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  { ssr: false },
);
const Bar = dynamic(() => import("recharts").then((mod) => mod.Bar), {
  ssr: false,
});
const BarChart = dynamic(() => import("recharts").then((mod) => mod.BarChart), {
  ssr: false,
});
const CartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false },
);
const Cell = dynamic(() => import("recharts").then((mod) => mod.Cell), {
  ssr: false,
});
const Legend = dynamic(() => import("recharts").then((mod) => mod.Legend), {
  ssr: false,
});
const Pie = dynamic(() => import("recharts").then((mod) => mod.Pie), {
  ssr: false,
});
const PieChart = dynamic(() => import("recharts").then((mod) => mod.PieChart), {
  ssr: false,
});
const RechartsTooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false },
);
const ResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false },
);
const XAxis = dynamic(() => import("recharts").then((mod) => mod.XAxis), {
  ssr: false,
});
const YAxis = dynamic(() => import("recharts").then((mod) => mod.YAxis), {
  ssr: false,
});

interface DashboardStats {
  products: number;
  categories: number;
  brands: number;
  orders: number;
  lowStock: number;
  users: number;
  revenue: number;
  avgOrderValue: number;
}

// --- MOCK DATA ---
const salesData = [
  { name: "Mon", sales: 4000, purchases: 2400 },
  { name: "Tue", sales: 3000, purchases: 1398 },
  { name: "Wed", sales: 2000, purchases: 9800 },
  { name: "Thu", sales: 2780, purchases: 3908 },
  { name: "Fri", sales: 1890, purchases: 4800 },
  { name: "Sat", sales: 2390, purchases: 3800 },
  { name: "Sun", sales: 3490, purchases: 4300 },
];

const userData = [
  { name: "Regular", value: 400 },
  { name: "Guest", value: 300 },
];
const USER_COLORS = ["#3b82f6", "#f59e0b"];

// NEW: Conversion Funnel Data
const funnelData = [
  { name: "Store Visits", users: 15400, fill: "#60a5fa" },
  { name: "Added to Cart", users: 4200, fill: "#3b82f6" },
  { name: "Reached Checkout", users: 1850, fill: "#2563eb" },
  { name: "Purchased", users: 840, fill: "#1d4ed8" },
];

// NEW: Retention Data
const retentionData = [
  { name: "Mon", new: 120, returning: 80 },
  { name: "Tue", new: 150, returning: 90 },
  { name: "Wed", new: 180, returning: 120 },
  { name: "Thu", new: 140, returning: 150 },
  { name: "Fri", new: 200, returning: 180 },
  { name: "Sat", new: 250, returning: 210 },
  { name: "Sun", new: 300, returning: 240 },
];

const topProducts = [
  { id: 1, name: "Organic Bananas", sold: 342, stock: 45, price: 2.99 },
  { id: 2, name: "Whole Milk 1L", sold: 289, stock: 12, price: 1.49 },
  { id: 3, name: "Fresh Strawberries", sold: 156, stock: 0, price: 4.99 },
  { id: 4, name: "Avocado", sold: 142, stock: 8, price: 1.99 },
];

const recentOrders = [
  { id: "ORD-001", customer: "John Doe", total: 45.99, status: "Delivered" },
  { id: "ORD-002", customer: "Jane Smith", total: 12.5, status: "Processing" },
  { id: "ORD-003", customer: "Guest User", total: 89.0, status: "Pending" },
  {
    id: "ORD-004",
    customer: "Alice Johnson",
    total: 24.99,
    status: "Delivered",
  },
];

const recentSupplierPurchases = [
  {
    id: "SUP-001",
    supplier: "Fresh Farms Inc.",
    items: 450,
    cost: 450.0,
    status: "Received",
  },
  {
    id: "SUP-002",
    supplier: "Dairy Co.",
    items: 200,
    cost: 180.5,
    status: "In Transit",
  },
];

// NEW: Divisional Data
const divisionalSales = [
  { city: "Dhaka", orders: 450, revenue: 12450 },
  { city: "Chattogram", orders: 320, revenue: 9800 },
  { city: "Sylhet", orders: 210, revenue: 5400 },
  { city: "Rajshahi", orders: 150, revenue: 3200 },
];

// NEW: Traffic Sources Data
const trafficSources = [
  { source: "Google Organic", users: 8450, conversion: 4.2 },
  { source: "Facebook Ads", users: 4200, conversion: 2.8 },
  { source: "Direct Link", users: 2100, conversion: 8.5 },
  { source: "Instagram Ads", users: 1500, conversion: 1.5 },
];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    categories: 0,
    brands: 0,
    orders: 0,
    lowStock: 0,
    users: 0,
    revenue: 0,
    avgOrderValue: 0,
  });
  const [latestOrders, setLatestOrders] = useState<any[]>([]);
  const [salesChartData, setSalesChartData] = useState<any[]>(salesData);
  const [userChartData, setUserChartData] = useState<any[]>(userData);
  const [funnelChartData, setFunnelChartData] = useState<any[]>(funnelData);
  const [retentionChartData, setRetentionChartData] = useState<any[]>(retentionData);
  const [divisionalSalesData, setDivisionalSalesData] = useState<any[]>(divisionalSales);
  const [topProductsData, setTopProductsData] = useState<any[]>(topProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const fetchStats = async () => {
      try {
        const token =
          localStorage.getItem("femcart_access_token") ||
          localStorage.getItem("token") ||
          "";

        const [productsRes, categoriesRes, brandsRes, ordersRes, usersRes] =
          await Promise.all([
            fetch(`${API_URL}/api/products?limit=1000`),
            fetch(`${API_URL}/api/categories`),
            fetch(`${API_URL}/api/brands?limit=1`),
            fetch(`${API_URL}/api/orders?limit=1000`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${API_URL}/api/users?limit=1`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        const brandsData = await brandsRes.json();
        const ordersData = await ordersRes.json();
        const usersData = await usersRes.json();

        const productList = productsData.data || [];
        const totalProds = productsData.pagination?.total || 0;
        const lowStockCount = productList.filter((p: any) => p.stock !== null && p.stock !== undefined && p.stock <= 5).length;
        const totalUsers = usersData.pagination?.total || 0;

        const ordersList = ordersData.data || [];
        const totalRev = ordersList.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0);
        const avgVal = ordersList.length ? totalRev / ordersList.length : 0;

        // 1. Recent Orders
        const formattedRecent = ordersList.slice(0, 4).map((o: any) => ({
          id: o.id,
          customer: o.customerName || o.user?.name || "Guest User",
          total: Number(o.total) || 0,
          status: o.status.charAt(0) + o.status.slice(1).toLowerCase(),
        }));
        setLatestOrders(formattedRecent.length ? formattedRecent : recentOrders);

        // 2. Sales vs Purchases weekly trend
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklySales = daysOfWeek.map(day => ({ name: day, sales: 0, purchases: 0 }));
        ordersList.forEach((order: any) => {
          const date = new Date(order.createdAt);
          const dayName = daysOfWeek[date.getDay()];
          const idx = daysOfWeek.indexOf(dayName);
          if (idx !== -1) {
            weeklySales[idx].sales += Number(order.total) || 0;
          }
        });
        weeklySales.forEach(item => {
          item.purchases = Math.round(item.sales * 0.6);
        });
        setSalesChartData(ordersList.length ? weeklySales : salesData);

        // 3. User Accounts (Regular vs Guest)
        let guestCount = 0;
        let regularCount = 0;
        ordersList.forEach((order: any) => {
          if (order.user?.isGuest || order.customer === 'Guest User' || !order.userId) {
            guestCount += 1;
          } else {
            regularCount += 1;
          }
        });
        const calculatedUserData = [
          { name: "Regular", value: regularCount || 1 },
          { name: "Guest", value: guestCount || 1 },
        ];
        setUserChartData(regularCount || guestCount ? calculatedUserData : userData);

        // 4. Conversion Funnel
        const purchasesCount = ordersList.length;
        const calculatedFunnel = [
          { name: "Store Visits", users: Math.max(purchasesCount * 18, 150), fill: "#60a5fa" },
          { name: "Added to Cart", users: Math.max(purchasesCount * 5, 45), fill: "#3b82f6" },
          { name: "Reached Checkout", users: Math.max(purchasesCount * 2, 18), fill: "#2563eb" },
          { name: "Purchased", users: purchasesCount, fill: "#1d4ed8" },
        ];
        setFunnelChartData(purchasesCount > 0 ? calculatedFunnel : funnelData);

        // 5. Retention cohorts
        const userOrderCounts: Record<string, number> = {};
        ordersList.forEach((order: any) => {
          if (order.userId) {
            userOrderCounts[order.userId] = (userOrderCounts[order.userId] || 0) + 1;
          }
        });
        const calculatedRetention = daysOfWeek.map(day => ({ name: day, new: 0, returning: 0 }));
        ordersList.forEach((order: any) => {
          const date = new Date(order.createdAt);
          const dayName = daysOfWeek[date.getDay()];
          const idx = daysOfWeek.indexOf(dayName);
          if (idx !== -1) {
            const isReturning = order.userId && userOrderCounts[order.userId] > 1;
            if (isReturning) {
              calculatedRetention[idx].returning += 1;
            } else {
              calculatedRetention[idx].new += 1;
            }
          }
        });
        setRetentionChartData(ordersList.length > 0 ? calculatedRetention : retentionData);

        // 6. Divisional Sales
        const cityMap: Record<string, { orders: number; revenue: number }> = {};
        ordersList.forEach((order: any) => {
          const city = order.city || (order.billingAddress && typeof order.billingAddress === 'object' ? order.billingAddress.city : null) || 'Dhaka';
          if (!cityMap[city]) {
            cityMap[city] = { orders: 0, revenue: 0 };
          }
          cityMap[city].orders += 1;
          cityMap[city].revenue += Number(order.total) || 0;
        });
        const calculatedDivisionalSales = Object.entries(cityMap)
          .map(([city, data]) => ({ city, ...data }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);
        setDivisionalSalesData(calculatedDivisionalSales.length ? calculatedDivisionalSales : divisionalSales);

        // 7. Top Products
        const productSalesMap: Record<string, { name: string; sold: number; stock: number; price: number }> = {};
        ordersList.forEach((order: any) => {
          (order.items || []).forEach((item: any) => {
            const prodId = item.productId || 'unknown';
            const name = item.product?.name || item.variant?.product?.name || 'Product';
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 0;
            if (!productSalesMap[prodId]) {
              productSalesMap[prodId] = { name, sold: 0, stock: item.product?.stock || 0, price };
            }
            productSalesMap[prodId].sold += qty;
          });
        });
        const calculatedTopProducts = Object.entries(productSalesMap)
          .map(([id, data]) => ({ id, ...data }))
          .sort((a, b) => b.sold - a.sold)
          .slice(0, 4);
        setTopProductsData(calculatedTopProducts.length ? calculatedTopProducts : topProducts);

        setStats({
          products: totalProds,
          categories: categoriesData.data?.length || 0,
          brands: brandsData.pagination?.total || 0,
          orders: ordersData.pagination?.total || 0,
          lowStock: lowStockCount,
          users: totalUsers,
          revenue: totalRev,
          avgOrderValue: avgVal,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back! Here's what's happening in your store today.
        </p>
      </div>

      {/* TOP TIER: Expanded Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {/* Core Financials */}
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
              Total Revenue
            </p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">
              ৳ {loading ? "..." : stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs font-bold text-emerald-500 flex items-center gap-1 mt-1">
              <TrendingUp size={12} /> +14.5% from last week
            </p>
          </div>
        </div>

        {/* E-Commerce Metrics */}
        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <ShoppingCart size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">
              Total Orders
            </span>
          </div>
          <h3 className="text-xl font-black text-gray-900 dark:text-white">
            {loading ? "..." : stats.orders}
          </h3>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Activity size={16} className="text-indigo-500" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Avg Order Value
            </span>
          </div>
          <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400">
            ৳ {loading ? "..." : stats.avgOrderValue.toFixed(2)}
          </h3>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:-translate-y-1 transition-transform duration-300">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Filter size={16} className="text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-widest">
              Conv. Rate
            </span>
          </div>
          <h3 className="text-xl font-black text-blue-600 dark:text-blue-400">
            5.4%
          </h3>
        </div>

        {/* Alerts */}
        <div
          className={`rounded-[1.5rem] p-6 border shadow-sm hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-center ${stats.lowStock > 0 ? "bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-900/30" : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"}`}
        >
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            {stats.lowStock > 0 ? (
              <AlertTriangle size={16} className="text-rose-500" />
            ) : (
              <Package size={16} />
            )}
            <span
              className={`text-xs font-bold uppercase tracking-widest ${stats.lowStock > 0 ? "text-rose-500" : "text-gray-500"}`}
            >
              Low Stock
            </span>
          </div>
          <h3
            className={`text-xl font-black ${stats.lowStock > 0 ? "text-rose-700 dark:text-rose-400" : "text-gray-900 dark:text-white"}`}
          >
            {loading ? "..." : stats.lowStock} Items
          </h3>
        </div>
      </div>

      {/* MIDDLE TIER: Advanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart: Sales vs Purchases */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">
            Sales vs Supplier Purchases
          </h3>
          <div className="h-[300px] w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={salesChartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorPurchases"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    dx={-10}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sales"
                    name="Revenue"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSales)"
                  />
                  <Area
                    type="monotone"
                    dataKey="purchases"
                    name="Supplier Cost"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorPurchases)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* E-Commerce Funnel */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
            E-Commerce Conversion Funnel
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            Tracking customer drop-off at each stage
          </p>
          <div className="h-[276px] w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={funnelChartData}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 30, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#e5e7eb"
                    opacity={0.5}
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#4b5563", fontSize: 12, fontWeight: "bold" }}
                    dx={-10}
                  />
                  <RechartsTooltip
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="users"
                    name="Users"
                    radius={[0, 8, 8, 0]}
                    barSize={32}
                  >
                    {funnelChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* New vs Returning Customers */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-2">
            Customer Retention
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            New vs Returning Customers over time
          </p>
          <div className="h-[276px] w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={retentionChartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e5e7eb"
                    opacity={0.5}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    dx={-10}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="new"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#fcd34d"
                    name="New Customers"
                  />
                  <Area
                    type="monotone"
                    dataKey="returning"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#93c5fd"
                    name="Returning Customers"
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: "12px",
                      fontWeight: "bold",
                      paddingBottom: "10px",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Split Demographic & Traffic */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Donut Chart */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 text-center">
              User Accounts
            </h3>
            <div className="h-[180px] w-full relative">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={userChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {userChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={USER_COLORS[index % USER_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={24}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Traffic Sources */}
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MousePointerClick size={16} /> Top Traffic
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {trafficSources.map((source, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {source.source}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {source.users.toLocaleString()} users
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                      {source.conversion}%
                    </span>
                    <p className="text-[10px] text-gray-400">CVR</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* LOWER TIER: Tables & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Sold & Low Stock */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-6">
            Product Intelligence
          </h3>
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-2">
              Most Sold Products & Stock Alerts
            </h4>
            {topProductsData.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors group"
              >
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">
                    {product.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {product.sold} units sold
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm text-gray-900 dark:text-white">
                    ৳ {product.price}
                  </p>
                  {product.stock === 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full mt-1">
                      OUT OF STOCK
                    </span>
                  ) : product.stock < 15 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full mt-1">
                      LOW: {product.stock} left
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full mt-1">
                      IN STOCK: {product.stock}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Division */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <MapPin size={18} className="text-rose-500" /> Divisional Sales
          </h3>
          <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-750 shadow-sm mt-2">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                    Division / City
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-right">
                    Orders
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-right">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {divisionalSalesData.map((region, i) => (
                  <tr
                    key={i}
                    className="group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-750/30"
                  >
                    <td className="px-4 py-3 align-middle border border-gray-200 dark:border-gray-750 font-medium text-gray-900 dark:text-white text-xs">
                      {region.city}
                    </td>
                    <td className="px-4 py-3 align-middle border border-gray-200 dark:border-gray-750 text-gray-500 text-xs text-right">
                      {region.orders}
                    </td>
                    <td className="px-4 py-3 align-middle border border-gray-200 dark:border-gray-750 font-bold text-emerald-600 dark:text-emerald-400 text-right text-xs">
                      ৳ {region.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">
              Recent Sell (Orders)
            </h3>
            <button className="text-xs font-bold text-blue-500 hover:text-blue-600">
              View All
            </button>
          </div>
          <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-750 shadow-sm mt-2">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                    Order ID
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                    Customer
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-right">
                    Total
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-750/30"
                  >
                    <td className="px-4 py-3 align-middle border border-gray-200 dark:border-gray-750 font-medium text-gray-900 dark:text-white text-xs">
                      {order.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 align-middle border border-gray-200 dark:border-gray-750 text-gray-500 flex items-center gap-2 text-xs">
                      {order.customer === "Guest User" ? (
                        <Users size={12} className="text-amber-500" />
                      ) : null}
                      {order.customer}
                    </td>
                    <td className="px-4 py-3 align-middle border border-gray-200 dark:border-gray-750 font-bold text-gray-900 dark:text-white text-right text-xs">
                      ৳ {order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 align-middle border border-gray-200 dark:border-gray-750 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full ${order.status === "Delivered" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : order.status === "Processing" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Truck size={18} className="text-blue-500" /> Supplier Purchases
            </h3>
            <button className="text-xs font-bold text-blue-500 hover:text-blue-600">
              View All
            </button>
          </div>
          <div className="overflow-x-auto overflow-hidden rounded-xl border border-gray-200 dark:border-gray-750 shadow-sm mt-2">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-800/80">
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                    Restock ID
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700">
                    Supplier
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-right">
                    Cost
                  </th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle border border-gray-200 dark:border-gray-700 text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentSupplierPurchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="group transition-colors duration-200 hover:bg-gray-50/80 dark:hover:bg-gray-750/30"
                  >
                    <td className="px-4 py-3 align-middle border border-gray-200 dark:border-gray-750 font-medium text-gray-900 dark:text-white text-xs">
                      {purchase.id}
                    </td>
                    <td className="px-4 py-3 align-middle border border-gray-200 dark:border-gray-750 text-gray-500 text-xs">
                      {purchase.supplier}
                    </td>
                    <td className="px-4 py-3 align-middle border border-gray-200 dark:border-gray-750 font-bold text-rose-600 dark:text-rose-400 text-right text-xs">
                      -৳ {purchase.cost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 align-middle border border-gray-200 dark:border-gray-750 text-right">
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-full ${purchase.status === "Received" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}
                      >
                        {purchase.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
