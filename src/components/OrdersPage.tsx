import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Download, Eye, Edit, RefreshCw } from "lucide-react";
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
  Confirmed: "bg-blue-100 text-blue-800",
  Delivered: "bg-green-100 text-green-800",
  Processing: "bg-yellow-100 text-yellow-800",
  Pending: "bg-orange-100 text-orange-800",
  Cancelled: "bg-red-100 text-red-800",
  "Failed To Deliver": "bg-red-100 text-red-800",
  Returned: "bg-gray-100 text-gray-800",
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
        <div className="text-lg text-gray-600">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-gray-800">
              📋 {getPageTitle(orderType)}
            </h1>
            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-medium">
              {getOrderCount(orderType)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchOrders}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
            <button className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
              <button
                onClick={fetchOrders}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Select date range
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={handleClearFilters}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleShowData}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Show Data
              </button>
            </div>
          </div>
        </div>

        {/* Order Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-600">⏳</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-800">
                  {getOrderCount("pending-orders")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-gray-800">
                  {getOrderCount("confirmed-orders")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600">📦</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-gray-800">
                  {getOrderCount("processing-orders")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">✅</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-800">
                  {getOrderCount("delivered-orders")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600">❌</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-800">
                  {getOrderCount("cancelled-orders")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by Order ID, Customer Name, or Order Status"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <button
              onClick={() => setSearchTerm("")}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SL
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {loading
                      ? "Loading orders..."
                      : "No orders found matching your criteria"}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order, index) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{order.deliveryDate}</div>
                        <div className="text-gray-500">
                          {order.deliveryTime}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{order.customerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.totalAmount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          paymentStatusColors[order.paymentStatus]
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusColors[order.orderStatus]
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => navigate(`/order/${order.orderId}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* <button className="text-green-600 hover:text-green-800">
                          <Edit className="w-4 h-4" />
                        </button> */}
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
