import React, { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import ForgotPasswordPage from "./components/ForgotPasswordPage";
import OTPVerificationPage from "./components/OTPVerificationPage";
import ProfilePage from "./components/ProfilePage";
import OrdersPage from "./components/OrdersPage";
import POSPage from "./components/POSPage";
import FoodPage from "./components/FoodPage";
import CustomerPage from "./components/CustomerPage";
import DeliverymanListPage from "./components/DeliverymanListPage";
import AddDeliverymanPage from "./components/AddDeliverymanPage";
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
import CategoriesPage from "./components/CategoriesPage";
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
  MessageSquare,
  FileText,
  CreditCard,
  UserCheck,
  Mail,
  Settings,
  Store,
  Utensils,
} from "lucide-react";

function App() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to false for login flow
  const [authMode, setAuthMode] = useState<
    "login" | "signup" | "forgot-password" | "otp-verification"
  >("login");
  const [otpEmail, setOtpEmail] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showAddDeliveryman, setShowAddDeliveryman] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [userRole, setUserRole] = useState<"admin" | "vendor">("admin");

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
    const userRole = user.role?.toLowerCase();
    if (userRole === "admin" || userRole === "vendor") {
      setUserRole(userRole as "admin" | "vendor");
    } else {
      setUserRole("vendor");
    }
    setIsAuthenticated(true);
    setAuthMode("login");
  };
  const handleRoleSelect = (role: "admin" | "vendor") => {
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    setIsAuthenticated(false);
    setActiveSection("dashboard");
    setShowProfile(false);
    setShowAddVendor(false);
    setUserRole("admin");
    setAuthMode("login");
  };

  const handleProfileAction = (action: "profile" | "logout" | "login") => {
    switch (action) {
      case "profile":
        setShowProfile(true);
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
            // onSwitchToSignup={() => setAuthMode('signup')}
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
            // onSwitchToSignup={() => setAuthMode('signup')}
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

  // Show profile page if requested
  if (showProfile) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          userRole={userRole}
        />

        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <Header onProfileAction={handleProfileAction} userRole={userRole} />

          <main className="flex-1 overflow-auto p-4 lg:p-6">
            <ProfilePage onBack={() => setShowProfile(false)} />
          </main>
        </div>
      </div>
    );
  }

  const orderStats = [
    { title: "Pending", value: 49, icon: Clock, color: "orange" as const },
    {
      title: "Confirmed",
      value: 26,
      icon: CheckCircle,
      color: "green" as const,
    },
    { title: "Processing", value: 6, icon: Package, color: "blue" as const },
    {
      title: "Out for delivery",
      value: 7,
      icon: Truck,
      color: "purple" as const,
    },
  ];

  const additionalStats = [
    {
      title: "Delivered",
      value: 46,
      icon: CheckCircle,
      color: "green" as const,
    },
    { title: "Cancelled", value: 3, icon: XCircle, color: "red" as const },
    { title: "Returned", value: 2, icon: RotateCcw, color: "gray" as const },
    {
      title: "Failed to Deliver",
      value: 3,
      icon: AlertTriangle,
      color: "red" as const,
    },
  ];

  const orderChartData = [
    { label: "Jan", value: 30 },
    { label: "Feb", value: 45 },
    { label: "Mar", value: 60 },
    { label: "Apr", value: 35 },
    { label: "May", value: 50 },
    { label: "Jun", value: 40 },
    { label: "Jul", value: 55 },
    { label: "Aug", value: 70 },
    { label: "Sep", value: 45 },
    { label: "Oct", value: 65 },
    { label: "Nov", value: 80 },
    { label: "Dec", value: 90 },
  ];

  const earningsChartData = [
    { label: "Jan", value: 2000 },
    { label: "Feb", value: 3500 },
    { label: "Mar", value: 4200 },
    { label: "Apr", value: 2800 },
    { label: "May", value: 3800 },
    { label: "Jun", value: 3200 },
    { label: "Jul", value: 4500 },
    { label: "Aug", value: 5200 },
    { label: "Sep", value: 3600 },
    { label: "Oct", value: 4800 },
    { label: "Nov", value: 5500 },
    { label: "Dec", value: 6200 },
  ];

  const orderStatusData = [
    { label: "Pending", value: 49, color: "#f59e0b" },
    { label: "Confirmed", value: 26, color: "#10b981" },
    { label: "Processing", value: 6, color: "#3b82f6" },
    { label: "Out for delivery", value: 7, color: "#8b5cf6" },
    { label: "Delivered", value: 46, color: "#22c55e" },
    { label: "Cancelled", value: 3, color: "#ef4444" },
  ];

  const topProducts = [
    {
      name: "Italian Spicy Pizza",
      price: "USD 45",
      rating: 4.5,
      orders: 120,
      image:
        "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      name: "Ice Cream",
      price: "USD 15",
      rating: 4.2,
      orders: 85,
      image:
        "https://images.pexels.com/photos/1352278/pexels-photo-1352278.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      name: "Popcorn Rice Bowl",
      price: "USD 25",
      rating: 4.8,
      orders: 95,
      image:
        "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      name: "Ginger & Figs",
      price: "USD 35",
      rating: 4.3,
      orders: 78,
      image:
        "https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
  ];

  const mostRatedProducts = [
    {
      name: "Beef Mince 2",
      price: "USD 25",
      rating: 4.9,
      orders: 150,
      image:
        "https://images.pexels.com/photos/361184/asparagus-steak-veal-steak-veal-361184.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      name: "Mozzarella Cheese",
      price: "USD 18",
      rating: 4.7,
      orders: 120,
      image:
        "https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      name: "Chicken Sandwich W",
      price: "USD 22",
      rating: 4.6,
      orders: 98,
      image:
        "https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      name: "Spicy Burger",
      price: "USD 28",
      rating: 4.5,
      orders: 110,
      image:
        "https://images.pexels.com/photos/1556909/pexels-photo-1556909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
  ];

  const topCustomers = [
    { name: "Amelia", phone: "**********", orders: 45 },
    { name: "Peter", phone: "**********", orders: 38 },
    { name: "Will", phone: "**********", orders: 32 },
    { name: "Sarah", phone: "**********", orders: 28 },
  ];

  const recentOrders = [
    {
      id: "100164",
      customer: "Processing",
      status: "processing" as const,
      time: "2 mins ago",
      amount: "USD 45",
    },
    {
      id: "100163",
      customer: "Confirmed",
      status: "confirmed" as const,
      time: "5 mins ago",
      amount: "USD 32",
    },
    {
      id: "100162",
      customer: "Delivered",
      status: "delivered" as const,
      time: "10 mins ago",
      amount: "USD 78",
    },
    {
      id: "100161",
      customer: "Cancelled",
      status: "cancelled" as const,
      time: "15 mins ago",
      amount: "USD 25",
    },
    {
      id: "100160",
      customer: "Pending",
      status: "pending" as const,
      time: "20 mins ago",
      amount: "USD 55",
    },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        if (userRole === "vendor") {
          return <VendorDashboard />;
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
              <Chart
                title="Order Statistics"
                data={orderChartData}
                type="line"
              />
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

      case "pos":
        return <POSPage />;

      case "food":
        return <FoodPage />;

      case "categories":
        return <CategoriesPage />;

      case "customer":
        return <CustomerPage />;

      case "delivery-man-list":
        if (showAddDeliveryman) {
          return (
            <AddDeliverymanPage onBack={() => setShowAddDeliveryman(false)} />
          );
        }
        return <DeliverymanListPage />;

      case "add-new-delivery-man":
        return (
          <AddDeliverymanPage
            onBack={() => setActiveSection("delivery-man-list")}
          />
        );

      case "new-joining-request":
        return <JoiningRequestPage />;

      case "delivery-man-reviews":
        return <DeliverymanReviewsPage />;

      case "vendors":
        if (showAddVendor) {
          return <AddVendorPage onBack={() => setShowAddVendor(false)} />;
        }
        return <VendorsPage onAddVendor={() => setShowAddVendor(true)} />;

      case "coupon":
        return (
          <GenericPage
            title="Coupon Management"
            description="Create discount coupons and promotional codes to boost sales. Set up percentage discounts, fixed amount discounts, and special promotional offers for your customers."
            icon={<Gift className="w-16 h-16 text-green-500" />}
          />
        );

      case "notification":
        return (
          <GenericPage
            title="Send Notifications"
            description="Send push notifications and alerts to your customers. Keep them informed about order updates, special offers, and important announcements."
            icon={<Bell className="w-16 h-16 text-orange-500" />}
          />
        );

      default:
        if (activeSection.includes("orders")) {
          return <OrdersPage orderType={activeSection} />;
        }
        if (activeSection.includes("delivery") && userRole === "admin") {
          return <DeliverymanListPage />;
        }
        if (activeSection.includes("delivery") && userRole !== "admin") {
          return (
            <GenericPage
              title="Access Denied"
              description="Delivery management is only available for admin users."
            />
          );
        }
        return (
          <GenericPage
            title={
              activeSection.charAt(0).toUpperCase() +
              activeSection.slice(1).replace("-", " ")
            }
            description="This section is currently under development. More features and functionality will be available soon."
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userRole={userRole}
      />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        <Header onProfileAction={handleProfileAction} userRole={userRole} />

        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
