import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
  Package,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader,
  PlusCircle,
  Filter,
} from "lucide-react";
import {
  apiService,
  Addon,
  CreateAddonRequest,
} from "../services/api";

export default function AddonsPage() {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    addonName: "",
    description: "",
    price: 0,
    isActive: true,
  });

  useEffect(() => {
    loadAddons();
  }, []);

  const loadAddons = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getAllAddons();

      if (response.errorCode === 0 && response.data) {
        // Map snake_case API response to camelCase for component
        const mapped = response.data.map((addon: any) => ({
          id: addon.id,
          addonName: addon.addon_name || addon.addonName,
          description: addon.description,
          price: typeof addon.price === 'string' ? parseFloat(addon.price) : (typeof addon.price === 'number' ? addon.price : 0),
          isActive: addon.is_active !== undefined ? addon.is_active : addon.isActive,
          createdAt: addon.created_at || addon.createdAt,
          updatedAt: addon.updated_at || addon.updatedAt,
          userId: addon.user_id || addon.userId,
        }));
        setAddons(mapped);
      } else {
        setError(response.errorMessage || "Failed to load addons");
      }
    } catch (error) {
      console.error("Error loading addons:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Failed to load addons",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      addonName: "",
      description: "",
      price: 0,
      isActive: true,
    });
    setEditingAddon(null);
  };

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddClick = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleEditClick = (addon: Addon) => {
    setFormData({
      addonName: addon.addonName,
      description: addon.description,
      price: addon.price,
      isActive: addon.isActive,
    });
    setEditingAddon(addon);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.addonName.trim()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Addon name is required",
      });
      return;
    }

    if (formData.price < 0) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Price cannot be negative",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const requestData: CreateAddonRequest = {
        id: editingAddon?.id,
        addonName: formData.addonName.trim(),
        description: formData.description.trim(),
        price: formData.price,
        isActive: formData.isActive,
      };

      const response = await apiService.createAddon(requestData);

      if (response.errorCode === 0) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: editingAddon
            ? "Addon updated successfully"
            : "Addon created successfully",
        });
        setShowAddForm(false);
        resetForm();
        loadAddons();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.errorMessage || "Failed to save addon",
        });
      }
    } catch (error) {
      console.error("Error saving addon:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Failed to save addon",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (addon: Addon) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${addon.addonName}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await apiService.deleteAddon(addon.id);
        if (response.success) {
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Addon has been deleted.",
          });
          loadAddons();
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.message || "Failed to delete addon",
          });
        }
      } catch (error) {
        console.error("Error deleting addon:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error instanceof Error ? error.message : "Failed to delete addon",
        });
      }
    }
  };

  const filteredAddons = addons.filter((addon) =>
    addon.addonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    addon.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading addons...</p>
        </div>
      </div>
    );
  }

  const activeAddons = addons.filter((addon) => addon.isActive).length;
  const inactiveAddons = addons.filter((addon) => !addon.isActive).length;

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
                  <PlusCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">
                    Addons Management
                  </h1>
                  <p className="text-white text-opacity-90">
                    Manage addons and extras for your items
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleAddClick}
              className="bg-white text-red-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Addon</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600 mb-1">Total Addons</p>
              <p className="text-3xl font-bold text-blue-700">
                {addons.length}
              </p>
              <p className="text-xs text-blue-500 mt-1">All addons in system</p>
            </div>
            <div className="bg-blue-200 p-4 rounded-xl group-hover:scale-110 transition-transform">
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 opacity-20 rounded-full -mr-10 -mt-10"></div>
        </div>

        <div className="group relative bg-gradient-to-br from-green-50 via-green-50 to-green-100 rounded-xl border-2 border-green-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-600 mb-1">Active Addons</p>
              <p className="text-3xl font-bold text-green-700">
                {activeAddons}
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
                {filteredAddons.length}
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
                placeholder="Search addons by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadAddons}
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

      {/* Addons List */}
      {filteredAddons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {searchTerm ? "No addons found" : "No addons yet"}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Get started by creating your first addon"}
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Add New Addon
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAddons.map((addon) => (
            <div
              key={addon.id}
              className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 p-6 hover:shadow-xl hover:border-red-300 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {addon.isActive ? (
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
                <div className="bg-gradient-to-br from-red-100 to-orange-100 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <PlusCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-red-600 transition-colors">
                  {addon.addonName}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 min-h-[2.5rem]">
                  {addon.description || "No description provided"}
                </p>
              </div>

              {/* Price and Actions */}
              <div className="pt-4 border-t-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-lg border border-green-200">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-700">
                      ${typeof addon.price === 'number' ? addon.price.toFixed(2) : parseFloat(String(addon.price || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditClick(addon)}
                      className="p-2.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-200"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(addon)}
                      className="p-2.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Decorative Circle */}
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-red-100 opacity-20 rounded-full -mr-12 -mb-12"></div>
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
                  <PlusCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  {editingAddon ? "Edit Addon" : "Add New Addon"}
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
                  Addon Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.addonName}
                  onChange={(e) => handleInputChange("addonName", e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
                  placeholder="e.g., Extra Topping"
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
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white resize-none"
                  rows={3}
                  placeholder="Add extra topping to your item"
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      handleInputChange("price", parseFloat(e.target.value) || 0)
                    }
                    className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange("isActive", e.target.checked)}
                    className="w-5 h-5 text-red-500 border-gray-300 rounded focus:ring-red-500"
                  />
                  <div>
                    <span className="text-sm font-semibold text-gray-700 block">
                      Active Status
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      Only active addons will be available for selection
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
                      {editingAddon ? "Update" : "Create"} Addon
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

