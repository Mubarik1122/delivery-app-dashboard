import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Eye, Edit, RefreshCw, Package, Clock, CheckCircle, XCircle, Calendar, Filter } from "lucide-react";
import { apiService } from "../services/api";

interface Order {
  id: string;
  orderId: string;
  deliveryDate: string;
  deliveryTime: string;
  customerName: string;
  totalAmount: string;
  paymentStatus: "Paid" | "Unpaid";
  orderStatus:
    | "Confirmed"
    | "Delivered"
    | "Processing"
    | "Pending"
    | "Cancelled"
    | "Failed To Deliver"
    | "Returned";
  created_at: string;
  customer_first_name: string;
  customer_last_name: string;
  total_amount: string;
  order_status: string;
  payment_status: string;
  order_number: string;
}

const statusColors = {
  Confirmed: "bg-blue-50 text-blue-800 border-blue-200",
  Delivered: "bg-green-50 text-green-800 border-green-200",
  Processing: "bg-yellow-50 text-yellow-800 border-yellow-200",
  Pending: "bg-orange-50 text-orange-800 border-orange-200",
  Cancelled: "bg-red-50 text-red-800 border-red-200",
  "Failed To Deliver": "bg-red-50 text-red-800 border-red-200",
  Returned: "bg-gray-50 text-gray-800 border-gray-200",
};

const paymentStatusColors = {
  Paid: "bg-green-100 text-green-800",
  Unpaid: "bg-red-100 text-red-800",
};

interface OrdersPageProps {
  orderType: string;
}

