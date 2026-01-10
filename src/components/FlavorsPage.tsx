import { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
  Sparkles,
  CheckCircle,
  XCircle,
  Loader,
  Filter,
  ImageIcon,
} from "lucide-react";
import {
  apiService,
  Flavor,
  CreateFlavorRequest,
} from "../services/api";

const IMAGE_BASE_URL = ((import.meta.env.VITE_IMAGE_BASE_URL as string) || "https://groceryapp-production-d3fc.up.railway.app").trim().replace(/\/+$/, "");

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

export default function FlavorsPage() {
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState<Flavor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    flavorName: "",
    description: "",
    imageUrl: "",
    isActive: true,
  });

  useEffect(() => {
    loadFlavors();
  }, []);

  const loadFlavors = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getAllFlavors();

      if (response.errorCode === 0 && response.data) {
        // Map snake_case API response to camelCase for component
        const mapped = response.data.map((flavor: any) => ({
          id: flavor.id,
          flavorName: flavor.flavor_name || flavor.flavorName,
          description: flavor.description || "",
          imageUrl: flavor.image_url || flavor.imageUrl,
          isActive: flavor.is_active !== undefined ? flavor.is_active : flavor.isActive,
          createdAt: flavor.created_at || flavor.createdAt,
          updatedAt: flavor.updated_at || flavor.updatedAt,
          userId: flavor.user_id || flavor.userId,
        }));
        setFlavors(mapped);
      } else {
        setError(response.errorMessage || "Failed to load flavors");
      }
    } catch (error) {
      console.error("Error loading flavors:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Failed to load flavors",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      flavorName: "",
      description: "",
      imageUrl: "",
      isActive: true,
    });
    setImagePreview("");
    setEditingFlavor(null);
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "error",
          title: "Invalid File",
          text: "Please select an image file",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Image size should be less than 5MB",
        });
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData((prev) => ({ ...prev, imageUrl: base64String }));
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddClick = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleEditClick = (flavor: Flavor) => {
    setFormData({
      flavorName: flavor.flavorName,
      description: flavor.description || "",
      imageUrl: flavor.imageUrl || "",
      isActive: flavor.isActive !== undefined ? flavor.isActive : true,
    });
    setImagePreview(flavor.imageUrl ? getImageUrl(flavor.imageUrl) : "");
    setEditingFlavor(flavor);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.flavorName.trim()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Flavor name is required",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const requestData: CreateFlavorRequest = {
        id: editingFlavor?.id,
        flavor_name: formData.flavorName.trim(),
        description: formData.description.trim() || undefined,
        image_url: formData.imageUrl || undefined,
        is_active: formData.isActive,
      };

      const response = await apiService.createOrUpdateFlavor(requestData);

      if (response.errorCode === 0) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: editingFlavor
            ? "Flavor updated successfully"
            : "Flavor created successfully",
        });
        setShowAddForm(false);
        resetForm();
        loadFlavors();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.errorMessage || "Failed to save flavor",
        });
      }
    } catch (error) {
      console.error("Error saving flavor:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Failed to save flavor",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (flavor: Flavor) => {
    if (!flavor.id) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${flavor.flavorName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await apiService.deleteFlavor(flavor.id);
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Flavor has been deleted.",
          });
          loadFlavors();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message || "Failed to delete flavor",
          });
        }
      } catch (error) {
        console.error("Error deleting flavor:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "Failed to delete flavor",
        });
      }
    }
  };

  const filteredFlavors = flavors.filter((flavor) => {
    const flavorName = (flavor.flavorName || "").toLowerCase();
    const description = (flavor.description || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return flavorName.includes(search) || description.includes(search);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading flavors...</p>
        </div>
      </div>
    );
  }

  const activeFlavors = flavors.filter((flavor) => flavor.isActive).length;
  const inactiveFlavors = flavors.filter((flavor) => !flavor.isActive).length;

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">
                    Flavors Management
                  </h1>
                  <p className="text-white text-opacity-90">
                    Manage flavors and variations for your items
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleAddClick}
              className="bg-white text-red-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Flavor</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600 mb-1">Total Flavors</p>
              <p className="text-3xl font-bold text-blue-700">
                {flavors.length}
              </p>
              <p className="text-xs text-blue-500 mt-1">All flavors in system</p>
            </div>
            <div className="bg-blue-200 p-4 rounded-xl group-hover:scale-110 transition-transform">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 opacity-20 rounded-full -mr-10 -mt-10"></div>
        </div>

        <div className="group relative bg-gradient-to-br from-green-50 via-green-50 to-green-100 rounded-xl border-2 border-green-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-600 mb-1">Active Flavors</p>
              <p className="text-3xl font-bold text-green-700">
                {activeFlavors}
              </p>
              <p className="text-xs text-green-500 mt-1">Currently available</p>
            </div>
            <div className="bg-green-200 p-4 rounded-xl group-hover:scale-110 transition-transform">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-200 opacity-20 rounded-full -mr-10 -mt-10"></div>
        </div>

        <div className="group relative bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-600 mb-1">Filtered Results</p>
              <p className="text-3xl font-bold text-orange-700">
                {filteredFlavors.length}
              </p>
              <p className="text-xs text-orange-500 mt-1">Matching your search</p>
            </div>
            <div className="bg-orange-200 p-4 rounded-xl group-hover:scale-110 transition-transform">
              <Filter className="w-8 h-8 text-orange-600" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 opacity-20 rounded-full -mr-10 -mt-10"></div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search flavors by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadFlavors}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-50 text-gray-700 rounded-xl border border-gray-200 hover:bg-gray-100 transition-all font-medium"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-xl text-sm flex items-center space-x-2">
          <XCircle className="w-5 h-5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Flavors List */}
      {filteredFlavors.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {searchTerm ? "No flavors found" : "No flavors yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Get started by creating your first flavor"}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add New Flavor
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlavors.map((flavor) => (
            <div
              key={flavor.id}
              className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 p-6 hover:shadow-xl hover:border-pink-300 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {flavor.isActive ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                    <XCircle className="w-3 h-3 mr-1" />
                    Inactive
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="mb-4 pt-8">
                {/* Image or Icon */}
                {flavor.imageUrl ? (
                  <div className="w-16 h-16 rounded-xl overflow-hidden mb-4 group-hover:scale-110 transition-transform border-2 border-pink-200">
                    <img
                      src={getImageUrl(flavor.imageUrl)}
                      alt={flavor.flavorName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-pink-100 to-purple-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-8 h-8 text-pink-600" />
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-pink-600 transition-colors">
                  {flavor.flavorName}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                  {flavor.description || "No description provided"}
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t-2 border-gray-200">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEditClick(flavor)}
                    className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-200"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(flavor)}
                    className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Decorative Circle */}
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-pink-100 opacity-20 rounded-full -mr-12 -mb-12"></div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-red-500 to-red-600 px-6 py-5 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {editingFlavor ? "Edit Flavor" : "Add New Flavor"}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Flavor Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.flavorName}
                  onChange={(e) => handleInputChange("flavorName", e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white"
                  placeholder="e.g., Chicken Tikka"
                  required
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all bg-white resize-none"
                  rows={3}
                  placeholder="Juicy chicken tikka marinated in rich spices..."
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Flavor Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="space-y-3">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setFormData((prev) => ({ ...prev, imageUrl: "" }));
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-pink-500 hover:bg-pink-50 transition-all"
                    >
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload image</p>
                      <p className="text-xs text-gray-400 mt-1">Max 5MB</p>
                    </div>
                  )}
                  {!imagePreview && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
                    >
                      Choose Image
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange("isActive", e.target.checked)}
                    className="w-5 h-5 text-pink-500 border-gray-300 rounded focus:ring-pink-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700 block">
                      Active Status
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Only active flavors will be available for selection
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t-2 border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isSubmitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {editingFlavor ? "Update" : "Create"} Flavor
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

