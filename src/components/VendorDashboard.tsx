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

  // Image base URL from environment variable
  const IMAGE_BASE_URL = ((import.meta.env.VITE_IMAGE_BASE_URL as string) || "https://groceryapp-production-d3fc.up.railway.app").trim().replace(/\/+$/, "");

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string | undefined | null): string => {
    if (!imagePath) return "";
    const trimmedPath = imagePath.trim();
    if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
      return trimmedPath;
    }
    const cleanPath = trimmedPath.startsWith("/") ? trimmedPath.substring(1) : trimmedPath;
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  };

  // Fetch vendor dashboard data using new APIs
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

      // Fetch data from new vendor dashboard and analytics APIs
      const [dashboardResponse, analyticsResponse] = await Promise.all([
        apiService.getVendorDashboard(),
        apiService.getVendorAnalytics(),
      ]);

      if (dashboardResponse.errorCode !== 0 || !dashboardResponse.data) {
        throw new Error(dashboardResponse.errorMessage || "Failed to load dashboard data");
      }

      if (analyticsResponse.errorCode !== 0 || !analyticsResponse.data) {
        throw new Error(analyticsResponse.errorMessage || "Failed to load analytics data");
      }

      const dashboardData = dashboardResponse.data;
      const analyticsData = analyticsResponse.data;

      // Map dashboard data to vendor stats
      setVendorStats({
        totalProducts: dashboardData.total_items || 0,
        totalOrders: dashboardData.total_orders || 0,
        revenue: dashboardData.total_revenue || 0,
        growth: calculateGrowthFromRevenue(dashboardData.weekly_revenue || 0),
        pendingOrders: dashboardData.pending_orders || 0,
        completedOrders: dashboardData.completed_orders || 0,
        totalCustomers: dashboardData.total_customers || 0,
        averageRating: 4.8, // Not provided by API, keeping default
      });

      // Map recent orders
      const recentOrdersData = (dashboardData.recent_orders || []).slice(0, 4).map((order: any) => ({
        id: order.order_number,
        customer: `${order.customer?.first_name || ""} ${order.customer?.last_name || ""}`.trim() || "Customer",
        status: mapOrderStatus(order.order_status),
        time: formatTimeAgo(order.created_at),
        amount: `$${parseFloat(String(order.total_amount || 0)).toFixed(2)}`,
      }));
      setRecentOrders(recentOrdersData);

      // Map daily sales data
      const dailySales = mapDailySalesData(dashboardData.daily_sales || []);
      setSalesData(dailySales);

      // Map weekly revenue (using weekly_revenue from dashboard)
      const weeklyRevenue = [
        { label: "Week 1", value: Math.floor((dashboardData.weekly_revenue || 0) * 0.3) },
        { label: "Week 2", value: Math.floor((dashboardData.weekly_revenue || 0) * 0.25) },
        { label: "Week 3", value: Math.floor((dashboardData.weekly_revenue || 0) * 0.25) },
        { label: "Week 4", value: Math.floor((dashboardData.weekly_revenue || 0) * 0.2) },
      ];
      setRevenueData(weeklyRevenue);

      // Map order status breakdown
      const statusCounts = dashboardData.status_counts || {};
      const orderStatusBreakdown = [
        { label: "Pending", value: statusCounts.Pending || 0, color: "#f59e0b" },
        { label: "Confirmed", value: statusCounts.Confirmed || 0, color: "#10b981" },
        { label: "Processing", value: statusCounts.Processing || 0, color: "#3b82f6" },
        { label: "Out for delivery", value: statusCounts["Out for delivery"] || 0, color: "#8b5cf6" },
        { label: "Delivered", value: statusCounts.Delivered || 0, color: "#22c55e" },
        { label: "Cancelled", value: statusCounts.Cancelled || 0, color: "#ef4444" },
      ];
      setOrderStatusData(orderStatusBreakdown);

      // Map top selling products from analytics
      const topProductsData = (analyticsData.top_selling_products || []).slice(0, 4).map((product: any) => ({
        name: product.item_name || "Unknown Product",
        price: `$${parseFloat(String(product.avg_price || 0)).toFixed(2)}`,
        rating: 4.5, // Not provided by API
        orders: product.orders_count || 0,
        image: getImageUrl(product.cover_image_url),
      }));
      setTopProducts(topProductsData);

      // Map most rated products (empty array from API, using top selling as fallback)
      const mostRatedProductsData = (analyticsData.most_rated_products || []).slice(0, 4).map((product: any) => ({
        name: product.item_name || "Unknown Product",
        price: `$${parseFloat(String(product.avg_price || 0)).toFixed(2)}`,
        rating: product.rating || 4.5,
        orders: product.orders_count || 0,
        image: getImageUrl(product.cover_image_url),
      }));
      setMostRatedProducts(mostRatedProductsData.length > 0 ? mostRatedProductsData : topProductsData);

      // Map top customers from analytics
      const topCustomersData = (analyticsData.top_customers || []).slice(0, 4).map((customer: any) => ({
        name: `${customer.first_name || ""} ${customer.last_name || ""}`.trim() || "Customer",
        phone: customer.phone || "**********",
        orders: customer.orders_count || 0,
      }));
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

  const calculateGrowthFromRevenue = (weeklyRevenue: number): number => {
    if (weeklyRevenue === 0) return 0;
    if (weeklyRevenue < 50) return 8;
    if (weeklyRevenue < 100) return 15;
    if (weeklyRevenue < 200) return 22;
    return 28;
  };

  const mapDailySalesData = (dailySales: Array<{ day_of_week: number; day_name: string; orders_count: number; revenue: number }>): SalesData[] => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const dayMap: { [key: string]: string } = {
      "Monday": "Mon",
      "Tuesday": "Tue",
      "Wednesday": "Wed",
      "Thursday": "Thu",
      "Friday": "Fri",
      "Saturday": "Sat",
      "Sunday": "Sun",
    };

    // Initialize all days with 0
    const dayCounts: { [key: string]: number } = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    };

    // Map API data to day counts
    dailySales.forEach((day) => {
      const dayKey = dayMap[day.day_name] || days[day.day_of_week] || "Mon";
      dayCounts[dayKey] = day.orders_count || 0;
    });

    return days.map((day) => ({
      label: day,
      value: dayCounts[day] || 0,
    }));
  };


  const handleAddProduct = () => {
    navigate("/items");
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
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
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
