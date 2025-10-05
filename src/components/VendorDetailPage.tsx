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
  Building,
  Loader,
  CreditCard as Edit,
  Package,
  DollarSign,
} from "lucide-react";
import { apiService } from "../services/api";

interface VendorDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  restaurantName: string;
  joinDate: string;
  status: "active" | "inactive";
  totalOrders: number;
  revenue: number;
}

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadVendorDetails(parseInt(id));
    }
  }, [id]);

  const loadVendorDetails = async (userId: number) => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();

      if (response.errorCode === 0 && response.data) {
        const vendorUser = response.data.find(
          (user) => user.id === userId && user.role_name === "Vendor"
        );

        if (vendorUser) {
          const mappedVendor: VendorDetails = {
            id: vendorUser.id,
            name: `${vendorUser.first_name} ${vendorUser.last_name}`,
            email: vendorUser.email_address,
            phone: vendorUser.phone_number,
            address: `${vendorUser.street_address1}${
              vendorUser.street_address2
                ? ", " + vendorUser.street_address2
                : ""
            }, ${vendorUser.city}, ${vendorUser.state} ${vendorUser.zip_code}`,
            restaurantName: vendorUser.restaurant_name || "Restaurant",
            joinDate: vendorUser.created_at
              ? new Date(vendorUser.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "2-digit",
                })
              : "N/A",
            status: vendorUser.is_active !== false ? "active" : "inactive",
            totalOrders: 0,
            revenue: 0,
          };
          setVendor(mappedVendor);
        } else {
          Swal.fire({
            icon: "error",
            title: "Not Found",
            text: "Vendor not found",
          });
          navigate("/vendors");
        }
      }
    } catch (error) {
      console.error("Error loading vendor details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load vendor details",
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

  if (!vendor) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Vendor not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/vendors")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Vendors</span>
          </button>
          <button
            onClick={() => navigate(`/vendors/edit/${vendor.id}`)}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>

        <div className="flex items-start space-x-6 mb-8">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
            <Building className="w-12 h-12 text-gray-500" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              {vendor.name}
            </h1>
            <p className="text-xl text-gray-600 mb-3">
              {vendor.restaurantName}
            </p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                vendor.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {vendor.status === "active" ? "Active" : "Inactive"}
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
                <p className="text-gray-800 font-medium">{vendor.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-gray-800 font-medium">{vendor.phone}</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-500 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="text-gray-800 font-medium">{vendor.address}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Join Date</p>
                <p className="text-gray-800 font-medium">{vendor.joinDate}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Business Statistics
            </h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Package className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-blue-800">
                    Total Orders
                  </h3>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  {vendor.totalOrders}
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-800">
                    Total Revenue
                  </h3>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  ${vendor.revenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
