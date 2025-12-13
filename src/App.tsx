import React, { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import OTPVerificationPage from "./components/OTPVerificationPage";
import ProfilePage from "./components/ProfilePage";
import OrdersPage from "./components/OrdersPage";
import OrderDetailPage from "./components/OrderDetailPage";
import POSPage from "./components/POSPage";
import CustomerPage from "./components/CustomerPage";
import DeliverymanListPage from "./components/DeliverymanListPage";
import AddDeliverymanPage from "./components/AddDeliverymanPage";
import DeliverymanDetailPage from "./components/DeliverymanDetailPage";
import EditDeliverymanPage from "./components/EditDeliverymanPage";
import JoiningRequestPage from "./components/JoiningRequestPage";
import DeliverymanReviewsPage from "./components/DeliverymanReviewsPage";
import GenericPage from "./components/GenericPage";
import StatsCard from "./components/StatsCard";
import Chart from "./components/Chart";
import ProductCard from "./components/ProductCard";
import CustomerCard from "./components/CustomerCard";
import OrderStatusChart from "./components/OrderStatusChart";
import RecentOrders from "./components/RecentOrders";
import VendorDashboard from "./components/VendorDashboard";
import VendorsPage from "./components/VendorsPage";
import AddVendorPage from "./components/AddVendorPage";
import VendorDetailPage from "./components/VendorDetailPage";
import EditVendorPage from "./components/EditVendorPage";
import CategoriesPage from "./components/CategoriesPage";
import CategoryDetailPage from "./components/CategoryDetailPage";
import ItemsPage from "./components/ItemsPage";
import ItemDetailPage from "./components/ItemDetailPage";
import {
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Gift,
  Bell,
} from "lucide-react";
import DeleteConfirmationPage from "./components/DeleteConfirmationPage";
import PrivacyPolicyPage from "./components/PrivacyPolicyPage";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState<
    "login" | "signup" | "forgot-password" | "otp-verification"
  >("login");
  const [otpEmail, setOtpEmail] = useState("");

  // Persist userRole in localStorage
  const [userRole, setUserRole] = useState<"admin" | "vendor">(
    (localStorage.getItem("user_role") as "admin" | "vendor") || "admin"
  );

  // Check for existing authentication and user role on app load
  React.useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const savedRole = localStorage.getItem("user_role");
    if (token && savedRole) {
      setIsAuthenticated(true);
      setUserRole(savedRole as "admin" | "vendor");
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setAuthMode("login");
  };

  const handleSignup = () => {
    setIsAuthenticated(true);
    setAuthMode("login");
  };

  const handleOTPVerified = (token: string, user: any) => {
    localStorage.setItem("auth_token", token);
    const userRole = user.role.toLowerCase();
    if (userRole === "admin" || userRole === "vendor") {
      setUserRole(userRole as "admin" | "vendor");
      localStorage.setItem("user_role", userRole);
    } else {
      console.warn(`Unexpected user role: ${user.role}, defaulting to vendor`);
      setUserRole("vendor");
      localStorage.setItem("user_role", "vendor");
    }
    setIsAuthenticated(true);
    setAuthMode("login");
  };

  const handleRoleSelect = (role: "admin" | "vendor") => {
    setUserRole(role);
    localStorage.setItem("user_role", role);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_role");
    setIsAuthenticated(false);
    setUserRole("admin");
    setAuthMode("login");
    navigate("/dashboard");
  };

  const handleProfileAction = (action: "profile" | "logout" | "login") => {
    switch (action) {
      case "profile":
        navigate("/profile");
        break;
      case "logout":
        handleLogout();
        break;
      case "login":
        setAuthMode("login");
        setIsAuthenticated(false);
        break;
    }
  };

  // Show authentication pages if not authenticated
  if (!isAuthenticated) {
    switch (authMode) {
      case "login":
        return (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToSignup={() => setAuthMode("signup")}
            onRoleSelect={handleRoleSelect}
            onForgotPassword={() => setAuthMode("forgot-password")}
            onOTPRequired={(email) => {
              setOtpEmail(email);
              setAuthMode("otp-verification");
            }}
          />
        );
      case "signup":
        return (
          <SignupPage
            onSignup={handleSignup}
            onSwitchToLogin={() => setAuthMode("login")}
            onRoleSelect={handleRoleSelect}
          />
        );
      case "forgot-password":
        return <ForgotPasswordPage onBack={() => setAuthMode("login")} />;
      case "otp-verification":
        return (
          <OTPVerificationPage
            email={otpEmail}
            onBack={() => setAuthMode("login")}
            onVerified={handleOTPVerified}
          />
        );
      default:
        return (
          <LoginPage
            onLogin={handleLogin}
            onSwitchToSignup={() => setAuthMode("signup")}
            onRoleSelect={handleRoleSelect}
            onForgotPassword={() => setAuthMode("forgot-password")}
            onOTPRequired={(email) => {
              setOtpEmail(email);
              setAuthMode("otp-verification");
            }}
          />
        );
    }
  }

  // Main authenticated app with routing
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeSection={location.pathname.slice(1) || "dashboard"}
        onSectionChange={(section) => navigate(`/${section}`)}
        userRole={userRole}
      />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header onProfileAction={handleProfileAction} userRole={userRole} />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route
              path="/dashboard"
              element={
                userRole === "vendor" ? (
                  <VendorDashboard />
                ) : (
                  <DashboardContent />
                )
              }
            />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/items" element={<ItemsPage />} />
            <Route path="/items/new" element={<ItemsPage />} />
            <Route path="/items/update" element={<ItemsPage />} />
            <Route path="/items/:id" element={<ItemDetailPage />} />
            <Route path="/categories/new" element={<CategoriesPage />} />
            <Route path="/categories/update" element={<CategoriesPage />} />
            <Route
              path="/categories/:id"
              element={
                <CategoryDetailPage
                  onBack={() => navigate("/categories")}
                  onEdit={(id) => console.log("Edit category", id)}
                  onDelete={(id) => console.log("Delete category", id)}
                />
              }
            />
            <Route path="/customer" element={<CustomerPage />} />
            <Route path="/deliveryman" element={<DeliverymanListPage />} />
            <Route
              path="/delivery-man-list"
              element={<DeliverymanListPage />}
            />
            <Route
              path="/delivery-man-list/:id"
              element={<DeliverymanDetailPage />}
            />
            <Route
              path="/delivery-man-list/edit/:id"
              element={<EditDeliverymanPage />}
            />
            <Route
              path="/add-new-delivery-man"
              element={<AddDeliverymanPage />}
            />
            <Route
              path="/new-joining-request"
              element={<JoiningRequestPage />}
            />
            <Route
              path="/delivery-man-reviews"
              element={<DeliverymanReviewsPage />}
            />
            <Route
              path="/vendors"
              element={
                <VendorsPage onAddVendor={() => navigate("/vendors/new")} />
              }
            />
            <Route path="/vendors/:id" element={<VendorDetailPage />} />
            <Route path="/vendors/edit/:id" element={<EditVendorPage />} />
            <Route
              path="/vendors/new"
              element={<AddVendorPage onBack={() => navigate("/vendors")} />}
            />
            <Route
              path="/profile"
              element={<ProfilePage onBack={() => navigate(-1)} />}
            />
            <Route
              path="/delete-confirmation"
              element={<DeleteConfirmationPage />}
            />
            <Route
              path="/coupon"
              element={
                <GenericPage
                  title="Coupon Management"
                  description="Create discount coupons and promotional codes to boost sales. Set up percentage discounts, fixed amount discounts, and special promotional offers for your customers."
                  icon={<Gift className="w-16 h-16 text-green-500" />}
                />
              }
            />
            <Route
              path="/notification"
              element={
                <GenericPage
                  title="Send Notifications"
                  description="Send push notifications and alerts to your customers. Keep them informed about order updates, special offers, and important announcements."
                  icon={<Bell className="w-16 h-16 text-orange-500" />}
                />
              }
            />
            <Route
              path="/all-orders"
              element={<OrdersPage orderType="all-orders" />}
            />
            <Route path="/order/:id" element={<OrderDetailPage />} />
            <Route
              path="/*-orders"
              element={<OrdersPage orderType={location.pathname.slice(1)} />}
            />
            <Route
              path="*"
              element={
                <GenericPage
                  title="Page Not Found"
                  description="The page you're looking for doesn't exist or is under development."
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

// Dashboard content component
function DashboardContent() {
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({
    pending: 0,
    confirmed: 0,
    processing: 0,
    outForDelivery: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
    failed: 0,
  });
  const [orders, setOrders] = React.useState<any[]>([]);
  const [items, setItems] = React.useState<any[]>([]);

  // Fetch dashboard data
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Create apiService instance
        const { apiService } = await import('./services/api');

        // Fetch orders and items
        const [ordersResponse, itemsResponse] = await Promise.all([
          apiService.getAllOrders({ page: 1, limit: 1000 }),
          apiService.getAllItems(),
        ]);

        // Process orders
        let allOrders: any[] = [];
        if (ordersResponse.data?.data?.orders && Array.isArray(ordersResponse.data.data.orders)) {
          allOrders = ordersResponse.data.data.orders;
        } else if (ordersResponse.data?.orders && Array.isArray(ordersResponse.data.orders)) {
          allOrders = ordersResponse.data.orders;
        }

        // Process items
        const allItems = itemsResponse.data?.items || [];

        // Calculate stats from orders
        const newStats = {
          pending: allOrders.filter((o: any) => o.order_status?.toLowerCase() === 'pending').length,
          confirmed: allOrders.filter((o: any) => o.order_status?.toLowerCase() === 'confirmed').length,
          processing: allOrders.filter((o: any) => o.order_status?.toLowerCase() === 'processing').length,
          outForDelivery: allOrders.filter((o: any) => o.order_status?.toLowerCase() === 'out-for-delivery').length,
          delivered: allOrders.filter((o: any) => o.order_status?.toLowerCase() === 'delivered').length,
          cancelled: allOrders.filter((o: any) => o.order_status?.toLowerCase() === 'cancelled').length,
          returned: allOrders.filter((o: any) => o.order_status?.toLowerCase() === 'returned').length,
          failed: allOrders.filter((o: any) => o.order_status?.toLowerCase() === 'failed').length,
        };

        setStats(newStats);
        setOrders(allOrders);
        setItems(allItems);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper functions to generate chart data
  const generateMonthlyOrderData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const monthlyCounts: number[] = Array(12).fill(0);

    orders.forEach((order: any) => {
      try {
        const orderDate = new Date(order.created_at);
        if (orderDate.getFullYear() === currentYear) {
          const month = orderDate.getMonth();
          monthlyCounts[month]++;
        }
      } catch (error) {
        // Skip invalid dates
      }
    });

    return months.map((label, index) => ({
      label,
      value: monthlyCounts[index],
    }));
  };

  const generateMonthlyEarningsData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentYear = new Date().getFullYear();
    const monthlyEarnings: number[] = Array(12).fill(0);

    orders.forEach((order: any) => {
      try {
        const orderDate = new Date(order.created_at);
        if (orderDate.getFullYear() === currentYear) {
          const month = orderDate.getMonth();
          const amount = parseFloat(order.total_amount) || 0;
          monthlyEarnings[month] += amount;
        }
      } catch (error) {
        // Skip invalid dates
      }
    });

    return months.map((label, index) => ({
      label,
      value: Math.round(monthlyEarnings[index]),
    }));
  };

  const generateTopProducts = () => {
    // Count order items to find top selling products
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

    // Convert to array and sort by count
    const topProductsArray = Object.values(productCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map((p) => {
        const item = items.find((i: any) => i.id === p.item.item_id) || p.item;
        return {
          name: item.item_name || item.name || "Unknown Product",
          price: `$${parseFloat(item.price || 0).toFixed(2)}`,
          rating: 4.5,
          orders: p.count,
          image: item.cover_image_url || item.image || "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg",
        };
      });

    // Return default if no products
    if (topProductsArray.length === 0) {
      return items.slice(0, 4).map((item: any) => ({
        name: item.item_name || "Product",
        price: `$${parseFloat(item.price || 0).toFixed(2)}`,
        rating: 4.5,
        orders: 0,
        image: item.cover_image_url || "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg",
      }));
    }

    return topProductsArray;
  };

  const generateTopCustomers = () => {
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

  const generateRecentOrders = () => {
    return orders
      .sort((a: any, b: any) => {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 5)
      .map((order: any) => {
        const customerName = `${order.customer_first_name || ''} ${order.customer_last_name || ''}`.trim() || 'Customer';
        const amount = parseFloat(order.total_amount) || 0;

        // Format time ago
        let timeAgo = 'Recently';
        try {
          const orderDate = new Date(order.created_at);
          const now = new Date();
          const diffMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));

          if (diffMinutes < 1) timeAgo = 'Just now';
          else if (diffMinutes < 60) timeAgo = `${diffMinutes} mins ago`;
          else if (diffMinutes < 1440) timeAgo = `${Math.floor(diffMinutes / 60)} hours ago`;
          else timeAgo = `${Math.floor(diffMinutes / 1440)} days ago`;
        } catch (e) {}

        const statusMap: { [key: string]: "pending" | "confirmed" | "processing" | "delivered" | "cancelled" } = {
          'pending': 'pending',
          'confirmed': 'confirmed',
          'processing': 'processing',
          'delivered': 'delivered',
          'cancelled': 'cancelled',
        };

        return {
          id: order.order_number || order.id,
          customer: customerName,
          status: statusMap[order.order_status?.toLowerCase()] || 'pending',
          time: timeAgo,
          amount: `$${amount.toFixed(2)}`,
        };
      });
  };

  // Generate dynamic data from orders and items
  const orderChartData = generateMonthlyOrderData();
  const earningsChartData = generateMonthlyEarningsData();
  const orderStatusData = [
    { label: "Pending", value: stats.pending, color: "#f59e0b" },
    { label: "Confirmed", value: stats.confirmed, color: "#10b981" },
    { label: "Processing", value: stats.processing, color: "#3b82f6" },
    { label: "Out for delivery", value: stats.outForDelivery, color: "#8b5cf6" },
    { label: "Delivered", value: stats.delivered, color: "#22c55e" },
    { label: "Cancelled", value: stats.cancelled, color: "#ef4444" },
  ];
  const topProducts = generateTopProducts();
  const mostRatedProducts = topProducts; // Using same as top selling for now
  const topCustomers = generateTopCustomers();
  const recentOrders = generateRecentOrders();

  // Demo data for dashboard (will be replaced with real data)
  const orderStats = [
    { title: "Pending", value: stats.pending, icon: Clock, color: "orange" as const },
    {
      title: "Confirmed",
      value: stats.confirmed,
      icon: CheckCircle,
      color: "green" as const,
    },
    { title: "Processing", value: stats.processing, icon: Package, color: "blue" as const },
    {
      title: "Out for delivery",
      value: stats.outForDelivery,
      icon: Truck,
      color: "purple" as const,
    },
  ];

  const additionalStats = [
    {
      title: "Delivered",
      value: stats.delivered,
      icon: CheckCircle,
      color: "green" as const,
    },
    { title: "Cancelled", value: stats.cancelled, icon: XCircle, color: "red" as const },
    { title: "Returned", value: stats.returned, icon: RotateCcw, color: "gray" as const },
    {
      title: "Failed to Deliver",
      value: stats.failed,
      icon: AlertTriangle,
      color: "red" as const,
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl text-white p-6 lg:p-8">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">
          Welcome back, Admin! 👋
        </h1>
        <p className="text-red-100">
          Monitor your business analytics and manage your food delivery
          operations
        </p>
      </div>

      {/* Business Analytics */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-6">
          Business Analytics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          {orderStats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {additionalStats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Chart title="Order Statistics" data={orderChartData} type="line" />
        <Chart
          title="Earnings Statistics"
          data={earningsChartData}
          type="bar"
          color="rgb(34, 197, 94)"
        />
      </div>

      {/* Order Status and Recent Orders */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1">
          <OrderStatusChart data={orderStatusData} />
        </div>
        <div className="xl:col-span-2">
          <RecentOrders orders={recentOrders} />
        </div>
      </div>

      {/* Products and Customers Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200">
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
            {topProducts.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
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
            {mostRatedProducts.map((product, index) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
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
            {topCustomers.map((customer, index) => (
              <CustomerCard key={index} {...customer} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
