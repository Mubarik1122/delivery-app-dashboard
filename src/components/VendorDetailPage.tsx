import { useState, useEffect, useRef } from "react";
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
  Utensils,
  ShoppingCart,
  FileText,
} from "lucide-react";
import { apiService } from "../services/api";

interface VendorDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  restaurantName: string;
  restaurantImage?: string;
  joinDate: string;
  status: "active" | "inactive";
  description?: string;
  is_food?: boolean;
  is_grocery?: boolean;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  zip_code?: string;
  street_address1?: string;
  street_address2?: string;
}

export default function VendorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<VendorDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  const isLoadingRef = useRef(false);

  // Image base URL from environment variable (only for images, not for API calls)
  const IMAGE_BASE_URL = ((import.meta.env.VITE_IMAGE_BASE_URL as string) || "https://groceryapp-production-d3fc.up.railway.app").trim().replace(/\/+$/, "");

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string | undefined | null): string => {
    if (!imagePath) return "";
    
    // Trim the path to remove any leading/trailing spaces
    const trimmedPath = imagePath.trim();
    
    // If already a full URL (starts with http:// or https://), return as is
    if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
      return trimmedPath;
    }
    
    // Remove leading slash if present
    const cleanPath = trimmedPath.startsWith("/") ? trimmedPath.substring(1) : trimmedPath;
    
    // Join base URL and path without double slashes
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  };

  useEffect(() => {
    // Reset mounted flag when component mounts
    isMountedRef.current = true;
    isLoadingRef.current = false;
    
    if (id && !isLoadingRef.current) {
      loadVendorDetails(parseInt(id));
    }
    
    // Cleanup function to mark component as unmounted
    return () => {
      isMountedRef.current = false;
      isLoadingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Only run when id changes

  const loadVendorDetails = async (userId: number) => {
    // Prevent duplicate calls
    if (isLoadingRef.current) {
      return;
    }
    
    try {
      isLoadingRef.current = true;
      setLoading(true);
      // Call API with role=Vendor and user_id
      const response = await apiService.getUsers('Vendor', userId);
      
      // Check if component is still mounted before processing response
      if (!isMountedRef.current) {
        return;
      }

      if (response.errorCode === 0 && response.data) {
        // Check if component is still mounted
        if (!isMountedRef.current) {
          return;
        }

        // API will return the specific vendor directly
        const vendorUser = Array.isArray(response.data) ? response.data[0] : response.data;

        // Check again if component is still mounted
        if (!isMountedRef.current) {
          return;
        }

        if (vendorUser && vendorUser.role_name === "Vendor") {
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
            restaurantImage: getImageUrl(vendorUser.restaurant_image),
            joinDate: vendorUser.created_at
              ? new Date(vendorUser.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "2-digit",
                })
              : "N/A",
            status: vendorUser.is_active !== false ? "active" : "inactive",
            description: vendorUser.description,
            is_food: vendorUser.is_food,
            is_grocery: vendorUser.is_grocery,
            latitude: vendorUser.latitude,
            longitude: vendorUser.longitude,
            city: vendorUser.city,
            state: vendorUser.state,
            zip_code: vendorUser.zip_code,
            street_address1: vendorUser.street_address1,
            street_address2: vendorUser.street_address2,
          };
          setVendor(mappedVendor);
        } else {
          // Check if component is still mounted before showing error
          if (!isMountedRef.current) {
            return;
          }
          Swal.fire({
            icon: "error",
            title: "Not Found",
            text: "Vendor not found",
          });
          navigate("/vendors");
        }
      }
    } catch (error: any) {
      // Don't show error if component is unmounted
      if (!isMountedRef.current) {
        return;
      }
      console.error("Error loading vendor details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load vendor details",
      });
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false);
      }
      isLoadingRef.current = false;
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
          {vendor.restaurantImage ? (
            <img
              src={vendor.restaurantImage}
              alt={vendor.restaurantName}
              className="w-24 h-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
              <Building className="w-12 h-12 text-gray-500" />
            </div>
          )}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Contact Information</span>
            </h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Email Address</p>
                  <p className="text-gray-800 font-medium break-all">{vendor.email}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="text-gray-800 font-medium">{vendor.phone}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Full Address</p>
                  <p className="text-gray-800 font-medium">{vendor.address}</p>
                  {vendor.latitude && vendor.longitude && (
                    <p className="text-xs text-gray-500 mt-1">
                      Location: {vendor.latitude.toFixed(6)}, {vendor.longitude.toFixed(6)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-500 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">Join Date</p>
                  <p className="text-gray-800 font-medium">{vendor.joinDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
              <Building className="w-5 h-5" />
              <span>Business Information</span>
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Business Type</p>
                <div className="flex items-center space-x-3 mt-2">
                  {vendor.is_food && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      <Utensils className="w-4 h-4 mr-1" />
                      Food Restaurant
                    </span>
                  )}
                  {vendor.is_grocery && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Grocery
                    </span>
                  )}
                  {!vendor.is_food && !vendor.is_grocery && (
                    <span className="text-sm text-gray-500">Not specified</span>
                  )}
                </div>
              </div>
              {vendor.description && (
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>Description</span>
                  </p>
                  <p className="text-gray-800 font-medium mt-2">{vendor.description}</p>
                </div>
              )}
              {vendor.street_address1 && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Street Address</p>
                  <p className="text-gray-800 font-medium">
                    {vendor.street_address1}
                    {vendor.street_address2 && `, ${vendor.street_address2}`}
                  </p>
                </div>
              )}
              {(vendor.city || vendor.state || vendor.zip_code) && (
                <div className="grid grid-cols-3 gap-3">
                  {vendor.city && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">City</p>
                      <p className="text-gray-800 font-medium">{vendor.city}</p>
                    </div>
                  )}
                  {vendor.state && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">State</p>
                      <p className="text-gray-800 font-medium">{vendor.state}</p>
                    </div>
                  )}
                  {vendor.zip_code && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Zip Code</p>
                      <p className="text-gray-800 font-medium">{vendor.zip_code}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
