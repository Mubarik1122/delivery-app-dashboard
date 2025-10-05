import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Loader,
  CreditCard as Edit,
} from "lucide-react";
import { apiService } from "../services/api";

interface DeliverymanDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  joiningDate: string;
  totalOrders: number;
  ongoing: number;
  cancelled: number;
  completed: number;
  payedAmount: number;
  pendingAmount: number;
  status: "active" | "inactive";
}

export default function DeliverymanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deliveryman, setDeliveryman] = useState<DeliverymanDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDeliverymanDetails(parseInt(id));
    }
  }, [id]);

  const loadDeliverymanDetails = async (userId: number) => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();

      if (response.errorCode === 0 && response.data) {
        const driver = response.data.find(
          (user) => user.id === userId && user.role_name === "Rider"
        );

        if (driver) {
          const mappedDriver: DeliverymanDetails = {
            id: driver.id,
            name: `${driver.first_name} ${driver.last_name}`,
            email: driver.email_address,
            phone: driver.phone_number,
            address: `${driver.street_address1}${
              driver.street_address2 ? ", " + driver.street_address2 : ""
            }, ${driver.city}, ${driver.state} ${driver.zip_code}`,
            joiningDate: driver.created_at
              ? new Date(driver.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "2-digit",
                })
              : "N/A",
            totalOrders: 0,
            ongoing: 0,
            cancelled: 0,
            completed: 0,
            payedAmount: 0,
            pendingAmount: 0,
            status: driver.is_active !== false ? "active" : "inactive",
          };
          setDeliveryman(mappedDriver);
        } else {
          Swal.fire({
            icon: "error",
            title: "Not Found",
            text: "Delivery driver not found",
          });
          navigate("/delivery-man-list");
        }
      }
    } catch (error) {
      console.error("Error loading deliveryman details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load delivery driver details",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (!deliveryman) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Delivery driver not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/delivery-man-list")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to List</span>
          </button>
          <button
            onClick={() =>
              navigate(`/delivery-man-list/edit/${deliveryman.id}`)
            }
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>

        <div className="flex items-start space-x-6 mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-12 h-12 text-gray-500" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {deliveryman.name}
            </h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                deliveryman.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {deliveryman.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Contact Information
            </h2>
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-800 font-medium">{deliveryman.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-gray-800 font-medium">{deliveryman.phone}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-gray-800 font-medium">
                  {deliveryman.address}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Joining Date</p>
                <p className="text-gray-800 font-medium">
                  {deliveryman.joiningDate}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Order Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <Package className="w-6 h-6 text-blue-600 mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {deliveryman.totalOrders}
                </p>
                <p className="text-sm text-blue-700">Total Orders</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <Package className="w-6 h-6 text-orange-600 mb-2" />
                <p className="text-2xl font-bold text-orange-600">
                  {deliveryman.ongoing}
                </p>
                <p className="text-sm text-orange-700">Ongoing</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <Package className="w-6 h-6 text-green-600 mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {deliveryman.completed}
                </p>
                <p className="text-sm text-green-700">Completed</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <Package className="w-6 h-6 text-red-600 mb-2" />
                <p className="text-2xl font-bold text-red-600">
                  {deliveryman.cancelled}
                </p>
                <p className="text-sm text-red-700">Cancelled</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold text-green-800">
                Paid Amount
              </h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              ${deliveryman.payedAmount.toFixed(2)}
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-2">
              <DollarSign className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold text-orange-800">
                Pending Amount
              </h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              ${deliveryman.pendingAmount.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