export default function OrdersPage({ orderType }: OrdersPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError(null);

      const ordersResponse = await apiService.getAllOrders({
        start_date: startDate || getStartOfMonth(),
        end_date: endDate || getEndOfMonth(),
        page: 1,
        limit: 100,
      });

      // console.log("📋 Orders API response:", ordersResponse);

      let apiOrders: any[] = [];

      // Handle different response structures
      if (
        ordersResponse.data?.data?.orders &&
        Array.isArray(ordersResponse.data.data.orders)
      ) {
        apiOrders = ordersResponse.data.data.orders;
      } else if (
        ordersResponse.data?.orders &&
        Array.isArray(ordersResponse.data.orders)
      ) {
        apiOrders = ordersResponse.data.orders;
      }

      // console.log("🔄 Processed orders:", apiOrders);

      // Transform API data to match our Order interface
      const transformedOrders: Order[] = apiOrders.map(
        (order: any, index: number) => {
          const orderDate = new Date(order.created_at);
          const deliveryDate = orderDate.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const deliveryTime = orderDate.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });

          return {
            id: order.order_number || order.id || `order-${index}`,
            orderId: order.order_number || `ORD-${index}`,
            deliveryDate,
            deliveryTime,
            customerName:
              `${order.customer_first_name || ""} ${
                order.customer_last_name || ""
              }`.trim() || "Customer",
            totalAmount: `$${parseFloat(order.total_amount || "0").toFixed(2)}`,
            paymentStatus: mapPaymentStatus(order.payment_status),
            orderStatus: mapOrderStatus(order.order_status),
            created_at: order.created_at,
            customer_first_name: order.customer_first_name,
            customer_last_name: order.customer_last_name,
            total_amount: order.total_amount,
            order_status: order.order_status,
            payment_status: order.payment_status,
            order_number: order.order_number,
          };
        }
      );

      setOrders(transformedOrders);
      // console.log("✅ Orders loaded successfully:", transformedOrders.length);
    } catch (err: any) {
      console.error("❌ Error fetching orders:", err);
      setError(
        err.message ||
          "Failed to load orders. Please check your connection and try again."
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

  const mapOrderStatus = (status: string): Order["orderStatus"] => {
    if (!status) return "Pending";

    const statusLower = status.toLowerCase();
    if (statusLower === "pending") return "Pending";
    if (statusLower === "confirmed") return "Confirmed";
    if (statusLower === "processing") return "Processing";
    if (statusLower === "delivered") return "Delivered";
    if (statusLower === "completed") return "Delivered";
    if (statusLower === "cancelled") return "Cancelled";
    if (statusLower.includes("failed")) return "Failed To Deliver";
    if (statusLower === "returned") return "Returned";

    return "Pending";
  };

  const mapPaymentStatus = (status: string): Order["paymentStatus"] => {
    if (!status) return "Unpaid";

    const statusLower = status.toLowerCase();
    if (statusLower === "paid") return "Paid";
    if (statusLower === "unpaid") return "Unpaid";

    return "Unpaid";
  };

  // Calculate order counts by status
  const getOrderCounts = () => {
    const counts = {
      "all-orders": orders.length,
      "pending-orders": orders.filter(
        (order) => order.orderStatus === "Pending"
      ).length,
      "confirmed-orders": orders.filter(
        (order) => order.orderStatus === "Confirmed"
      ).length,
      "processing-orders": orders.filter(
        (order) => order.orderStatus === "Processing"
      ).length,
      "out-for-delivery-orders": orders.filter(
        (order) => order.orderStatus === "Processing"
      ).length,
      "delivered-orders": orders.filter(
        (order) => order.orderStatus === "Delivered"
      ).length,
      "returned-orders": orders.filter(
        (order) => order.orderStatus === "Returned"
      ).length,
      "failed-to-deliver-orders": orders.filter(
        (order) => order.orderStatus === "Failed To Deliver"
      ).length,
      "cancelled-orders": orders.filter(
        (order) => order.orderStatus === "Cancelled"
      ).length,
      "scheduled-orders": 0,
    };
    return counts;
  };

  const getOrderCount = (status: string) => {
    const counts = getOrderCounts();
    return counts[status as keyof typeof counts] || 0;
  };

  const getPageTitle = (orderType: string) => {
    const titles: { [key: string]: string } = {
      "all-orders": "All Orders",
      "pending-orders": "Pending Orders",
      "confirmed-orders": "Confirmed Orders",
      "processing-orders": "Processing Orders",
      "out-for-delivery-orders": "Out For Delivery Orders",
      "delivered-orders": "Delivered Orders",
      "returned-orders": "Returned Orders",
      "failed-to-deliver-orders": "Failed To Deliver Orders",
      "cancelled-orders": "Cancelled Orders",
      "scheduled-orders": "Scheduled Orders",
    };
    return titles[orderType] || "Orders";
  };

  // Filter orders based on search term and order type
  const filteredOrders = orders.filter((order) => {
    // Filter by search term
    const matchesSearch =
      searchTerm === "" ||
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderStatus.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by order type
    let matchesType = true;
    switch (orderType) {
      case "pending-orders":
        matchesType = order.orderStatus === "Pending";
        break;
      case "confirmed-orders":
        matchesType = order.orderStatus === "Confirmed";
        break;
      case "processing-orders":
        matchesType = order.orderStatus === "Processing";
        break;
      case "delivered-orders":
        matchesType = order.orderStatus === "Delivered";
        break;
      case "cancelled-orders":
        matchesType = order.orderStatus === "Cancelled";
        break;
      case "returned-orders":
        matchesType = order.orderStatus === "Returned";
        break;
      case "failed-to-deliver-orders":
        matchesType = order.orderStatus === "Failed To Deliver";
        break;
      // 'all-orders' and others show all
      default:
        matchesType = true;
    }

    return matchesSearch && matchesType;
  });

  // Handle show data button click
  const handleShowData = () => {
    fetchOrders();
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading && !refreshing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -ml-32 -mb-32"></div>
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">
                    {getPageTitle(orderType)}
                  </h1>
                  <p className="text-white text-opacity-90 text-lg">
                    Manage and track all your orders
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg">
                  <span className="text-white text-sm font-medium">
                    Total: {getOrderCount(orderType)} orders
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchOrders}
                disabled={refreshing}
                className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-opacity-30 transition-all flex items-center space-x-2 font-medium shadow-lg"
              >
                <RefreshCw
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
              <button className="bg-white text-red-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105">
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-xl flex items-center justify-between">
          <div className="font-medium">{error}</div>
          <button
            onClick={fetchOrders}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-800">
            Date Range Filter
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-end space-x-2">
            <button
              onClick={handleClearFilters}
              className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Clear
            </button>
            <button
              onClick={handleShowData}
              className="bg-red-500 text-white px-6 py-2.5 rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              Show Data
            </button>
          </div>
        </div>
      </div>

      {/* Order Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <div className="group relative bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 rounded-xl border border-orange-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-700 mb-1">Pending</p>
              <p className="text-3xl font-bold text-orange-700">
                {getOrderCount("pending-orders")}
              </p>
            </div>
            <div className="bg-orange-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6 text-orange-700" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>

        <div className="group relative bg-gradient-to-br from-green-50 via-green-50 to-green-100 rounded-xl border border-green-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-700 mb-1">Confirmed</p>
              <p className="text-3xl font-bold text-green-700">
                {getOrderCount("confirmed-orders")}
              </p>
            </div>
            <div className="bg-green-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6 text-green-700" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>

        <div className="group relative bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-700 mb-1">Processing</p>
              <p className="text-3xl font-bold text-blue-700">
                {getOrderCount("processing-orders")}
              </p>
            </div>
            <div className="bg-blue-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-blue-700" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>

        <div className="group relative bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-700 mb-1">Delivered</p>
              <p className="text-3xl font-bold text-emerald-700">
                {getOrderCount("delivered-orders")}
              </p>
            </div>
            <div className="bg-emerald-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle className="w-6 h-6 text-emerald-700" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>

        <div className="group relative bg-gradient-to-br from-red-50 via-red-50 to-red-100 rounded-xl border border-red-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-700 mb-1">Cancelled</p>
              <p className="text-3xl font-bold text-red-700">
                {getOrderCount("cancelled-orders")}
              </p>
            </div>
            <div className="bg-red-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <XCircle className="w-6 h-6 text-red-700" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer Name, or Order Status"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  SL
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Customer Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center"
                  >
                    <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium text-lg mb-2">
                      {loading
                        ? "Loading orders..."
                        : "No orders found"}
                    </p>
                    {!loading && (
                      <p className="text-gray-500 text-sm">
                        Try adjusting your search or filters
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-200 group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/order/${order.orderId}`)}
                        className="text-sm font-semibold text-gray-900 group-hover:text-red-600 hover:text-red-600 transition-colors cursor-pointer hover:underline"
                        title="Click to view order details"
                      >
                        {order.orderId}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{order.deliveryDate}</div>
                        <div className="text-gray-500 text-xs">
                          {order.deliveryTime}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.customerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold text-green-700 bg-green-50 border border-green-200">
                        {order.totalAmount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          order.paymentStatus === "Paid"
                            ? "bg-green-50 text-green-800 border-green-200"
                            : "bg-red-50 text-red-800 border-red-200"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                          statusColors[order.orderStatus]
                        } border-opacity-50`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => navigate(`/order/${order.orderId}`)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all p-2 rounded-lg border border-transparent hover:border-blue-200"
                          title="View Order"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
