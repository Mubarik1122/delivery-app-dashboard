import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Lock,
  Shield,
  Store,
  Building,
  AlertCircle,
  Trash2,
  ArrowLeft,
  Loader,
  Utensils,
  ShoppingCart,
  Globe,
  FileText,
  Award,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { apiService, User as ApiUser } from "../services/api";

interface ProfilePageProps {
  onBack?: () => void;
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ApiUser | null>(null);
  const [formData, setFormData] = useState<Partial<ApiUser>>({});
  const hasFetchedRef = useRef(false);

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

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiService.getProfileData();

      if (response.errorCode === 0 && response.data) {
        // API returns array, get first user
        const userData = Array.isArray(response.data) ? response.data[0] : response.data;
        setProfileData(userData);
        setFormData(userData);
      } else {
        throw new Error(response.errorMessage || "Failed to load profile data");
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message || "Failed to load profile data");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to load profile data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Prevent multiple calls due to React StrictMode
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchUserProfile();
  }, []);

  const handleSave = async () => {
    if (!profileData) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      const updateData = {
        first_name: formData.first_name || profileData.first_name,
        last_name: formData.last_name || profileData.last_name,
        phone_number: formData.phone_number || profileData.phone_number,
        email_address: formData.email_address || profileData.email_address,
        street_address1: formData.street_address1 || profileData.street_address1,
        street_address2: formData.street_address2 || profileData.street_address2,
        city: formData.city || profileData.city,
        state: formData.state || profileData.state,
        zip_code: formData.zip_code || profileData.zip_code,
        description: formData.description || profileData.description,
        restaurant_name: formData.restaurant_name || profileData.restaurant_name,
      };

      await apiService.updateUser(profileData.id, updateData);

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      await fetchUserProfile(); // Refresh data
      
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Profile updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!profileData) return;

    const result = await Swal.fire({
      title: "Delete Account?",
      text: "Are you sure you want to delete your account? This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete my account",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setIsDeleting(true);
      await apiService.deleteUser(profileData.id);

      await Swal.fire({
        icon: "success",
        title: "Account Deleted",
        text: "Your account has been permanently deleted.",
        timer: 2000,
        showConfirmButton: false,
      });

      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_data");
      window.location.href = "/";
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Deletion Failed",
        text: err.message || "Failed to delete account. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field: keyof ApiUser, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    if (profileData) {
      setFormData(profileData);
    }
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const getFullAddress = () => {
    if (!profileData) return "";
    const { street_address1, street_address2, city, state, zip_code } = profileData;
    return `${street_address1}${street_address2 ? ", " + street_address2 : ""}, ${city}, ${state} ${zip_code}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = () => {
    if (!profileData) return "U";
    return `${profileData.first_name?.charAt(0) || ""}${profileData.last_name?.charAt(0) || ""}`.toUpperCase();
  };

  const getRoleDisplay = (role?: string) => {
    if (!role) return "User";
    const roleMap: { [key: string]: string } = {
      admin: "Administrator",
      vendor: "Vendor",
      rider: "Delivery Rider",
      user: "User",
    };
    return roleMap[role.toLowerCase()] || role;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 text-red-500 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-xl p-8">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h3 className="text-xl font-semibold mb-2 text-gray-800">Profile Not Available</h3>
            <p className="text-gray-600 mb-6">{error || "Unable to load profile data."}</p>
            <div className="space-y-3">
              <button
                onClick={handleBackClick}
                className="w-full bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                Go Back
              </button>
              <button
                onClick={fetchUserProfile}
                className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Header Section */}
      <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-2xl shadow-xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBackClick}
              className="text-white hover:text-gray-200 transition-colors flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-lg backdrop-blur-sm"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile/Business Image */}
            <div className="relative group">
              {profileData.restaurant_image ? (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-transparent opacity-30 rounded-full blur-xl"></div>
                  <img
                    src={getImageUrl(profileData.restaurant_image)}
                    alt={profileData.restaurant_name || `${profileData.first_name} ${profileData.last_name}`}
                    className="relative w-44 h-44 rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-white ring-opacity-30 transform transition-transform duration-300 group-hover:scale-105"
                  />
                  {isEditing && (
                    <button className="absolute bottom-3 right-3 bg-white rounded-full p-3 shadow-xl border-2 border-red-500 hover:bg-gray-50 transition-all hover:scale-110 z-10">
                      <Camera className="w-5 h-5 text-red-600" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-transparent opacity-30 rounded-full blur-xl"></div>
                  <div className="relative w-44 h-44 rounded-full bg-white bg-opacity-20 backdrop-blur-sm border-4 border-white shadow-2xl ring-4 ring-white ring-opacity-30 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-105">
                    <span className="text-white text-5xl font-bold">{getInitials()}</span>
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-3 right-3 bg-white rounded-full p-3 shadow-xl border-2 border-red-500 hover:bg-gray-50 transition-all hover:scale-110 z-10">
                      <Camera className="w-5 h-5 text-red-600" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-white mb-2">
                {profileData.first_name} {profileData.last_name}
              </h1>
              <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                {profileData.role_name?.toLowerCase() === "vendor" ? (
                  <div className="flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Store className="w-5 h-5 text-white" />
                    <span className="text-white font-medium">{getRoleDisplay(profileData.role_name)}</span>
                  </div>
                ) : profileData.role_name?.toLowerCase() === "rider" ? (
                  <div className="flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <User className="w-5 h-5 text-white" />
                    <span className="text-white font-medium">{getRoleDisplay(profileData.role_name)}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Shield className="w-5 h-5 text-white" />
                    <span className="text-white font-medium">{getRoleDisplay(profileData.role_name)}</span>
                  </div>
                )}
                {profileData.is_active !== false && (
                  <div className="flex items-center space-x-2 bg-green-500 bg-opacity-90 backdrop-blur-sm px-4 py-2 rounded-full">
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span className="text-white font-medium text-sm">Active</span>
                  </div>
                )}
                {profileData.is_active === false && (
                  <div className="flex items-center space-x-2 bg-red-500 bg-opacity-90 backdrop-blur-sm px-4 py-2 rounded-full">
                    <XCircle className="w-4 h-4 text-white" />
                    <span className="text-white font-medium text-sm">Inactive</span>
                  </div>
                )}
              </div>
              {profileData.restaurant_name && (
                <p className="text-white text-lg opacity-90 mb-2">
                  <Store className="w-4 h-4 inline mr-2" />
                  {profileData.restaurant_name}
                </p>
              )}
              {profileData.description && (
                <p className="text-white opacity-80 max-w-2xl">{profileData.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-3" />
            <p>{error}</p>
          </div>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 mr-3" />
            <p>{success}</p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Info */}
        <div className="space-y-6">
          {/* Contact Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-red-500" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email_address || ""}
                      onChange={(e) => handleInputChange("email_address", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{profileData.email_address}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-green-50 p-2 rounded-lg">
                  <Phone className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone_number || ""}
                      onChange={(e) => handleInputChange("phone_number", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium">{profileData.phone_number}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-purple-50 p-2 rounded-lg">
                  <MapPin className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</p>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={formData.street_address1 || ""}
                        onChange={(e) => handleInputChange("street_address1", e.target.value)}
                        placeholder="Street Address 1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      />
                      <input
                        type="text"
                        value={formData.street_address2 || ""}
                        onChange={(e) => handleInputChange("street_address2", e.target.value)}
                        placeholder="Street Address 2 (Optional)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={formData.city || ""}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          placeholder="City"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        />
                        <input
                          type="text"
                          value={formData.state || ""}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          placeholder="State"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                        />
                      </div>
                      <input
                        type="text"
                        value={formData.zip_code || ""}
                        onChange={(e) => handleInputChange("zip_code", e.target.value)}
                        placeholder="ZIP Code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-800 font-medium">{getFullAddress()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-red-500" />
              Account Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">User ID</span>
                <span className="text-sm font-medium text-gray-800">#{profileData.id}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Role</span>
                <span className="text-sm font-medium text-gray-800 capitalize">{getRoleDisplay(profileData.role_name)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Status</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${profileData.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {profileData.is_active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">Joined</span>
                <span className="text-sm font-medium text-gray-800">{formatDate(profileData.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Location Card */}
          {(profileData.latitude && profileData.longitude) && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-red-500" />
                Location Coordinates
              </h3>
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Latitude</p>
                  <p className="text-gray-800 font-mono font-medium">{profileData.latitude.toFixed(6)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Longitude</p>
                  <p className="text-gray-800 font-mono font-medium">{profileData.longitude.toFixed(6)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-red-500" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.first_name || ""}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                ) : (
                  <p className="text-gray-800 font-medium py-2">{profileData.first_name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.last_name || ""}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                ) : (
                  <p className="text-gray-800 font-medium py-2">{profileData.last_name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Information (for Vendors) */}
          {profileData.role_name?.toLowerCase() === "vendor" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <Store className="w-5 h-5 mr-2 text-red-500" />
                Business Information
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.restaurant_name || ""}
                      onChange={(e) => handleInputChange("restaurant_name", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  ) : (
                    <p className="text-gray-800 font-medium py-2">{profileData.restaurant_name || "Not specified"}</p>
                  )}
                </div>

                {/* Business Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Business Type</label>
                  <div className="flex flex-wrap gap-3">
                    {profileData.is_food && (
                      <div className="flex items-center space-x-2 bg-orange-50 border border-orange-200 px-4 py-2 rounded-lg">
                        <Utensils className="w-4 h-4 text-orange-600" />
                        <span className="text-orange-800 font-medium">Food Restaurant</span>
                      </div>
                    )}
                    {profileData.is_grocery && (
                      <div className="flex items-center space-x-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
                        <ShoppingCart className="w-4 h-4 text-green-600" />
                        <span className="text-green-800 font-medium">Grocery</span>
                      </div>
                    )}
                    {!profileData.is_food && !profileData.is_grocery && (
                      <span className="text-gray-500 text-sm">Not specified</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                {profileData.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    {isEditing ? (
                      <textarea
                        value={formData.description || ""}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    ) : (
                      <p className="text-gray-800 py-2 whitespace-pre-wrap">{profileData.description}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Agreement Document (for All Roles) */}
          {profileData.agreement_docs && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-red-500" />
                Agreement Document
              </h3>
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">Agreement Document</p>
                    <p className="text-xs text-gray-500 mb-4">View or download your agreement document</p>
                    <a 
                      href={getImageUrl(profileData.agreement_docs)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      <FileText className="w-4 h-4" />
                      <span>View Document</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Documents (for Riders) */}
          {profileData.role_name?.toLowerCase() === "rider" && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-red-500" />
                Additional Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profileData.certificate_doc && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Award className="w-6 h-6 text-green-600 mb-2" />
                    <p className="text-sm font-medium text-gray-800 mb-1">Certificate</p>
                    <a href={getImageUrl(profileData.certificate_doc)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                      View Document
                    </a>
                  </div>
                )}
                {profileData.driver_licence_doc && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <Award className="w-6 h-6 text-purple-600 mb-2" />
                    <p className="text-sm font-medium text-gray-800 mb-1">Driver License</p>
                    <a href={getImageUrl(profileData.driver_licence_doc)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                      View Document
                    </a>
                  </div>
                )}
                {!profileData.certificate_doc && !profileData.driver_licence_doc && (
                  <p className="text-gray-500 text-sm col-span-3">No additional documents uploaded</p>
                )}
              </div>
            </div>
          )}

          {/* Delete Account Button */}
          {!isEditing && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-end">
                <button
                  onClick={handleDeleteProfile}
                  disabled={isDeleting}
                  className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>{isDeleting ? "Deleting..." : "Delete Account"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 font-medium"
                >
                  <Save className="w-5 h-5" />
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
