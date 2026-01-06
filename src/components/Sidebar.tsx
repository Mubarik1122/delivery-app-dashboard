import React, { useState } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Gift,
  Bell,
  MessageSquare,
  FileText,
  CreditCard,
  UserCheck,
  Utensils,
  Mail,
  Menu,
  X,
  PlusCircle,
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  userRole: "admin" | "vendor";
  onVendorsClick?: () => void;
}

export default function Sidebar({
  activeSection,
  onSectionChange,
  userRole,
  onVendorsClick,
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setIsMobileOpen(false); // Close mobile menu when item is selected
  };

  type MenuItem = {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  };

  const getMenuItems = (): MenuItem[] => {
    const commonItems: MenuItem[] = [
      { id: "coupon", label: "Coupon", icon: Gift },
    ];

    const adminOnlyItems: MenuItem[] = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "vendors", label: "Vendors", icon: Users },
      { id: "deliveryman", label: "Deliveryman", icon: Package },
    ];

    const vendorOnlyItems: MenuItem[] = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "pos", label: "POS", icon: Utensils },
      { id: "categories", label: "Categories", icon: Package },
      { id: "items", label: "Items", icon: Utensils },
      { id: "addons", label: "Addons", icon: PlusCircle },
      { id: "all-orders", label: "Orders", icon: ShoppingCart },
    ];

    if (userRole === "admin") {
      return [...adminOnlyItems, ...commonItems];
    } else {
      return [...vendorOnlyItems, ...commonItems];
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
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <img
              src="/image/logo/logo_icon.jpeg"
              alt="grocyon Logo"
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
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
            {getMenuItems().map((item) => (
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
          </ul>
        </nav>
      </div>
    </>
  );
}
