import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Ticket,
  Settings,
  BarChart3,
  UserCheck,
  Gift,
  Bell,
  MessageSquare,
  FileText,
  CreditCard,
  PieChart,
  TrendingUp,
  Store,
  Utensils,
  Mail,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: "admin" | "vendor";
  onVendorsClick?: () => void;
}

const orderSubItems = [
  { id: "all-orders", label: "All", count: 114, color: "text-blue-600" },
  {
    id: "pending-orders",
    label: "Pending",
    count: 39,
    color: "text-orange-600",
    icon: Clock,
  },
  {
    id: "confirmed-orders",
    label: "Confirmed",
    count: 20,
    color: "text-green-600",
    icon: CheckCircle,
  },
  {
    id: "processing-orders",
    label: "Processing",
    count: 6,
    color: "text-blue-600",
    icon: Package,
  },
  {
    id: "delivered-orders",
    label: "Delivered",
    count: 30,
    color: "text-green-600",
    icon: CheckCircle,
  },
  {
    id: "failed-to-deliver-orders",
    label: "Failed To Deliver",
    count: 2,
    color: "text-red-600",
    icon: AlertTriangle,
  },
  {
    id: "cancelled-orders",
    label: "Cancelled",
    count: 3,
    color: "text-red-600",
    icon: XCircle,
  },
];

const deliverymanSubItems = [
  { id: "delivery-man-list", label: "Delivery Man List", count: 14 },
  { id: "add-new-delivery-man", label: "Add New Delivery Man" },
  { id: "delivery-man-reviews", label: "Delivery Man Reviews" },
];

const menuItems = [
  { id: "food", label: "Food", icon: Utensils },
  { id: "banner", label: "Banner", icon: FileText },
  { id: "coupon", label: "Coupon", icon: Gift },
  { id: "notification", label: "Send Notification", icon: Bell },
  { id: "customer", label: "Customer", icon: Users },
  { id: "customer-wallet", label: "Customer Wallet", icon: CreditCard },
  { id: "loyalty", label: "Customer Loyalty Point", icon: UserCheck },
  { id: "subscribed", label: "Subscribed Emails", icon: Mail },
  { id: "chat", label: "Chat", icon: MessageSquare, badge: "NEW" },
];

export default function Sidebar({
  activeSection,
  onSectionChange,
  userRole,
  onVendorsClick,
}: SidebarProps) {
  const [isOrdersExpanded, setIsOrdersExpanded] = useState(false);
  const [isDeliverymanExpanded, setIsDeliverymanExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleOrdersToggle = () => {
    setIsOrdersExpanded(!isOrdersExpanded);
    if (!isOrdersExpanded) {
      setIsDeliverymanExpanded(false);
    }
  };

  const handleDeliverymanToggle = () => {
    setIsDeliverymanExpanded(!isDeliverymanExpanded);
    if (!isDeliverymanExpanded) {
      setIsOrdersExpanded(false);
    }
  };

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setIsMobileOpen(false); // Close mobile menu when item is selected
  };

  // Define menu items based on user role
  type MenuItem = {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  };

  const getMenuItems = (): MenuItem[] => {
    // Dashboard and POS always at the top
    const topItems: MenuItem[] = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "pos", label: "POS", icon: Store },
    ];

    const commonItems: MenuItem[] = [
      { id: "food", label: "Food", icon: Utensils },
      { id: "coupon", label: "Coupon", icon: Gift },
    ];

    const adminOnlyItems: MenuItem[] = [
      { id: "vendors", label: "Vendors", icon: Users },
    ];

    const vendorOnlyItems: MenuItem[] = [
      { id: "categories", label: "Categories", icon: Package },
      { id: "items", label: "Items", icon: Utensils },
    ];

    if (userRole === "admin") {
      return [...topItems, ...commonItems, ...adminOnlyItems];
    } else {
      return [...topItems, ...commonItems, ...vendorOnlyItems];
    }
  };
  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={handleMobileToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <img
              src="/image/logo/logo_icon.jpeg"
              alt="grocyon Logo"
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                // Fallback to icon if image fails to load
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hidden">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-800">Grocyon</span>
              <div className="text-xs text-gray-500 capitalize">
                {userRole} Panel
              </div>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <ul className="space-y-1">
            {/* Dashboard and POS at the top */}
            {getMenuItems()
              .slice(0, 2)
              .map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleSectionChange(item.id)}
                    className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeSection === item.id
                        ? "bg-red-50 text-red-700 border-r-2 border-red-500 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}

            {/* Orders Dropdown */}
            <li>
              <button
                onClick={handleOrdersToggle}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeSection.includes("orders")
                    ? "bg-red-50 text-red-700 shadow-sm"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <ShoppingCart className="w-4 h-4 mr-3 flex-shrink-0" />
                <span className="flex-1 text-left">Order</span>
                {isOrdersExpanded ? (
                  <ChevronDown className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 flex-shrink-0" />
                )}
              </button>

              {isOrdersExpanded && (
                <ul className="mt-2 ml-4 space-y-1">
                  {orderSubItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <li key={item.id}>
                        <button
                          onClick={() => handleSectionChange(item.id)}
                          className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            activeSection === item.id
                              ? "bg-red-50 text-red-700 border-r-2 border-red-500 shadow-sm"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          {IconComponent && (
                            <IconComponent className="w-3 h-3 mr-2 flex-shrink-0" />
                          )}
                          <span className="flex-1 text-left text-xs">
                            {item.label}
                          </span>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.color} bg-opacity-10`}
                          >
                            {item.count}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>

            {/* Rest of menu items (excluding Dashboard and POS) */}
            {getMenuItems()
              .slice(2)
              .map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      handleSectionChange(item.id);
                    }}
                    className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeSection === item.id
                        ? "bg-red-50 text-red-700 border-r-2 border-red-500 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}

            {/* Deliveryman Dropdown - Admin Only */}
            {userRole === "admin" && (
              <li>
                <button
                  onClick={handleDeliverymanToggle}
                  className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeSection.includes("delivery")
                      ? "bg-red-50 text-red-700 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Package className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="flex-1 text-left">Deliveryman</span>
                  {isDeliverymanExpanded ? (
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 flex-shrink-0" />
                  )}
                </button>

                {isDeliverymanExpanded && (
                  <ul className="mt-2 ml-4 space-y-1">
                    {deliverymanSubItems.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => handleSectionChange(item.id)}
                          className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                            activeSection === item.id
                              ? "bg-red-50 text-red-700 border-r-2 border-red-500 shadow-sm"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}
                        >
                          <span className="flex-1 text-left text-xs">
                            {item.label}
                          </span>
                          {item.count && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-red-600 bg-red-100">
                              {item.count}
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
}
