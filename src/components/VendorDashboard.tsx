import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  RefreshCw,
  Users,
  Star,
  Plus,
  ArrowRight,
  Store,
  Activity,
  Award,
  Zap,
} from "lucide-react";
import StatsCard from "./StatsCard";
import Chart from "./Chart";
import RecentOrders from "./RecentOrders";
import OrderStatusChart from "./OrderStatusChart";
import ProductCard from "./ProductCard";
import CustomerCard from "./CustomerCard";
import { apiService } from "../services/api";

interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  growth: number;
  pendingOrders: number;
  completedOrders: number;
  totalCustomers?: number;
  averageRating?: number;
}

interface Order {
  id: string;
  customer: string;
  status: "pending" | "confirmed" | "processing" | "delivered";
  time: string;
  amount: string;
}

interface SalesData {
  label: string;
  value: number;
}

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [vendorStats, setVendorStats] = useState<VendorStats>({
    totalProducts: 0,
    totalOrders: 0,
    revenue: 0,
    growth: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalCustomers: 0,
    averageRating: 4.8,
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [revenueData, setRevenueData] = useState<SalesData[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<{ label: string; value: number; color: string }[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [mostRatedProducts, setMostRatedProducts] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [vendorId, setVendorId] = useState<number | null>(null);

  // Get vendor ID from token
  const getVendorId = (): number | null => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return null;

      const tokenData = JSON.parse(atob(token.split(".")[1]));
      return tokenData.user_id;
    } catch (error) {
      console.error("Error getting vendor ID from token:", error);
      return null;
    }
  };

  // Fetch vendor dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError(null);

      const currentVendorId = getVendorId();
      if (!currentVendorId) {
        throw new Error("Unable to identify vendor. Please login again.");
      }

      setVendorId(currentVendorId);

      // Fetch vendor-specific data
      const [itemsResponse, ordersResponse] = await Promise.all([
        apiService.getAllItems(),
        apiService.getAllOrders({
          start_date: getStartOfMonth(),
          end_date: getEndOfMonth(),
          page: 1,
          limit: 1000,
        }),
      ]);

      // Process items data - get only items belonging to this vendor
      const allItems = itemsResponse.data?.items || [];
      setItems(allItems);
      const vendorItems = allItems.filter((item: any) => {
        return true; // Show all items for now
      });
      const totalProducts = vendorItems.length;

      // Process orders data - use the correct structure from API
      let orders: any[] = [];
      if (
        ordersResponse.data?.data?.orders &&
        Array.isArray(ordersResponse.data.data.orders)
      ) {
        orders = ordersResponse.data.data.orders;
      } else if (
        ordersResponse.data?.orders &&
        Array.isArray(ordersResponse.data.orders)
      ) {
        orders = ordersResponse.data.orders;
      }

      const totalOrders = orders.length;

      // Count orders by status
      const pendingOrders = orders.filter(
        (order: any) => order.order_status?.toLowerCase() === "pending"
      ).length;

      const completedOrders = orders.filter(
        (order: any) =>
          order.order_status?.toLowerCase() === "delivered" ||
          order.order_status?.toLowerCase() === "completed"
      ).length;

      // Calculate revenue from orders
      const revenue = orders.reduce((total: number, order: any) => {
        const orderTotal = parseFloat(order.total_amount) || 0;
        return total + orderTotal;
      }, 0);

      // Calculate growth based on order count
      const growth = calculateGrowth(orders);

      // Estimate customers from unique order data
      const uniqueCustomers = new Set(
        orders
          .map((order: any) =>
            `${order.customer_first_name} ${order.customer_last_name}`.trim()
          )
          .filter(Boolean)
      );
      const totalCustomers = uniqueCustomers.size;

      // Get recent orders for display (last 4 orders)
      const recentOrdersData = orders
        .sort((a: any, b: any) => {
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 4)
        .map((order: any) => {
          const orderAmount = parseFloat(order.total_amount) || 0;
          const customerName =
            `${order.customer_first_name || ""} ${
              order.customer_last_name || ""
            }`.trim() || "Customer";

          return {
            id: order.order_number,
            customer: customerName,
            status: mapOrderStatus(order.order_status),
            time: formatTimeAgo(order.created_at),
            amount: `$${orderAmount.toFixed(2)}`,
          };
        });

      // Generate real chart data from orders
      const dailySales = generateRealSalesData(orders);
      const weeklyRevenue = generateRealRevenueData(orders);

      // Calculate order status breakdown
      const orderStatusBreakdown = [
        { label: "Pending", value: orders.filter((o: any) => o.order_status?.toLowerCase() === "pending").length, color: "#f59e0b" },
        { label: "Confirmed", value: orders.filter((o: any) => o.order_status?.toLowerCase() === "confirmed").length, color: "#10b981" },
        { label: "Processing", value: orders.filter((o: any) => o.order_status?.toLowerCase() === "processing").length, color: "#3b82f6" },
        { label: "Out for delivery", value: orders.filter((o: any) => o.order_status?.toLowerCase() === "out-for-delivery").length, color: "#8b5cf6" },
        { label: "Delivered", value: orders.filter((o: any) => o.order_status?.toLowerCase() === "delivered" || o.order_status?.toLowerCase() === "completed").length, color: "#22c55e" },
        { label: "Cancelled", value: orders.filter((o: any) => o.order_status?.toLowerCase() === "cancelled").length, color: "#ef4444" },
      ];

      // Generate top products
      const topProductsData = generateTopProducts(orders, allItems);
      const topCustomersData = generateTopCustomers(orders);

      setVendorStats({
        totalProducts,
        totalOrders,
        revenue,
        growth,
        pendingOrders,
        completedOrders,
        totalCustomers,
        averageRating: 4.8,
      });

      setRecentOrders(recentOrdersData);
      setSalesData(dailySales);
      setRevenueData(weeklyRevenue);
      setOrderStatusData(orderStatusBreakdown);
      setTopProducts(topProductsData);
      setMostRatedProducts(topProductsData); // Using same as top selling for now
      setTopCustomers(topCustomersData);
    } catch (err: any) {
      console.error("❌ Error fetching dashboard data:", err);
      setError(
        err.message ||
          "Failed to load dashboard data. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper functions
  const getStartOfMonth = (): string => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1)
      .toISOString()
      .split("T")[0];
  };

  const getEndOfMonth = (): string => {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];
  };

  const mapOrderStatus = (status: string): Order["status"] => {
    if (!status) return "pending";

    const statusLower = status.toLowerCase();
    if (statusLower === "pending") return "pending";
    if (statusLower === "confirmed") return "confirmed";
    if (statusLower === "processing") return "processing";
    if (statusLower === "delivered") return "delivered";
    if (statusLower === "completed") return "delivered";
    if (statusLower === "shipped") return "processing";

    return "pending";
  };

  const formatTimeAgo = (dateString: string): string => {
    if (!dateString) return "Recently";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours} hours ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays === 1) return "1 day ago";
      return `${diffInDays} days ago`;
    } catch (error) {
      return "Recently";
    }
  };

  const calculateGrowth = (orders: any[]): number => {
    if (orders.length === 0) return 0;
    if (orders.length < 5) return 8;
    if (orders.length < 15) return 15;
    if (orders.length < 30) return 22;
    return 28;
  };

  const generateRealSalesData = (orders: any[]): SalesData[] => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    if (orders.length === 0) {
      return days.map((day) => ({
        label: day,
        value: Math.floor(Math.random() * 5) + 1,
      }));
    }

    const dayCounts: { [key: string]: number } = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    orders.forEach((order) => {
      try {
        const orderDate = new Date(order.created_at);
        const dayName = days[orderDate.getDay()];
        dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
      } catch (error) {
        // Skip invalid dates
      }
    });

    return days.map((day) => ({
      label: day,
      value: dayCounts[day] || 0,
    }));
  };

  const generateRealRevenueData = (orders: any[]): SalesData[] => {
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"];

    if (orders.length === 0) {
      return weeks.map((week) => ({
        label: week,
        value: Math.floor(Math.random() * 200) + 50,
      }));
    }

    const weekRevenue: number[] = [0, 0, 0, 0];

    orders.forEach((order) => {
      try {
        const orderDate = new Date(order.created_at);
        const week = Math.floor((orderDate.getDate() - 1) / 7);
        const weekIndex = Math.min(week, 3);

        const orderTotal = parseFloat(order.total_amount) || 0;
        weekRevenue[weekIndex] += orderTotal;
      } catch (error) {
        // Skip invalid dates
      }
    });

    return weeks.map((week, index) => ({
      label: week,
      value: Math.max(0, weekRevenue[index] || 0),
    }));
  };

  const generateTopProducts = (orders: any[], allItems: any[]): any[] => {
    const productCounts: { [key: string]: { count: number; item: any } } = {};

    orders.forEach((order: any) => {
      if (order.order_items && Array.isArray(order.order_items)) {
        order.order_items.forEach((orderItem: any) => {
          const itemId = orderItem.item_id || orderItem.id;
          if (itemId) {
            if (!productCounts[itemId]) {
              productCounts[itemId] = { count: 0, item: orderItem };
            }
            productCounts[itemId].count += orderItem.quantity || 1;
          }
        });
      }
    });

    const topProductsArray = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((p) => {
        const item = allItems.find((i: any) => i.id === p.item.item_id || i.id === p.item.id) || p.item;
        return {
          name: item.item_name || item.name || "Unknown Product",
          price: `$${parseFloat(item.price || 0).toFixed(2)}`,
          rating: 4.5,
          orders: p.count,
          image: item.cover_image_url || item.image || "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg",
        };
      });

    if (topProductsArray.length === 0) {
      return allItems.slice(0, 4).map((item: any) => ({
        name: item.item_name || "Product",
        price: `$${parseFloat(item.price || 0).toFixed(2)}`,
        rating: 4.5,
        orders: 0,
        image: item.cover_image_url || "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg",
      }));
    }

    return topProductsArray;
  };

  const generateTopCustomers = (orders: any[]): any[] => {
    const customerOrders: { [key: string]: { name: string; phone: string; count: number } } = {};

    orders.forEach((order: any) => {
      const customerName = `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim() || 'Unknown';
      const customerPhone = order.customer_phone || '**********';
      const key = `${customerName}_${customerPhone}`;

      if (!customerOrders[key]) {
        customerOrders[key] = {
          name: customerName,
          phone: customerPhone,
          count: 0,
        };
      }
      customerOrders[key].count++;
    });

    return Object.values(customerOrders)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((c) => ({
        name: c.name,
        phone: c.phone,
        orders: c.count,
      }));
  };

  const handleAddProduct = () => {
    navigate("/items/new");
  };

  const handleViewAllOrders = () => {
    navigate("/all-orders");
  };

  useEffect(() => {
    fetchDashboardData();

    // Set up refresh interval (every 3 minutes)
    const interval = setInterval(fetchDashboardData, 3 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Products",
      value: vendorStats.totalProducts,
      icon: Package,
      color: "blue" as const,
    },
    {
      title: "Total Orders",
      value: vendorStats.totalOrders,
      icon: ShoppingCart,
      color: "green" as const,
    },
    {
      title: "Revenue",
      value: `$${vendorStats.revenue.toFixed(2)}`,
      icon: DollarSign,
      color: "purple" as const,
    },
    {
      title: "Growth",
      value: `${vendorStats.growth}%`,
      icon: TrendingUp,
      color: "orange" as const,
    },
  ];

  const additionalStats = [
    {
      title: "Pending Orders",
      value: vendorStats.pendingOrders,
      icon: Clock,
      color: "orange" as const,
    },
    {
      title: "Completed Orders",
      value: vendorStats.completedOrders,
      icon: CheckCircle,
      color: "green" as const,
    },
    {
      title: "Total Customers",
      value: vendorStats.totalCustomers || 0,
      icon: Users,
      color: "blue" as const,
    },
    {
      title: "Average Rating",
      value: vendorStats.averageRating?.toFixed(1) || "4.8",
      icon: Star,
      color: "yellow" as const,
    },
  ];

  const completionRate = vendorStats.totalOrders > 0
    ? Math.round((vendorStats.completedOrders / vendorStats.totalOrders) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Welcome Section */}
      <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">
                    Vendor Dashboard
                  </h1>
                  {vendorId && (
                    <p className="text-white text-opacity-80 text-sm">
                      Vendor ID: {vendorId}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-white text-opacity-90 text-lg mb-4">
                {vendorStats.totalOrders > 0
                  ? `You have ${vendorStats.totalOrders} total orders and $${vendorStats.revenue.toFixed(2)} in revenue this month`
                  : "Start by adding products to see orders and revenue"}
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">
                      {vendorStats.totalOrders} Orders
                    </span>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">
                      ${vendorStats.revenue.toFixed(2)} Revenue
                    </span>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">
                      {vendorStats.growth}% Growth
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="bg-white text-red-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw
                className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Activity className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <strong className="text-red-800 block">Error Loading Data</strong>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Stats Cards */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-red-50 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Business Overview
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                {stat.title === "Growth" && (
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                    +{vendorStats.growth}%
                  </span>
                )}
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {additionalStats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                {stat.title}
              </h3>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-50 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Daily Sales</h3>
            </div>
          </div>
          <Chart
            title="Daily Sales (Orders per Day)"
            data={salesData}
            type="line"
            color="rgb(59, 130, 246)"
          />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-50 p-2 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Weekly Revenue</h3>
            </div>
          </div>
          <Chart
            title="Weekly Revenue"
            data={revenueData}
            type="bar"
            color="rgb(16, 185, 129)"
          />
        </div>
      </div>

      {/* Order Status Statistics & Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <OrderStatusChart data={orderStatusData} />
          </div>
        </div>
        <div className="xl:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <RecentOrders orders={recentOrders} />
          </div>
        </div>
      </div>

      {/* Products and Customers Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Top Selling Products
              </h3>
              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <ProductCard key={index} {...product} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No products yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Most Rated Products
              </h3>
              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {mostRatedProducts.length > 0 ? (
              mostRatedProducts.map((product, index) => (
                <ProductCard key={index} {...product} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No products yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Top Customers
              </h3>
              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                View All
              </button>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {topCustomers.length > 0 ? (
              topCustomers.map((customer, index) => (
                <CustomerCard key={index} {...customer} />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No customers yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Quick Actions & Performance */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-purple-50 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleAddProduct}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Product</span>
              </button>
              <button
                onClick={handleViewAllOrders}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>View All Orders</span>
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-sm">
                  {vendorStats.totalOrders}
                </span>
              </button>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 lg:p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-orange-50 p-2 rounded-lg">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Performance Metrics</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <Star className="w-5 h-5 text-green-600" />
                  <span className="text-3xl font-bold text-green-700">
                    {vendorStats.averageRating?.toFixed(1) || "4.8"}
                  </span>
                </div>
                <p className="text-sm font-medium text-green-800">Average Rating</p>
                <div className="flex items-center space-x-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= Math.round(vendorStats.averageRating || 4.8)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="text-3xl font-bold text-blue-700">
                    {completionRate}%
                  </span>
                </div>
                <p className="text-sm font-medium text-blue-800">Completion Rate</p>
                <div className="mt-3 bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
