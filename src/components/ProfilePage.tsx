import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { apiService } from "../services/api";

interface ProfilePageProps {
  onBack?: () => void;
}

interface ProfileData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  role: string;
  joinDate: string;
  department?: string;
  restaurantName?: string;
  description?: string;
}

export default function ProfilePage({ onBack }: ProfilePageProps) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  // Enhanced function to get user data from multiple sources
  const getStoredUserData = () => {
    try {
      // Try localStorage first
      const storedUser = localStorage.getItem("user_data");
      if (storedUser) {
        return JSON.parse(storedUser);
      }

      // Try to get from token (fallback)
      const token = localStorage.getItem("auth_token");
      if (token) {
        try {
          // Decode token to get basic user info
          const tokenData = JSON.parse(atob(token.split(".")[1]));

          // Create basic user data from token
          const basicUserData = {
            id: tokenData.userId || tokenData.id || 1,
            first_name: tokenData.first_name || "User",
            last_name: tokenData.last_name || "Name",
            email: tokenData.email || "user@example.com",
            role: tokenData.role || "user",
            phone_number: "+1 (555) 123-4567",
            street_address1: "123 Main Street",
            city: "New York",
            state: "NY",
            zip_code: "10001",
            created_at: new Date().toISOString(),
          };

          // Store this basic data for future use
          localStorage.setItem("user_data", JSON.stringify(basicUserData));
          return basicUserData;
        } catch (tokenError) {
          console.error("Error decoding token:", tokenError);
        }
      }

      return null;
    } catch (error) {
      console.error("Error parsing stored user data:", error);
      return null;
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const storedUser = getStoredUserData();

      if (!storedUser) {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          throw new Error("No user data found. Please log in again.");
        } else {
          const basicProfile: ProfileData = {
            id: 1,
            firstName: "User",
            lastName: "Name",
            email: "user@example.com",
            phone: "+1 (555) 123-4567",
            address: "123 Main Street",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            role: "user",
            joinDate: new Date().toISOString(),
            department: "User account",
          };

          setProfileData(basicProfile);
          setIsLoading(false);
          return;
        }
      }

      // Convert the stored user data to our ProfileData format
      const userData: ProfileData = {
        id: storedUser.id || storedUser.userId || 1,
        firstName: storedUser.first_name || storedUser.firstName || "User",
        lastName: storedUser.last_name || storedUser.lastName || "Name",
        email:
          storedUser.email || storedUser.email_address || "user@example.com",
        phone:
          storedUser.phone_number || storedUser.phone || "+1 (555) 123-4567",
        address:
          storedUser.street_address1 || storedUser.address || "123 Main Street",
        city: storedUser.city || "New York",
        state: storedUser.state || "NY",
        zipCode: storedUser.zip_code || storedUser.zipCode || "10001",
        role: storedUser.role || storedUser.role_name || "user",
        joinDate:
          storedUser.created_at ||
          storedUser.joinDate ||
          new Date().toISOString(),
        department: storedUser.description || storedUser.department || "",
        restaurantName:
          storedUser.restaurant_name || storedUser.restaurantName || "",
      };

      setProfileData(userData);
    } catch (err: any) {
      console.error("Error in fetchUserProfile:", err);
      setError(err.message || "Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleSave = async () => {
    if (!profileData) return;

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      // Prepare update data
      const updateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone_number: profileData.phone,
        email_address: profileData.email,
        street_address1: profileData.address,
        city: profileData.city,
        state: profileData.state,
        zip_code: profileData.zipCode,
        description: profileData.department,
        restaurant_name: profileData.restaurantName,
      };

      // For demo purposes - simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update stored user data
      const currentStoredUser = getStoredUserData();
      const updatedUser = {
        ...currentStoredUser,
        ...updateData,
        id: currentStoredUser?.id || profileData.id,
        role: currentStoredUser?.role || profileData.role,
        email: updateData.email_address,
      };

      localStorage.setItem("user_data", JSON.stringify(updatedUser));

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      console.error("Error updating profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!profileData) return;

    const result = await Swal.fire({
      title: "Delete Profile?",
      text: "Are you sure you want to delete your account? This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete my account",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    // Second confirmation for extra safety
    const finalConfirm = await Swal.fire({
      title: "Final Confirmation",
      text: "This will permanently delete your account and all associated data. Are you absolutely sure?",
      icon: "error",
      input: "text",
      inputPlaceholder: 'Type "DELETE" to confirm',
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Delete Account",
      preConfirm: (value) => {
        if (value !== "DELETE") {
          Swal.showValidationMessage('Please type "DELETE" to confirm');
        }
        return value;
      },
    });

    if (!finalConfirm.isConfirmed) return;

    try {
      setIsDeleting(true);

      // Call API to delete user
      await apiService.deleteUser(profileData.id);

      // Show success message
      await Swal.fire({
        icon: "success",
        title: "Account Deleted",
        text: "Your account has been permanently deleted.",
        timer: 2000,
        showConfirmButton: false,
      });

      // Clear all local storage and redirect to login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("user_data");

      // Redirect to home/login page
      window.location.href = "/";
    } catch (err: any) {
      console.error("Error deleting profile:", err);
      Swal.fire({
        icon: "error",
        title: "Deletion Failed",
        text: err.message || "Failed to delete account. Please try again.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    if (profileData) {
      setProfileData((prev) => (prev ? { ...prev, [field]: value } : null));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccess(null);
    fetchUserProfile();
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
    const { address, city, state, zipCode } = profileData;
    return `${address}, ${city}, ${state} ${zipCode}`;
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = () => {
    if (!profileData) return "U";
    return `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(
      0
    )}`.toUpperCase();
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: { [key: string]: string } = {
      admin: "Administrator",
      vendor: "Vendor",
      user: "User",
    };
    return roleMap[role.toLowerCase()] || role;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">
              Profile Not Available
            </h3>
            <p className="mb-4">{error || "Unable to load profile data."}</p>
            <div className="space-y-2">
              <button
                onClick={handleBackClick}
                className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={fetchUserProfile}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackClick}
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              Profile Settings
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
                {/* Changed: navigate to confirmation page instead of deleting directly */}
                <button
                  onClick={() => navigate("/delete-confirmation")}
                  disabled={isDeleting}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? "Deleting..." : "Delete Profile"}</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">
                    {getInitials()}
                  </span>
                </div>
                {isEditing && (
                  <button className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                )}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">
                {profileData.firstName} {profileData.lastName}
              </h3>
              <div className="flex items-center justify-center space-x-2 mb-2">
                {profileData.role.toLowerCase() === "vendor" ? (
                  <Store className="w-4 h-4 text-green-600" />
                ) : (
                  <Building className="w-4 h-4 text-blue-600" />
                )}
                <p className="text-gray-600 capitalize">
                  {getRoleDisplay(profileData.role)}
                </p>
              </div>
              {profileData.department && (
                <p className="text-sm text-gray-500">
                  {profileData.department}
                </p>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatJoinDate(profileData.joinDate)}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{profileData.phone}</span>
              </div>
              <div className="flex items-start space-x-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>{getFullAddress()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              {profileData.role.toLowerCase() === "vendor"
                ? "Business Information"
                : "Personal Information"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                ) : (
                  <p className="text-gray-800 py-2">{profileData.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                ) : (
                  <p className="text-gray-800 py-2">{profileData.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                ) : (
                  <p className="text-gray-800 py-2">{profileData.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                ) : (
                  <p className="text-gray-800 py-2">{profileData.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                ) : (
                  <p className="text-gray-800 py-2">{profileData.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                ) : (
                  <p className="text-gray-800 py-2">{profileData.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                ) : (
                  <p className="text-gray-800 py-2">{profileData.state}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.zipCode}
                    onChange={(e) =>
                      handleInputChange("zipCode", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                ) : (
                  <p className="text-gray-800 py-2">{profileData.zipCode}</p>
                )}
              </div>

              {/* Vendor-specific fields */}
              {profileData.role.toLowerCase() === "vendor" && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.restaurantName || ""}
                      onChange={(e) =>
                        handleInputChange("restaurantName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  ) : (
                    <p className="text-gray-800 py-2">
                      {profileData.restaurantName || "Not specified"}
                    </p>
                  )}
                </div>
              )}

              {profileData.department && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {profileData.role.toLowerCase() === "vendor"
                      ? "Business Description"
                      : "Description"}
                  </label>
                  {isEditing ? (
                    <textarea
                      value={profileData.department}
                      onChange={(e) =>
                        handleInputChange("department", e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  ) : (
                    <p className="text-gray-800 py-2">
                      {profileData.department}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <p className="text-gray-800 py-2 capitalize">
                  {getRoleDisplay(profileData.role)}
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex space-x-4">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
