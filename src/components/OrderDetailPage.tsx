import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Eye,
  Printer,
  Download,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  Package,
  User,
} from "lucide-react";
import { apiService } from "../services/api";

interface OrderDetail {
  id: string;
  order_number: string;
  order_status: string;
  payment_status: string;
  total_amount: string;
  created_at: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
  };
  items?: Array<{
    id: number;
    item_name: string;
    quantity: number;
    price: string;
    total: string;
  }>;
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

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        throw new Error("Order ID is required");
      }

      // Since we don't have a specific order detail endpoint, we'll fetch all orders and filter
      const ordersResponse = await apiService.getAllOrders({
        page: 1,
        limit: 100,
      });

      console.log("📋 Orders response for detail:", ordersResponse);

      let apiOrders: any[] = [];

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

      // Find the specific order by order_number or id
      const foundOrder = apiOrders.find(
        (order: any) => order.order_number === id || order.id === id
      );

      if (!foundOrder) {
        throw new Error("Order not found");
      }

      // Transform the order data
      const orderDetail: OrderDetail = {
        id: foundOrder.order_number || foundOrder.id,
        order_number: foundOrder.order_number,
        order_status: foundOrder.order_status,
        payment_status: foundOrder.payment_status,
        total_amount: foundOrder.total_amount,
        created_at: foundOrder.created_at,
        customer_first_name: foundOrder.customer_first_name,
        customer_last_name: foundOrder.customer_last_name,
        customer_email: foundOrder.customer_email,
        customer_phone: foundOrder.customer_phone,
        shipping_address: foundOrder.shipping_address,
        items: foundOrder.items || [],
      };

      setOrder(orderDetail);
      console.log("✅ Order detail loaded:", orderDetail);
    } catch (err: any) {
      console.error("❌ Error fetching order detail:", err);
      setError(err.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const mapOrderStatus = (status: string): string => {
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

  const mapPaymentStatus = (status: string): string => {
    if (!status) return "Unpaid";

    const statusLower = status.toLowerCase();
    if (statusLower === "paid") return "Paid";
    if (statusLower === "unpaid") return "Unpaid";

    return "Unpaid";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">Error</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-gray-500 text-lg mb-4">Order not found</div>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const orderStatus = mapOrderStatus(order.order_status);
  const paymentStatus = mapPaymentStatus(order.payment_status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Orders</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Order Information
                </h3>
                <p className="text-sm text-gray-600">
                  Order #{order.order_number}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statusColors[orderStatus as keyof typeof statusColors]
                  }`}
                >
                  {orderStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment:</span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    paymentStatusColors[
                      paymentStatus as keyof typeof paymentStatusColors
                    ]
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="text-gray-800">
                  {formatDate(order.created_at)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="text-gray-800">
                  {formatTime(order.created_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Customer Information
                </h3>
                <p className="text-sm text-gray-600">Customer Details</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-800">
                  {order.customer_first_name} {order.customer_last_name}
                </span>
              </div>
              {order.customer_email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-800">{order.customer_email}</span>
                </div>
              )}
              {order.customer_phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-800">{order.customer_phone}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">Payment Summary</h3>
                <p className="text-sm text-gray-600">Order Total</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-800">
                  ${(parseFloat(order.total_amount) * 0.9).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%):</span>
                <span className="text-gray-800">
                  ${(parseFloat(order.total_amount) * 0.1).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-800 font-semibold">Total:</span>
                <span className="text-gray-800 font-semibold">
                  ${parseFloat(order.total_amount).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        {/* <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Order Items</h3>
          </div>
          <div className="p-4">
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {item.item_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-800">
                        ${parseFloat(item.price || "0").toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${parseFloat(item.total || "0").toFixed(2)} total
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No items found for this order</p>
              </div>
            )}
          </div>
        </div> */}

        {/* Shipping Address (if available) */}
        {order.shipping_address && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Shipping Address
              </h3>
            </div>
            <div className="p-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                <div className="text-gray-800">
                  <p>{order.shipping_address.line1}</p>
                  {order.shipping_address.line2 && (
                    <p>{order.shipping_address.line2}</p>
                  )}
                  <p>
                    {order.shipping_address.city},{" "}
                    {order.shipping_address.state} {order.shipping_address.zip}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
