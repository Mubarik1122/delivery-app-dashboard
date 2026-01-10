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
import AddonsPage from "./components/AddonsPage";
import FlavorsPage from "./components/FlavorsPage";
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
  Users,
  DollarSign,
  TrendingUp,
  Activity,
  Search,
  Store,
  Loader2,
  PackageCheck,
} from "lucide-react";
import DeleteConfirmationPage from "./components/DeleteConfirmationPage";
import PrivacyPolicyPage from "./components/PrivacyPolicyPage";
import LandingPage from "./components/LandingPage";

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

  // User profile data for header
  const [userFirstName, setUserFirstName] = useState<string | undefined>(undefined);
  const [userRestaurantImage, setUserRestaurantImage] = useState<string | undefined>(undefined);
  const [userIsFood, setUserIsFood] = useState<boolean | undefined>(undefined);

  // Fetch user profile data when authenticated (skip if on profile page to avoid duplicate calls)
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) return;

      // Skip API call if we're on profile page (ProfilePage will fetch it)
      if (location.pathname === '/profile') return;

      try {
        const { apiService } = await import('./services/api');
        const response = await apiService.getProfileData();
        
        if (response.errorCode === 0 && response.data) {
          const userData = Array.isArray(response.data) ? response.data[0] : response.data;
          setUserFirstName(userData.first_name);
          setUserRestaurantImage(userData.restaurant_image);
          setUserIsFood(userData.is_food === true);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    if (isAuthenticated) {
      fetchUserProfile();
    }
  }, [isAuthenticated, location.pathname]);

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
    navigate("/dashboard");
  };

  const handleSignup = () => {
    setIsAuthenticated(true);
    setAuthMode("login");
    navigate("/dashboard");
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
    navigate("/dashboard");
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
    setUserFirstName(undefined);
    setUserRestaurantImage(undefined);
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

  // Show landing page if on root route and not authenticated
  if (location.pathname === "/" && !isAuthenticated) {
    return <LandingPage />;
  }

  // Show privacy policy page (public access)
  if (location.pathname === "/privacy-policy") {
    return <PrivacyPolicyPage />;
  }

  // Redirect /login to /admin-access
  if (location.pathname === "/login") {
    return <Navigate to="/admin-access" replace />;
  }

  // If authenticated and on root or admin-access, redirect to dashboard
  if (isAuthenticated && (location.pathname === "/" || location.pathname === "/admin-access")) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show authentication pages if not authenticated and on admin-access route
  if (!isAuthenticated && location.pathname === "/admin-access") {
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

  // If not authenticated and not on allowed routes, redirect to landing
  if (!isAuthenticated && location.pathname !== "/admin-access" && location.pathname !== "/" && location.pathname !== "/privacy-policy") {
    return <Navigate to="/" replace />;
  }

  // Main authenticated app with routing
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeSection={location.pathname.slice(1) || "dashboard"}
        onSectionChange={(section) => navigate(`/${section}`)}
        userRole={userRole}
        isFood={userIsFood}
      />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header 
          onProfileAction={handleProfileAction} 
          userRole={userRole}
          firstName={userFirstName}
          restaurantImage={userRestaurantImage}
        />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Routes>
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
            <Route path="/addons" element={<AddonsPage />} />
            <Route path="/flavors" element={<FlavorsPage />} />
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
  const [vendors, setVendors] = React.useState<any[]>([]);
  const [vendorStats, setVendorStats] = React.useState<{
    [vendorId: number]: {
      vendorName: string;
      pending: number;
      confirmed: number;
      processing: number;
      outForDelivery: number;
      delivered: number;
      cancelled: number;
      totalAmount: number;
      vendorCommission: number;
      adminCommission: number;
    };
  }>({});
  const [adminCommissionPercentage] = React.useState(10); // Admin gets 10% commission
  const [searchQuery, setSearchQuery] = React.useState("");

  // Get current month date range
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

  // Fetch dashboard data
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Create apiService instance
        const { apiService } = await import('./services/api');

        // Fetch vendors and orders for current month
        const [vendorsResponse, ordersResponse] = await Promise.all([
          apiService.getUsers('Vendor'),
          apiService.getAllOrders({
            start_date: getStartOfMonth(),
            end_date: getEndOfMonth(),
            page: 1,
            limit: 10000,
          }),
        ]);

        // Process vendors
        const allVendors = vendorsResponse.data?.users || vendorsResponse.data || [];
        setVendors(allVendors);

        // Process orders
        let allOrders: any[] = [];
        if (ordersResponse.data?.data?.orders && Array.isArray(ordersResponse.data.data.orders)) {
          allOrders = ordersResponse.data.data.orders;
        } else if (ordersResponse.data?.orders && Array.isArray(ordersResponse.data.orders)) {
          allOrders = ordersResponse.data.orders;
        }

        // Calculate stats for each vendor
        const statsByVendor: {
          [vendorId: number]: {
            vendorName: string;
            pending: number;
            confirmed: number;
            processing: number;
            outForDelivery: number;
            delivered: number;
            cancelled: number;
            totalAmount: number;
            vendorCommission: number;
            adminCommission: number;
          };
        } = {};

        // Initialize stats for each vendor
        allVendors.forEach((vendor: any) => {
          const vendorId = vendor.id || vendor.user_id;
          statsByVendor[vendorId] = {
            vendorName: vendor.restaurant_name || `${vendor.first_name} ${vendor.last_name}` || 'Unknown Vendor',
            pending: 0,
            confirmed: 0,
            processing: 0,
            outForDelivery: 0,
            delivered: 0,
            cancelled: 0,
            totalAmount: 0,
            vendorCommission: 0,
            adminCommission: 0,
          };
        });

        // Process orders and assign to vendors
        // Note: Assuming orders have vendor_id field. If not, we'll need to match by other means
        allOrders.forEach((order: any) => {
          const vendorId = order.vendor_id || order.vendorId;
          if (vendorId && statsByVendor[vendorId]) {
            const status = order.order_status?.toLowerCase() || '';
            const amount = parseFloat(order.total_amount) || 0;

            // Count by status
            if (status === 'pending') statsByVendor[vendorId].pending++;
            else if (status === 'confirmed') statsByVendor[vendorId].confirmed++;
            else if (status === 'processing') statsByVendor[vendorId].processing++;
            else if (status === 'out-for-delivery') statsByVendor[vendorId].outForDelivery++;
            else if (status === 'delivered' || status === 'completed') statsByVendor[vendorId].delivered++;
            else if (status === 'cancelled') statsByVendor[vendorId].cancelled++;

            // Add to total amount
            statsByVendor[vendorId].totalAmount += amount;
          }
        });

        // Calculate commissions for each vendor
        Object.keys(statsByVendor).forEach((vendorIdStr) => {
          const vendorId = parseInt(vendorIdStr);
          const stats = statsByVendor[vendorId];
          const vendorPercentage = 100 - adminCommissionPercentage;
          stats.vendorCommission = (stats.totalAmount * vendorPercentage) / 100;
          stats.adminCommission = (stats.totalAmount * adminCommissionPercentage) / 100;
        });

        setVendorStats(statsByVendor);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [adminCommissionPercentage]);

  // Calculate total admin commission
  const totalAdminCommission = Object.values(vendorStats).reduce(
    (sum, stats) => sum + stats.adminCommission,
    0
  );

  // Calculate total vendor commissions
  const totalVendorCommissions = Object.values(vendorStats).reduce(
    (sum, stats) => sum + stats.vendorCommission,
    0
  );

  // Calculate total revenue
  const totalRevenue = Object.values(vendorStats).reduce(
    (sum, stats) => sum + stats.totalAmount,
    0
  );

  // Filter vendors based on search query
  const filteredVendorStats = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return vendorStats;
    }
    const query = searchQuery.toLowerCase();
    const filtered: typeof vendorStats = {};
    Object.entries(vendorStats).forEach(([vendorId, stats]) => {
      if (stats.vendorName.toLowerCase().includes(query)) {
        filtered[parseInt(vendorId)] = stats;
      }
    });
    return filtered;
  }, [vendorStats, searchQuery]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

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
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">
                    Admin Dashboard
                  </h1>
                  <p className="text-white text-opacity-80 text-sm">
                    Monthly Statistics - {currentMonth}
                  </p>
                </div>
              </div>
              <p className="text-white text-opacity-90 text-lg mb-4">
                Monitor vendor performance and commission distribution
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">
                      Total Revenue: ${totalRevenue.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">
                      Admin Commission: ${totalAdminCommission.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-white" />
                    <span className="text-white text-sm font-medium">
                      {vendors.length} Vendors
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <span className="text-3xl font-bold text-blue-700">
              ${totalRevenue.toFixed(2)}
            </span>
          </div>
          <p className="text-sm font-medium text-blue-800">Total Revenue</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <span className="text-3xl font-bold text-green-700">
              ${totalAdminCommission.toFixed(2)}
            </span>
          </div>
          <p className="text-sm font-medium text-green-800">Admin Commission ({adminCommissionPercentage}%)</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-6 h-6 text-purple-600" />
            <span className="text-3xl font-bold text-purple-700">
              ${totalVendorCommissions.toFixed(2)}
            </span>
          </div>
          <p className="text-sm font-medium text-purple-800">Vendor Commissions</p>
        </div>
      </div>

      {/* Vendor Statistics */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-red-50 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Vendor Monthly Statistics
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {Object.keys(filteredVendorStats).length} of {Object.keys(vendorStats).length} vendors
                </p>
              </div>
            </div>
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Vendor Cards Container */}
        <div className="p-6 lg:p-8">
          {Object.keys(filteredVendorStats).length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">
                {searchQuery ? "No vendors found matching your search" : "No vendor data available for this month"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(filteredVendorStats).map(([vendorId, stats]) => (
                <div
                  key={vendorId}
                  className="group bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-xl hover:border-red-300 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Vendor Header - Enhanced */}
                  <div className="flex items-start justify-between mb-5 pb-5 border-b-2 border-gray-200">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="relative">
                        <div className="bg-gradient-to-br from-red-100 to-red-200 p-3 rounded-xl shadow-sm">
                          <Store className="w-5 h-5 text-red-600" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-800 truncate group-hover:text-red-600 transition-colors">
                          {stats.vendorName}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 flex items-center">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-1.5"></span>
                          Vendor ID: {vendorId}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-4 bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-3 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1 font-medium">Total Amount</p>
                      <p className="text-2xl font-bold text-gray-800">
                        ${stats.totalAmount.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Order Status Breakdown - Beautiful Cards */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 mb-4 uppercase tracking-wide flex items-center">
                      <Activity className="w-3 h-3 mr-2" />
                      Order Status
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {/* Pending */}
                      <div className="group relative bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200 hover:border-orange-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex flex-col items-center">
                          <div className="bg-orange-100 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform">
                            <Clock className="w-4 h-4 text-orange-600" />
                          </div>
                          <p className="text-xs text-orange-600 font-semibold mb-1">Pending</p>
                          <p className="text-2xl font-bold text-orange-700">{stats.pending}</p>
                        </div>
                        <div className="absolute top-0 right-0 w-12 h-12 bg-orange-200 opacity-20 rounded-full -mr-6 -mt-6"></div>
                      </div>

                      {/* Confirmed */}
                      <div className="group relative bg-gradient-to-br from-green-50 via-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex flex-col items-center">
                          <div className="bg-green-100 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          </div>
                          <p className="text-xs text-green-600 font-semibold mb-1">Confirmed</p>
                          <p className="text-2xl font-bold text-green-700">{stats.confirmed}</p>
                        </div>
                        <div className="absolute top-0 right-0 w-12 h-12 bg-green-200 opacity-20 rounded-full -mr-6 -mt-6"></div>
                      </div>

                      {/* Processing */}
                      <div className="group relative bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex flex-col items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform">
                            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                          </div>
                          <p className="text-xs text-blue-600 font-semibold mb-1">Processing</p>
                          <p className="text-2xl font-bold text-blue-700">{stats.processing}</p>
                        </div>
                        <div className="absolute top-0 right-0 w-12 h-12 bg-blue-200 opacity-20 rounded-full -mr-6 -mt-6"></div>
                      </div>

                      {/* Out for Delivery */}
                      <div className="group relative bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200 hover:border-purple-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex flex-col items-center">
                          <div className="bg-purple-100 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform">
                            <Truck className="w-4 h-4 text-purple-600" />
                          </div>
                          <p className="text-xs text-purple-600 font-semibold mb-1">Out Delivery</p>
                          <p className="text-2xl font-bold text-purple-700">{stats.outForDelivery}</p>
                        </div>
                        <div className="absolute top-0 right-0 w-12 h-12 bg-purple-200 opacity-20 rounded-full -mr-6 -mt-6"></div>
                      </div>

                      {/* Delivered */}
                      <div className="group relative bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 rounded-xl p-4 border-2 border-emerald-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex flex-col items-center">
                          <div className="bg-emerald-100 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform">
                            <PackageCheck className="w-4 h-4 text-emerald-600" />
                          </div>
                          <p className="text-xs text-emerald-600 font-semibold mb-1">Delivered</p>
                          <p className="text-2xl font-bold text-emerald-700">{stats.delivered}</p>
                        </div>
                        <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-200 opacity-20 rounded-full -mr-6 -mt-6"></div>
                      </div>

                      {/* Cancelled */}
                      <div className="group relative bg-gradient-to-br from-red-50 via-red-50 to-red-100 rounded-xl p-4 border-2 border-red-200 hover:border-red-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                        <div className="flex flex-col items-center">
                          <div className="bg-red-100 p-2 rounded-lg mb-2 group-hover:scale-110 transition-transform">
                            <XCircle className="w-4 h-4 text-red-600" />
                          </div>
                          <p className="text-xs text-red-600 font-semibold mb-1">Cancelled</p>
                          <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
                        </div>
                        <div className="absolute top-0 right-0 w-12 h-12 bg-red-200 opacity-20 rounded-full -mr-6 -mt-6"></div>
                      </div>
                    </div>
                  </div>

                  {/* Commission Breakdown - Beautiful Cards */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-4 uppercase tracking-wide flex items-center">
                      <DollarSign className="w-3 h-3 mr-2" />
                      Commission Split
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Vendor Commission */}
                      <div className="group relative bg-gradient-to-br from-green-50 via-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200 hover:border-green-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-green-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="bg-green-200 p-1.5 rounded-lg">
                                <Users className="w-3.5 h-3.5 text-green-700" />
                              </div>
                              <p className="text-xs text-green-700 font-semibold">Vendor</p>
                            </div>
                            <span className="text-xs text-green-600 font-medium bg-green-200 px-2 py-0.5 rounded-full">
                              {100 - adminCommissionPercentage}%
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-green-700">
                            ${stats.vendorCommission.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Admin Commission */}
                      <div className="group relative bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="bg-blue-200 p-1.5 rounded-lg">
                                <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
                              </div>
                              <p className="text-xs text-blue-700 font-semibold">Admin</p>
                            </div>
                            <span className="text-xs text-blue-600 font-medium bg-blue-200 px-2 py-0.5 rounded-full">
                              {adminCommissionPercentage}%
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-blue-700">
                            ${stats.adminCommission.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
