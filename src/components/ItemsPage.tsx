import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Save,
  ArrowLeft,
  Loader,
  X,
  Filter,
  RefreshCw,
  Image as ImageIcon,
  Package,
  Upload,
  Link,
  Tag,
  FileText,
} from "lucide-react";
import {
  apiService,
  Item,
  CreateUpdateItemRequest,
  UpdateItemRequest,
  Category,
} from "../services/api";

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [imageUploadMethod, setImageUploadMethod] = useState<"url" | "upload">("url");
  const [backgroundImageMethod, setBackgroundImageMethod] = useState<"url" | "upload">("url");
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [selectedBackgroundFile, setSelectedBackgroundFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [backgroundImagePreview, setBackgroundImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    itemName: "",
    shortDescription: "",
    longDescription: "",
    coverImageUrl: "",
    backgroundImageUrl: "",
    categoryIds: [] as number[],
  });

  // Default demo images
  const DEFAULT_COVER_IMAGE = "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300";
  const DEFAULT_BACKGROUND_IMAGE = "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800";

  useEffect(() => {
    loadItems();
    loadCategories();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getAllItems();

      if (response.errorCode === 0 && response.data) {
        const mapped = response.data.map((item: any) => ({
          id: item.id,
          itemName: item.item_name || item.itemName,
          shortDescription: item.short_description || item.shortDescription,
          longDescription: item.long_description || item.longDescription,
          coverImageUrl: item.cover_image_url || item.coverImageUrl || DEFAULT_COVER_IMAGE,
          backgroundImageUrl: item.background_image_url || item.backgroundImageUrl || DEFAULT_BACKGROUND_IMAGE,
          categoryIds: Array.isArray(item.category_ids) ? item.category_ids : (item.categoryIds || []),
          createdAt: item.created_at || item.createdAt,
          updatedAt: item.updated_at || item.updatedAt,
          vendorId: item.vendor_id || item.vendorId,
        }));
        setItems(mapped);
      } else {
        setError(response.errorMessage || "Failed to load items");
      }
    } catch (error) {
      console.error("Error loading items:", error);
      setError(error instanceof Error ? error.message : "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await apiService.getAllCategories();
      if (response.errorCode === 0 && response.data) {
        const mapped = response.data.map((cat: any) => ({
          id: cat.id,
          categoryName: cat.category_name || cat.categoryName,
          shortDescription: cat.short_description || cat.shortDescription,
          longDescription: cat.long_description || cat.longDescription,
          isSubCategory: cat.is_sub_category || cat.isSubCategory,
          coverImage: cat.cover_image || cat.coverImage || DEFAULT_COVER_IMAGE,
          parentCategoryIds: Array.isArray(cat.parent_categories)
            ? cat.parent_categories.map((p: any) => p.id)
            : [],
        }));
        setCategories(mapped);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategories.length === 0 || 
                           item.categoryIds.some(catId => selectedCategories.includes(catId));
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      itemName: "",
      shortDescription: "",
      longDescription: "",
      coverImageUrl: "",
      backgroundImageUrl: "",
      categoryIds: [],
    });
    setEditingItem(null);
    setSelectedCoverFile(null);
    setSelectedBackgroundFile(null);
    setCoverImagePreview("");
    setBackgroundImagePreview("");
    setImageUploadMethod("url");
    setBackgroundImageMethod("url");
  };

  const handleFileSelect = (type: 'cover' | 'background', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      if (type === 'cover') {
        setSelectedCoverFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setCoverImagePreview(result);
          handleInputChange("coverImageUrl", result);
        };
        reader.readAsDataURL(file);
      } else {
        setSelectedBackgroundFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setBackgroundImagePreview(result);
          handleInputChange("backgroundImageUrl", result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAddItem = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleEditItem = (item: Item) => {
    setFormData({
      itemName: item.itemName,
      shortDescription: item.shortDescription,
      longDescription: item.longDescription,
      coverImageUrl: item.coverImageUrl,
      backgroundImageUrl: item.backgroundImageUrl,
      categoryIds: item.categoryIds,
    });
    setCoverImagePreview(item.coverImageUrl);
    setBackgroundImagePreview(item.backgroundImageUrl);
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const finalCoverImage = formData.coverImageUrl.trim() || DEFAULT_COVER_IMAGE;
      const finalBackgroundImage = formData.backgroundImageUrl.trim() || DEFAULT_BACKGROUND_IMAGE;
      
      const itemData = {
        ...(editingItem && { id: editingItem.id }),
        itemName: formData.itemName.trim(),
        shortDescription: formData.shortDescription.trim(),
        longDescription: formData.longDescription.trim(),
        coverImageUrl: finalCoverImage,
        backgroundImageUrl: finalBackgroundImage,
        categoryIds: formData.categoryIds,
      };

      let response;
      if (editingItem) {
        response = await apiService.updateItem(itemData as UpdateItemRequest);
      } else {
        response = await apiService.createUpdateItem(itemData);
      }

      if (response && response.errorCode === 0) {
        await loadItems();
        setShowAddForm(false);
        resetForm();
      } else {
        setError(response?.errorMessage || `Failed to ${editingItem ? "update" : "create"} item`);
      }
    } catch (error) {
      console.error(`Error ${editingItem ? "updating" : "creating"} item:`, error);
      setError(error instanceof Error ? error.message : `Failed to ${editingItem ? "update" : "create"} item`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
      return;
    }

    try {
      setError("");
      await apiService.deleteItem(itemId);
      await loadItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      setError(error instanceof Error ? error.message : "Failed to delete item");
    }
  };

  const handleCategoryToggle = (categoryId: number) => {
    const newCategoryIds = formData.categoryIds.includes(categoryId)
      ? formData.categoryIds.filter(id => id !== categoryId)
      : [...formData.categoryIds, categoryId];
    handleInputChange("categoryIds", newCategoryIds);
  };

  const getCategoryNames = (categoryIds: number[]) => {
    return categories
      .filter(cat => categoryIds.includes(cat.id))
      .map(cat => cat.categoryName)
      .join(", ");
  };

  if (showAddForm) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Items</span>
              </button>
            </div>
          </div>
          <div className="mt-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {editingItem ? "Edit Item" : "Add New Item"}
            </h1>
            <p className="text-gray-600">
              {editingItem ? "Update item information" : "Create a new item for your menu"}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Item Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) => handleInputChange("itemName", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter item name"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) => handleInputChange("shortDescription", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter short description (max 100 characters)"
                    maxLength={100}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Long Description
                  </label>
                  <textarea
                    value={formData.longDescription}
                    onChange={(e) => handleInputChange("longDescription", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter detailed description of the item"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Categories *
              </label>
              <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No categories available</p>
                ) : (
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                        <input
                          type="checkbox"
                          checked={formData.categoryIds.includes(category.id)}
                          onChange={() => handleCategoryToggle(category.id)}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          disabled={isSubmitting}
                        />
                        <img
                          src={category.coverImage}
                          alt={category.categoryName}
                          className="w-8 h-8 rounded object-cover"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_COVER_IMAGE;
                          }}
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-800">
                            {category.isSubCategory ? "↳ " : ""}{category.categoryName}
                          </span>
                          <p className="text-xs text-gray-500">{category.shortDescription}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          category.isSubCategory ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"
                        }`}>
                          {category.isSubCategory ? "Sub" : "Parent"}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              {formData.categoryIds.length === 0 && (
                <p className="text-sm text-red-500 mt-1">Please select at least one category</p>
              )}
            </div>

            {/* Cover Image Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Cover Image</h3>
              
              <div className="mb-4">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setImageUploadMethod("url");
                      setSelectedCoverFile(null);
                      setCoverImagePreview("");
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      imageUploadMethod === "url"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                    disabled={isSubmitting}
                  >
                    <Link className="w-4 h-4" />
                    <span>Image URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setImageUploadMethod("upload");
                      handleInputChange("coverImageUrl", "");
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      imageUploadMethod === "upload"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                    disabled={isSubmitting}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                  </button>
                </div>
              </div>

              {imageUploadMethod === "url" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.coverImageUrl}
                    onChange={(e) => {
                      handleInputChange("coverImageUrl", e.target.value);
                      setCoverImagePreview(e.target.value);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter cover image URL or leave empty for default"
                    disabled={isSubmitting}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Cover Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedCoverFile ? selectedCoverFile.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">PNG, JPG, GIF up to 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect('cover', e)}
                      className="hidden"
                      id="cover-image-upload"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("cover-image-upload")?.click()}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1 mx-auto"
                      disabled={isSubmitting}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Choose File</span>
                    </button>
                  </div>
                </div>
              )}

              {(coverImagePreview || formData.coverImageUrl) && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image Preview
                  </label>
                  <img
                    src={coverImagePreview || formData.coverImageUrl || DEFAULT_COVER_IMAGE}
                    alt="Cover Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_COVER_IMAGE;
                    }}
                  />
                </div>
              )}
            </div>

            {/* Background Image Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Background Image</h3>
              
              <div className="mb-4">
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setBackgroundImageMethod("url");
                      setSelectedBackgroundFile(null);
                      setBackgroundImagePreview("");
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      backgroundImageMethod === "url"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                    disabled={isSubmitting}
                  >
                    <Link className="w-4 h-4" />
                    <span>Image URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBackgroundImageMethod("upload");
                      handleInputChange("backgroundImageUrl", "");
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-all ${
                      backgroundImageMethod === "upload"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                    disabled={isSubmitting}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                  </button>
                </div>
              </div>

              {backgroundImageMethod === "url" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.backgroundImageUrl}
                    onChange={(e) => {
                      handleInputChange("backgroundImageUrl", e.target.value);
                      setBackgroundImagePreview(e.target.value);
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter background image URL or leave empty for default"
                    disabled={isSubmitting}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Background Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {selectedBackgroundFile ? selectedBackgroundFile.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">PNG, JPG, GIF up to 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect('background', e)}
                      className="hidden"
                      id="background-image-upload"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById("background-image-upload")?.click()}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1 mx-auto"
                      disabled={isSubmitting}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Choose File</span>
                    </button>
                  </div>
                </div>
              )}

              {(backgroundImagePreview || formData.backgroundImageUrl) && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Background Image Preview
                  </label>
                  <img
                    src={backgroundImagePreview || formData.backgroundImageUrl || DEFAULT_BACKGROUND_IMAGE}
                    alt="Background Preview"
                    className="w-64 h-32 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_BACKGROUND_IMAGE;
                    }}
                  />
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={isSubmitting || formData.categoryIds.length === 0}
                className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>
                  {isSubmitting
                    ? editingItem ? "Updating..." : "Creating..."
                    : editingItem ? "Update Item" : "Create Item"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
                disabled={isSubmitting}
                className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              📦 Items Management
            </h1>
            <p className="text-gray-600">Manage your menu items and products</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => loadItems()}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleAddItem}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">{items.length}</p>
              <p className="text-sm text-blue-700">Total Items</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{categories.length}</p>
              <p className="text-sm text-green-700">Available Categories</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600">{filteredItems.length}</p>
              <p className="text-sm text-orange-700">Filtered Results</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Filter className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search items by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              multiple
              value={selectedCategories.map(String)}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                setSelectedCategories(values);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 min-w-48"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.isSubCategory ? "↳ " : ""}{category.categoryName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Loading Items</h3>
          <p className="text-gray-600">Please wait while we fetch your items...</p>
        </div>
      )}

      {/* Items Grid */}
      {!loading && items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="relative">
                <img
                  src={item.coverImageUrl}
                  alt={item.itemName}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_COVER_IMAGE;
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span className="bg-white bg-opacity-90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                    Item #{item.id}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-lg mb-2">{item.itemName}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.shortDescription}</p>
                
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {item.categoryIds.slice(0, 2).map((categoryId) => {
                      const category = categories.find(cat => cat.id === categoryId);
                      return category ? (
                        <span key={categoryId} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                          {category.categoryName}
                        </span>
                      ) : null;
                    })}
                    {item.categoryIds.length > 2 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{item.categoryIds.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEditItem(item)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button 
                    onClick={() => handleDeleteItem(item.id)}
                    className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && !error && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">No Items Found</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first menu item.
          </p>
          <button
            onClick={handleAddItem}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Item</span>
          </button>
        </div>
      )}

      {/* No Search Results */}
      {!loading && items.length > 0 && filteredItems.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-800 mb-2">No Items Match Your Search</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search terms or filters to find what you're looking for.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategories([]);
            }}
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}