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
  Store,
  Truck,
  Star,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Utensils,
  ShoppingCart,
  Copy,
  Check,
  Plus,
  Sparkles,
  FileText,
} from "lucide-react";
import { apiService } from "../services/api";

interface OrderDetail {
  order_id: number;
  order_number: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  total_amount: string;
  created_at: string;
  updated_at: string;
  customer: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    shipping_address: {
      line1: string;
      line2?: string;
      city?: string;
      state?: string;
      zip?: string;
      country: string;
      latitude?: number;
      longitude?: number;
    };
  };
  vendor: {
    id: number;
    first_name: string;
    last_name: string;
    restaurant_name: string;
    email: string;
    phone: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip_code: string;
    restaurant_image?: string;
    is_food?: boolean;
    is_grocery?: boolean;
    latitude?: number;
    longitude?: number;
  };
  rider?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    current_latitude?: number;
    current_longitude?: number;
    is_online?: boolean;
    location_updated_at?: string;
  };
  order_items: Array<{
    item_id: string | number;
    item_name: string;
    short_description?: string;
    long_description?: string;
    background_image_url?: string;
    cover_image_url?: string;
    unit_price: string;
    total_quantity: number;
    size_id?: number | null;
    size_name?: string | null;
    flavor_id?: number | null;
    flavor_name?: string | null;
    notes?: string | null;
    addons?: Array<{
      addon_id: number;
      addon_name: string;
      addon_description?: string;
      addon_price: number | string;
      addon_quantity: number;
    }>;
  }>;
  total_items: number;
  total_quantity: number;
  order_notes?: string | null;
  payments?: Array<{
    id: number;
    payment_method: string;
    payment_reference?: string;
    payment_amount: string;
    payment_status: string;
    paid_at?: string;
  }>;
  reviews?: Array<{
    id: number;
    rating: number;
    comment?: string;
    created_at: string;
    customer_first_name: string;
    customer_last_name: string;
  }>;
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
  Paid: "bg-green-50 text-green-800 border-green-200",
  Unpaid: "bg-red-50 text-red-800 border-red-200",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

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

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        throw new Error("Order ID is required");
      }

      // Call the correct API endpoint
      const response = await apiService.getOrder(id);

      if (response.errorCode !== 0 || !response.data) {
        throw new Error(response.errorMessage || "Order not found");
      }

      setOrder(response.data as OrderDetail);
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

  const handleExport = async () => {
    if (!order) return;

    // Create receipt HTML
    const receiptHTML = generateReceiptHTML(order);

    // Create a blob and download
    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt_${order.order_number}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success message
    const Swal = (await import("sweetalert2")).default;
    Swal.fire({
      icon: "success",
      title: "Receipt Downloaded",
      text: "Receipt has been downloaded successfully",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const generateReceiptHTML = (orderData: OrderDetail) => {
    const paymentRef = orderData.payments && orderData.payments.length > 0 
      ? orderData.payments[0].payment_reference || 'N/A' 
      : 'N/A';
    
    const vendorAddress = `${orderData.vendor.address1}${orderData.vendor.address2 ? ', ' + orderData.vendor.address2 : ''}, ${orderData.vendor.city}, ${orderData.vendor.state} ${orderData.vendor.zip_code}`;
    
    const itemsHTML = orderData.order_items.map((item, index) => {
      const sizeInfo = item.size_name ? `<div style="font-size: 11px; color: #3b82f6; margin-top: 2px;"><strong>Size:</strong> ${item.size_name}</div>` : '';
      const flavorInfo = item.flavor_name ? `<div style="font-size: 11px; color: #9333ea; margin-top: 2px;"><strong>Flavor:</strong> ${item.flavor_name}</div>` : '';
      const addonsInfo = item.addons && item.addons.length > 0 
        ? `<div style="margin-top: 4px; padding: 6px; background: #f0fdf4; border-left: 3px solid #22c55e; border-radius: 4px;">
            <div style="font-size: 10px; font-weight: bold; color: #15803d; margin-bottom: 4px;">ADDONS:</div>
            ${item.addons.map((addon: any) => 
              `<div style="font-size: 11px; color: #166534; margin-left: 8px; margin-top: 2px;">
                • ${addon.addon_name}${addon.addon_quantity > 1 ? ` (×${addon.addon_quantity})` : ''}${parseFloat(String(addon.addon_price || "0")) > 0 ? ` (+$${parseFloat(String(addon.addon_price)).toFixed(2)})` : ''}
              </div>`
            ).join('')}
          </div>`
        : '';
      const notesInfo = item.notes 
        ? `<div style="margin-top: 4px; padding: 6px; background: #fefce8; border-left: 3px solid #eab308; border-radius: 4px;">
            <div style="font-size: 10px; font-weight: bold; color: #854d0e; margin-bottom: 2px;">NOTE:</div>
            <div style="font-size: 11px; color: #713f12; margin-left: 8px;">${item.notes}</div>
          </div>`
        : '';
      
      return `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; vertical-align: top;">
          <div style="font-weight: bold;">${item.item_name}</div>
          ${sizeInfo}
          ${flavorInfo}
          ${addonsInfo}
          ${notesInfo}
        </td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center; vertical-align: top;">${item.total_quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; vertical-align: top;">$${parseFloat(item.unit_price || "0").toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right; vertical-align: top;">$${(parseFloat(item.unit_price || "0") * item.total_quantity).toFixed(2)}</td>
      </tr>
    `;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Receipt - ${orderData.order_number}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Arial', sans-serif;
      padding: 40px;
      background: #fff;
      color: #000;
    }
    .receipt {
      max-width: 600px;
      margin: 0 auto;
      border: 2px solid #000;
      padding: 30px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .header h2 {
      font-size: 20px;
      font-weight: normal;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      border-bottom: 1px solid #000;
      padding-bottom: 5px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .info-label {
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background: #f3f4f6;
      padding: 10px;
      text-align: left;
      border-bottom: 2px solid #000;
      font-weight: bold;
      font-size: 14px;
    }
    th.text-center {
      text-align: center;
    }
    th.text-right {
      text-align: right;
    }
    td {
      padding: 8px;
      border-bottom: 1px solid #e5e7eb;
      font-size: 14px;
    }
    .total-row {
      font-weight: bold;
      font-size: 16px;
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #000;
      font-size: 12px;
    }
    @media print {
      body {
        padding: 0;
      }
      .receipt {
        border: none;
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>ORDER RECEIPT</h1>
      <h2>${orderData.vendor.restaurant_name}</h2>
    </div>

    <div class="section">
      <div class="section-title">Order Information</div>
      <div class="info-row">
        <span class="info-label">Order Number:</span>
        <span>${orderData.order_number}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Date:</span>
        <span>${formatDate(orderData.created_at)} ${formatTime(orderData.created_at)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Status:</span>
        <span>${orderData.order_status}</span>
      </div>
      ${orderData.order_notes ? `
      <div style="margin-top: 15px; padding: 12px; background: #fefce8; border-left: 4px solid #eab308; border-radius: 4px;">
        <div style="font-weight: bold; color: #854d0e; margin-bottom: 6px; font-size: 13px;">ORDER NOTES:</div>
        <div style="color: #713f12; font-size: 13px; white-space: pre-wrap;">${orderData.order_notes}</div>
      </div>
      ` : ''}
    </div>

    <div class="section">
      <div class="section-title">Vendor Information</div>
      <div class="info-row">
        <span class="info-label">Restaurant:</span>
        <span>${orderData.vendor.restaurant_name}</span>
      </div>
      <div style="margin-top: 10px; font-size: 14px;">
        ${vendorAddress}
      </div>
    </div>

    <div class="section">
      <div class="section-title">Order Items</div>
      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="3" style="text-align: right; padding: 15px 8px;">Grand Total:</td>
            <td style="text-align: right; padding: 15px 8px;">$${parseFloat(orderData.total_amount || "0").toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Payment Information</div>
      <div class="info-row">
        <span class="info-label">Payment Reference:</span>
        <span>${paymentRef}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Total Amount:</span>
        <span style="font-weight: bold; font-size: 16px;">$${parseFloat(orderData.total_amount || "0").toFixed(2)}</span>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for your order!</p>
      <p style="margin-top: 5px;">Generated on ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order || !id) return;

    try {
      setUpdatingStatus(true);
      await apiService.updateOrderStatus(id, newStatus);
      
      // Update local state
      setOrder({
        ...order,
        order_status: newStatus,
      });
      
      // Show success message
      const Swal = (await import("sweetalert2")).default;
      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Order status has been updated to ${newStatus}`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      console.error("Error updating status:", err);
      const Swal = (await import("sweetalert2")).default;
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to update order status",
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    // Get user role from localStorage
    const userData = apiService.getUserData();
    if (userData) {
      setUserRole(userData.role_name || userData.role || null);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchOrderDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading order details...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
        <div className="text-center">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <div className="text-red-600 text-xl font-semibold mb-2">Error</div>
          <div className="text-gray-600 mb-6">{error}</div>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
        <div className="text-center">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <div className="text-gray-500 text-xl font-semibold mb-6">Order not found</div>
          <button
            onClick={() => navigate(-1)}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const orderStatus = mapOrderStatus(order.order_status);
  const paymentStatus = mapPaymentStatus(order.payment_status);

  const DEFAULT_IMAGE = "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300";
  const DEFAULT_VENDOR_IMAGE = "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300";

  return (
    <>
      {/* Receipt for Printing - Thermal Printer Format */}
      <div className="hidden print:block">
        <div className="receipt-print">
          <div className="receipt-header">
            <h1>ORDER RECEIPT</h1>
            <h2>{order.vendor.restaurant_name}</h2>
            <div className="receipt-address">
              {order.vendor.address1}
              {order.vendor.address2 && `, ${order.vendor.address2}`}
              <br />
              {order.vendor.city}, {order.vendor.state} {order.vendor.zip_code}
            </div>
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-info">
            <div className="info-row">
              <span>Order #:</span>
              <span>{order.order_number}</span>
            </div>
            <div className="info-row">
              <span>Date:</span>
              <span>{formatDate(order.created_at)} {formatTime(order.created_at)}</span>
            </div>
            {order.order_notes && (
              <>
                <div className="receipt-divider"></div>
                <div style={{ margin: '4px 0', padding: '6px', background: '#fefce8', borderLeft: '2px solid #eab308', borderRadius: '2px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '9px', color: '#854d0e', marginBottom: '2px' }}>ORDER NOTES:</div>
                  <div style={{ fontSize: '9px', color: '#713f12', whiteSpace: 'pre-wrap' }}>{order.order_notes}</div>
                </div>
              </>
            )}
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-items">
            <div className="items-header">
              <span className="item-name">Item</span>
              <span className="item-qty">Qty</span>
              <span className="item-price">Price</span>
              <span className="item-total">Total</span>
            </div>
            {order.order_items.map((item, index) => {
              const sizeInfo = item.size_name ? `\nSize: ${item.size_name}` : '';
              const flavorInfo = item.flavor_name ? `\nFlavor: ${item.flavor_name}` : '';
              const addonsInfo = item.addons && item.addons.length > 0 
                ? `\nAddons: ${item.addons.map((addon: any) => 
                    `${addon.addon_name}${addon.addon_quantity > 1 ? ` (×${addon.addon_quantity})` : ''}${parseFloat(String(addon.addon_price || "0")) > 0 ? ` (+$${parseFloat(String(addon.addon_price)).toFixed(2)})` : ''}`
                  ).join(', ')}`
                : '';
              const notesInfo = item.notes ? `\nNote: ${item.notes}` : '';
              
              return (
                <div key={item.item_id || index}>
                  <div className="item-row">
                    <span className="item-name">{item.item_name}{sizeInfo}{flavorInfo}{addonsInfo}{notesInfo}</span>
                    <span className="item-qty">{item.total_quantity}</span>
                    <span className="item-price">${parseFloat(item.unit_price || "0").toFixed(2)}</span>
                    <span className="item-total">${(parseFloat(item.unit_price || "0") * item.total_quantity).toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-total">
            <div className="total-row">
              <span>Total Amount:</span>
              <span>${parseFloat(order.total_amount || "0").toFixed(2)}</span>
            </div>
            {order.payments && order.payments.length > 0 && order.payments[0].payment_reference && (
              <div className="info-row">
                <span>Payment Ref:</span>
                <span>{order.payments[0].payment_reference}</span>
              </div>
            )}
          </div>

          <div className="receipt-divider"></div>

          <div className="receipt-footer">
            <p>Thank you for your order!</p>
            <p className="footer-date">Generated: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Main Content - Hidden when printing */}
      <div className="space-y-6 pb-6 print:hidden">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Orders"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Order Details
                  </h1>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-sm text-gray-600">
                    Order #{order.order_number}
                  </p>
                  <button
                    onClick={() => copyToClipboard(order.order_number)}
                    className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                    title="Copy order number"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button 
                onClick={handleExport}
                className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Order Status</p>
              {userRole?.toLowerCase() === "vendor" ? (
                <div className="space-y-2">
                  <select
                    value={order.order_status}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={updatingStatus}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Ready to deliver">Ready to deliver</option>
                    <option value="Out for delivery">Out for delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  {updatingStatus && (
                    <p className="text-xs text-gray-500">Updating...</p>
                  )}
                </div>
              ) : (
                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${statusColors[orderStatus as keyof typeof statusColors]}`}>
                  {orderStatus}
                </span>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Payment Status</p>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${paymentStatusColors[paymentStatus as keyof typeof paymentStatusColors]}`}>
                {paymentStatus}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Total Amount</p>
              <p className="text-lg font-semibold text-gray-800">
                ${parseFloat(order.total_amount || "0").toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Order Date</p>
              <p className="text-sm font-medium text-gray-800">
                {formatDate(order.created_at)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {formatTime(order.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Notes */}
          {order.order_notes && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4 shadow-sm">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-yellow-800 mb-1">Order Notes</h4>
                  <p className="text-sm text-yellow-700 whitespace-pre-wrap">{order.order_notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Order Items - Kitchen Friendly Display */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Order Items ({order.total_items} items, {order.total_quantity} total)
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {order.order_items && order.order_items.length > 0 ? (
                order.order_items.map((item, index) => (
                  <div
                    key={`${item.item_id}-${index}`}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    {/* Item Header */}
                    <div className="flex items-start space-x-4 mb-3">
                      <img
                        src={getImageUrl(item.cover_image_url) || DEFAULT_IMAGE}
                        alt={item.item_name}
                        className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_IMAGE;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 mb-1">
                              {item.item_name}
                            </h4>
                            {item.short_description && (
                              <p className="text-sm text-gray-600 mb-2">{item.short_description}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold text-green-700">
                              ${(parseFloat(String(item.unit_price || "0")) * item.total_quantity).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              ${parseFloat(String(item.unit_price || "0")).toFixed(2)} × {item.total_quantity}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Size and Flavor */}
                    {(item.size_name || item.flavor_name) && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.size_name && (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                            Size: {item.size_name}
                          </span>
                        )}
                        {item.flavor_name && (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                            Flavor: {item.flavor_name}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Addons - Eye-catching Design */}
                    {item.addons && item.addons.length > 0 && (
                      <div className="mb-4 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 via-emerald-400/10 to-teal-400/10 rounded-xl"></div>
                        <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-300 shadow-lg">
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg shadow-md">
                              <Plus className="w-4 h-4 text-white" />
                            </div>
                            <h5 className="text-sm font-bold text-green-800 uppercase tracking-wider">
                              Addons ({item.addons.length})
                            </h5>
                          </div>
                          <div className="space-y-2.5">
                            {item.addons.map((addon, addonIndex) => (
                              <div
                                key={addonIndex}
                                className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                              >
                                <div className="flex items-center space-x-3 flex-1">
                                  <div className="relative">
                                    <div className="w-3 h-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-sm"></div>
                                    <div className="absolute inset-0 w-3 h-3 bg-green-400 rounded-full animate-ping opacity-75"></div>
                                  </div>
                                  <div className="flex-1">
                                    <span className="font-bold text-gray-900 text-sm">
                                      {addon.addon_name}
                                    </span>
                                    {addon.addon_description && (
                                      <p className="text-xs text-gray-600 mt-0.5">
                                        {addon.addon_description}
                                      </p>
                                    )}
                                    {addon.addon_quantity > 1 && (
                                      <span className="inline-block ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                        × {addon.addon_quantity}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                {parseFloat(String(addon.addon_price || "0")) > 0 && (
                                  <div className="ml-3">
                                    <span className="inline-flex items-center px-2.5 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-lg border border-green-300">
                                      +${parseFloat(String(addon.addon_price)).toFixed(2)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Item Notes - Powerful Design */}
                    {item.notes && (
                      <div className="mb-3 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-amber-400/20 to-orange-400/20 rounded-xl"></div>
                        <div className="relative bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-xl p-4 border-2 border-yellow-400 shadow-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 p-2 rounded-lg shadow-md">
                              <FileText className="w-4 h-4 text-white" />
                            </div>
                            <h5 className="text-sm font-bold text-yellow-900 uppercase tracking-wider">
                              Special Instructions
                            </h5>
                          </div>
                          <div className="bg-white rounded-lg p-3 border-2 border-yellow-300 shadow-sm">
                            <p className="text-sm font-semibold text-yellow-900 whitespace-pre-wrap leading-relaxed">
                              {item.notes}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No items found for this order</p>
                </div>
              )}

              {/* Total Summary */}
              <div className="mt-6 pt-4 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Grand Total:</span>
                  <span className="text-2xl font-bold text-green-700">
                    ${parseFloat(order.total_amount || "0").toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {order.payments && order.payments.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Payment Information
                </h3>
              </div>
              <div className="p-6">
                {order.payments.map((payment) => (
                  <div key={payment.id} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                        <p className="font-medium text-gray-800">{payment.payment_method}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold border ${paymentStatusColors[payment.payment_status as keyof typeof paymentStatusColors]}`}>
                          {payment.payment_status}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payment Amount</p>
                        <p className="font-medium text-green-700">${parseFloat(payment.payment_amount || "0").toFixed(2)}</p>
                      </div>
                      {payment.paid_at && (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Paid At</p>
                          <p className="font-medium text-gray-800">
                            {formatDate(payment.paid_at)} {formatTime(payment.paid_at)}
                          </p>
                        </div>
                      )}
                    </div>
                    {payment.payment_reference && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payment Reference</p>
                        <p className="font-mono text-sm text-gray-800 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                          {payment.payment_reference}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {order.reviews && order.reviews.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Customer Reviews
                </h3>
              </div>
              <div className="p-6">
                {order.reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 mb-4 last:border-b-0 last:mb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-800">
                          {review.customer_first_name} {review.customer_last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(review.created_at)} {formatTime(review.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mt-2 text-sm">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Customer Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <p className="font-semibold text-gray-800">
                    {order.customer.first_name} {order.customer.last_name}
                  </p>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-700">{order.customer.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-700">{order.customer.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Vendor Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Vendor Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {order.vendor.restaurant_image && (
                <div className="flex justify-center mb-4">
                  <img
                    src={getImageUrl(order.vendor.restaurant_image) || DEFAULT_VENDOR_IMAGE}
                    alt={order.vendor.restaurant_name}
                    className="w-24 h-24 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_VENDOR_IMAGE;
                    }}
                  />
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="font-semibold text-gray-800 mb-3">
                  {order.vendor.restaurant_name}
                </p>
                <div className="flex items-center space-x-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-700">
                    {order.vendor.first_name} {order.vendor.last_name}
                  </p>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-700">{order.vendor.email}</p>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-700">{order.vendor.phone}</p>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {order.vendor.is_food && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-800 border border-orange-200">
                      <Utensils className="w-3 h-3 mr-1" />
                      Food
                    </span>
                  )}
                  {order.vendor.is_grocery && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-50 text-green-800 border border-green-200">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Grocery
                    </span>
                  )}
                </div>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                  <div className="text-sm text-gray-700">
                    <p>{order.vendor.address1}</p>
                    {order.vendor.address2 && <p>{order.vendor.address2}</p>}
                    <p>
                      {order.vendor.city}, {order.vendor.state} {order.vendor.zip_code}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rider Information */}
          {order.rider && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Delivery Rider
                </h3>
              </div>
              <div className="p-6">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <p className="font-semibold text-gray-800">
                      {order.rider.first_name} {order.rider.last_name}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-700">{order.rider.email}</p>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <p className="text-sm text-gray-700">{order.rider.phone}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {order.rider.is_online ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-xs font-semibold ${order.rider.is_online ? "text-green-700" : "text-red-700"}`}>
                      {order.rider.is_online ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Shipping Address */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Shipping Address
              </h3>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">{order.customer.shipping_address.line1}</p>
                    {order.customer.shipping_address.line2 && (
                      <p>{order.customer.shipping_address.line2}</p>
                    )}
                    {(order.customer.shipping_address.city || order.customer.shipping_address.state || order.customer.shipping_address.zip) && (
                      <p>
                        {order.customer.shipping_address.city && `${order.customer.shipping_address.city}, `}
                        {order.customer.shipping_address.state && `${order.customer.shipping_address.state} `}
                        {order.customer.shipping_address.zip}
                      </p>
                    )}
                    {order.customer.shipping_address.country && (
                      <p className="text-gray-600 mt-1">{order.customer.shipping_address.country}</p>
                    )}
                    {(order.customer.shipping_address.latitude && order.customer.shipping_address.longitude) && (
                      <p className="text-xs text-gray-500 mt-2 font-mono">
                        {order.customer.shipping_address.latitude.toFixed(6)}, {order.customer.shipping_address.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Print Styles - Thermal Printer Format */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          body * {
            visibility: hidden;
          }
          
          .receipt-print,
          .receipt-print * {
            visibility: visible;
          }
          
          .receipt-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            max-width: 80mm;
            padding: 10mm 5mm;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.4;
            background: white;
            color: black;
          }
          
          .receipt-header {
            text-align: center;
            margin-bottom: 8px;
          }
          
          .receipt-header h1 {
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 4px 0;
            text-transform: uppercase;
          }
          
          .receipt-header h2 {
            font-size: 13px;
            font-weight: bold;
            margin: 0 0 6px 0;
          }
          
          .receipt-address {
            font-size: 10px;
            line-height: 1.3;
            margin-top: 4px;
          }
          
          .receipt-divider {
            border-top: 1px dashed #000;
            margin: 8px 0;
          }
          
          .receipt-info {
            margin: 6px 0;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 3px;
            font-size: 11px;
          }
          
          .receipt-items {
            margin: 6px 0;
          }
          
          .items-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 10px;
            margin-bottom: 4px;
            border-bottom: 1px solid #000;
            padding-bottom: 2px;
          }
          
          .item-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 4px;
            font-size: 10px;
            line-height: 1.3;
          }
          
          .item-name {
            flex: 1;
            text-align: left;
            word-break: break-word;
            padding-right: 4px;
          }
          
          .item-qty {
            width: 25px;
            text-align: center;
          }
          
          .item-price {
            width: 40px;
            text-align: right;
            padding-right: 4px;
          }
          
          .item-total {
            width: 45px;
            text-align: right;
          }
          
          .receipt-total {
            margin: 6px 0;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 4px;
            border-top: 1px solid #000;
            border-bottom: 1px solid #000;
            padding: 4px 0;
          }
          
          .receipt-footer {
            text-align: center;
            margin-top: 8px;
            font-size: 10px;
          }
          
          .receipt-footer p {
            margin: 2px 0;
          }
          
          .footer-date {
            font-size: 9px;
            color: #666;
          }
        }
      `}</style>
    </>
  );
}

