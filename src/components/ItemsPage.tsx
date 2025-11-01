import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Search,
  Plus,
  CreditCard as Edit,
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
  Star,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  apiService,
  Item,
  CreateUpdateItemRequest,
  UpdateItemRequest,
  Category,
} from "../services/api";

export default function ItemsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [imageUploadMethod, setImageUploadMethod] = useState<"url" | "upload">(
    "url"
  );
  const [backgroundImageMethod, setBackgroundImageMethod] = useState<
    "url" | "upload"
  >("url");
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [selectedBackgroundFile, setSelectedBackgroundFile] =
    useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>("");
  const [backgroundImagePreview, setBackgroundImagePreview] =
    useState<string>("");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "",
    shortDescription: "",
    longDescription: "",
    coverImageUrl: "",
    backgroundImageUrl: "",
    categoryIds: [] as number[],
    quantity: 0,
    price: 0,
  });

  // DataTable specific states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<
    "itemName" | "shortDescription" | "createdAt"
  >("itemName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Check if we're in add or edit mode based on URL
  const isAddMode = location.pathname === "/items/new";
  const isEditMode = location.pathname === "/items/update";

  useEffect(() => {
    // Handle edit mode from location state
    if (isEditMode && location.state?.editItem) {
      const item = location.state.editItem;
      setFormData({
        itemName: item.itemName,
        shortDescription: item.shortDescription,
        longDescription: item.longDescription,
        coverImageUrl: item.coverImageUrl,
        backgroundImageUrl: item.backgroundImageUrl,
        categoryIds: item.categoryIds,
        quantity: Number(item.quantity) || 0,
        price: parseFloat(String(item.price)) || 0,
      });
      setCoverImagePreview(item.coverImageUrl);
      setBackgroundImagePreview(item.backgroundImageUrl);
      setEditingItem(item);
      setShowAddForm(true);
    } else if (isAddMode) {
      resetForm();
      setShowAddForm(true);
    }
  }, [location, isAddMode, isEditMode]);

  // Default demo images
  const DEFAULT_COVER_IMAGE =
    "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300";
  const DEFAULT_BACKGROUND_IMAGE =
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800";

  useEffect(() => {
    loadItems();
    loadCategories();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getAllItems();

      // FIX: Use response.data.items
      if (
        response.errorCode === 0 &&
        response.data &&
        Array.isArray(response.data.items)
      ) {
        const mapped = response.data.items.map((item: any) => ({
          id: Number(item.id),
          itemName: item.item_name || item.itemName,
          shortDescription:
            item.short_description || item.shortDescription || "",
          longDescription: item.long_description || item.longDescription || "",
          coverImageUrl:
            item.cover_image_url || item.coverImageUrl || DEFAULT_COVER_IMAGE,
          backgroundImageUrl:
            item.background_image_url ||
            item.backgroundImageUrl ||
            DEFAULT_BACKGROUND_IMAGE,
          categoryIds: Array.isArray(item.categories)
            ? item.categories.map((cat: any) => cat.id)
            : [],
          quantity: Number(item.quantity) || 0,
          // <-- updated price mapping: prefer unit_price, then price
          price:
            item.unit_price !== undefined && item.unit_price !== null
              ? parseFloat(String(item.unit_price)) || 0
              : item.price !== undefined && item.price !== null
              ? parseFloat(String(item.price)) || 0
              : 0,
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
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Failed to load items",
      });
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
          createdAt: cat.created_at || cat.createdAt,
          updatedAt: cat.updated_at || cat.updatedAt,
        }));
        setCategories(mapped);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const categoryOptions = ["All", ...categories.map((cat) => cat.categoryName)];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.shortDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      item.categoryIds.some((catId) => {
        const category = categories.find((cat) => cat.id === catId);
        return category?.categoryName === selectedCategory;
      });
    return matchesSearch && matchesCategory;
  });

  // Sort filtered items
  const sortedItems = [...filteredItems].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    switch (sortBy) {
      case "itemName":
        aValue = a.itemName.toLowerCase();
        bValue = b.itemName.toLowerCase();
        break;
      case "shortDescription":
        aValue = a.shortDescription.toLowerCase();
        bValue = b.shortDescription.toLowerCase();
        break;
      case "createdAt":
        aValue = new Date(a.createdAt || 0).getTime();
        bValue = new Date(b.createdAt || 0).getTime();
        break;
      default:
        aValue = a.itemName.toLowerCase();
        bValue = b.itemName.toLowerCase();
    }

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = sortedItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSort = (
    column: "itemName" | "shortDescription" | "createdAt"
  ) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const resetForm = () => {
    setFormData({
      itemName: "",
      shortDescription: "",
      longDescription: "",
      coverImageUrl: "",
      backgroundImageUrl: "",
      categoryIds: [],
      quantity: 0,
      price: 0,
    });
    setEditingItem(null);
    setSelectedCoverFile(null);
    setSelectedBackgroundFile(null);
    setCoverImagePreview("");
    setBackgroundImagePreview("");
    setImageUploadMethod("url");
    setBackgroundImageMethod("url");
    setShowAddForm(false);
  };

  const handleFileSelect = (
    type: "cover" | "background",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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

      if (type === "cover") {
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
    navigate("/items/new");
  };

  const handleEditItem = (item: Item) => {
    navigate("/items/update", { state: { editItem: item } });
  };

  const handleViewItem = (item: Item) => {
    navigate(`/items/${item.id}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (formData.categoryIds.length === 0) {
        setError("Please select at least one category");
        setIsSubmitting(false);
        return;
      }

      const finalCoverImage =
        formData.coverImageUrl.trim() || DEFAULT_COVER_IMAGE;
      const finalBackgroundImage =
        formData.backgroundImageUrl.trim() || DEFAULT_BACKGROUND_IMAGE;

      const itemData = {
        ...(editingItem && { id: editingItem.id }),
        itemName: formData.itemName.trim(),
        shortDescription: formData.shortDescription.trim(),
        longDescription: formData.longDescription.trim(),
        coverImageUrl: finalCoverImage,
        backgroundImageUrl: finalBackgroundImage,
        categoryIds: formData.categoryIds,
        quantity: Number(formData.quantity),
        price: parseFloat(String(formData.price)),
      };

      let response;
      if (editingItem) {
        response = await apiService.updateItem(itemData as UpdateItemRequest);
      } else {
        response = await apiService.createUpdateItem(itemData);
      }

      if (response && response.errorCode === 0) {
        await loadItems();
        navigate("/items");
        resetForm();
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Item ${editingItem ? "updated" : "created"} successfully`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            response?.errorMessage ||
            `Failed to ${editingItem ? "update" : "create"} item`,
        });
      }
    } catch (error) {
      console.error(
        `Error ${editingItem ? "updating" : "creating"} item:`,
        error
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error instanceof Error
            ? error.message
            : `Failed to ${editingItem ? "update" : "create"} item`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | number[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteItem = async (itemId: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await apiService.deleteItem(itemId);
      await loadItems();
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Item has been deleted.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Failed to delete item",
      });
    }
  };

  const handleCategoryToggle = (categoryId: number) => {
    const newCategoryIds = formData.categoryIds.includes(categoryId)
      ? formData.categoryIds.filter((id) => id !== categoryId)
      : [...formData.categoryIds, categoryId];
    handleInputChange("categoryIds", newCategoryIds);
  };

  const getCategoryNames = (categoryIds: number[]) => {
    return categories
      .filter((cat) => categoryIds.includes(cat.id))
      .map((cat) => cat.categoryName)
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
                  navigate("/items");
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
              {editingItem
                ? "Update item information"
                : "Create a new item for your menu"}
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Item Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) =>
                      handleInputChange("itemName", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleInputChange("shortDescription", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter short description"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Long Description
                  </label>
                  <textarea
                    value={formData.longDescription}
                    onChange={(e) =>
                      handleInputChange("longDescription", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter detailed description of the item"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      handleInputChange(
                        "price",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter item price"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity in Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.quantity}
                    onChange={(e) =>
                      handleInputChange(
                        "quantity",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter quantity in stock"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Categories
              </h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Categories *
              </label>
              <div className="relative">
                {/* Multi-select dropdown trigger */}
                <div
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer bg-white min-h-[48px] flex items-center justify-between"
                >
                  <div className="flex-1">
                    {formData.categoryIds.length === 0 ? (
                      <span className="text-gray-500">
                        Select categories...
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {formData.categoryIds.slice(0, 3).map((categoryId) => {
                          const category = categories.find(
                            (cat) => cat.id === categoryId
                          );
                          return category ? (
                            <span
                              key={categoryId}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                            >
                              <img
                                src={category.coverImage}
                                alt={category.categoryName}
                                className="w-4 h-4 rounded-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = DEFAULT_COVER_IMAGE;
                                }}
                              />
                              {category.categoryName}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCategoryToggle(categoryId);
                                }}
                                className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ) : null;
                        })}
                        {formData.categoryIds.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{formData.categoryIds.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {formData.categoryIds.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInputChange("categoryIds", []);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Clear all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div
                      className={`transform transition-transform ${
                        showCategoryDropdown ? "rotate-180" : ""
                      }`}
                    >
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Dropdown menu */}
                {showCategoryDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {categories.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No categories available
                      </div>
                    ) : (
                      <div className="p-2">
                        {/* Select All / Deselect All */}
                        <div className="flex items-center justify-between p-2 border-b border-gray-100 mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {formData.categoryIds.length} of {categories.length}{" "}
                            selected
                          </span>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleInputChange(
                                  "categoryIds",
                                  categories.map((cat) => cat.id)
                                )
                              }
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleInputChange("categoryIds", [])
                              }
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>

                        {/* Category options */}
                        <div className="space-y-1">
                          {categories.map((category) => (
                            <label
                              key={category.id}
                              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={formData.categoryIds.includes(
                                  category.id
                                )}
                                onChange={() =>
                                  handleCategoryToggle(category.id)
                                }
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                disabled={isSubmitting}
                              />
                              <img
                                src={category.coverImage}
                                alt={category.categoryName}
                                className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                                onError={(e) => {
                                  e.currentTarget.src = DEFAULT_COVER_IMAGE;
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-800 truncate">
                                    {category.isSubCategory ? "" : ""}
                                    {category.categoryName}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 text-xs rounded-full flex-shrink-0 ${
                                      category.isSubCategory
                                        ? "bg-orange-100 text-orange-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {category.isSubCategory ? "Sub" : "Parent"}
                                  </span>
                                </div>
                                {category.shortDescription && (
                                  <p className="text-xs text-gray-500 truncate mt-0.5">
                                    {category.shortDescription}
                                  </p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Click outside to close dropdown */}
                {showCategoryDropdown && (
                  <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowCategoryDropdown(false)}
                  />
                )}
              </div>
              {formData.categoryIds.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  Please select at least one category
                </p>
              )}
            </div>

            {/* Cover Image Upload */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Cover Image
              </h3>

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
                      {selectedCoverFile
                        ? selectedCoverFile.name
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect("cover", e)}
                      className="hidden"
                      id="cover-image-upload"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("cover-image-upload")?.click()
                      }
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
                    src={
                      coverImagePreview ||
                      formData.coverImageUrl ||
                      DEFAULT_COVER_IMAGE
                    }
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
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Background Image
              </h3>

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
                      {selectedBackgroundFile
                        ? selectedBackgroundFile.name
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect("background", e)}
                      className="hidden"
                      id="background-image-upload"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document
                          .getElementById("background-image-upload")
                          ?.click()
                      }
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
                    src={
                      backgroundImagePreview ||
                      formData.backgroundImageUrl ||
                      DEFAULT_BACKGROUND_IMAGE
                    }
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
                    ? editingItem
                      ? "Updating..."
                      : "Creating..."
                    : editingItem
                    ? "Update Item"
                    : "Create Item"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate("/items");
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
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                🍽️ Items Management
              </h1>
              <p className="text-gray-600">
                Manage your menu items and products
              </p>
            </div>
            <button
              onClick={handleAddItem}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Item</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">
                  {items.length}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Filtered Results
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredItems.length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Filter className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          {/* <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Current Page
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentPage} / {totalPages || 1}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Items per Page
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {itemsPerPage}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <Package className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div> */}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
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

            {/* Category Filter Dropdown */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Items per page selector */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Loader className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Loading Items
            </h3>
            <p className="text-gray-600">
              Please wait while we fetch your items...
            </p>
          </div>
        )}

        {/* DataTable */}
        {!loading && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("itemName")}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>Item Name</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("shortDescription")}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>Description</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("createdAt")}
                        className="flex items-center space-x-1 hover:text-gray-700 transition-colors"
                      >
                        <span>Created</span>
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img
                          src={item.coverImageUrl}
                          alt={item.itemName}
                          className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_COVER_IMAGE;
                          }}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {item.itemName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.shortDescription}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {item.shortDescription || "No description"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">
                          ${(item.price || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (item.quantity || 0) > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.quantity || 0}{" "}
                          {(item.quantity || 0) === 1 ? "unit" : "units"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {item.categoryIds.slice(0, 2).map((categoryId) => {
                            const category = categories.find(
                              (cat) => cat.id === categoryId
                            );
                            return category ? (
                              <span
                                key={categoryId}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {category.categoryName}
                              </span>
                            ) : null;
                          })}
                          {item.categoryIds.length > 2 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              +{item.categoryIds.length - 2}
                            </span>
                          )}
                          {item.categoryIds.length === 0 && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                              No categories
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleViewItem(item)}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-2 hover:bg-blue-50 rounded-lg"
                            title="View Item"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-green-600 hover:text-green-800 transition-colors p-2 hover:bg-green-50 rounded-lg"
                            title="Edit Item"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-800 transition-colors p-2 hover:bg-red-50 rounded-lg"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{" "}
                      <span className="font-medium">{startIndex + 1}</span> to{" "}
                      <span className="font-medium">
                        {Math.min(
                          startIndex + itemsPerPage,
                          sortedItems.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium">{sortedItems.length}</span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>

                      {/* Page numbers */}
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else {
                            if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? "z-10 bg-red-50 border-red-500 text-red-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && items.length === 0 && !error && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              No Items Found
            </h3>
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
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              No Items Match Your Search
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find what you're
              looking for.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </>
  );
}
