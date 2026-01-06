import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Search,
  Plus,
  CreditCard as Edit,
  Trash2,
  Eye,
  FolderOpen,
  Folder,
  Save,
  ArrowLeft,
  Loader,
  ChevronDown,
  ChevronRight,
  X,
  Filter,
  RefreshCw,
  Image as ImageIcon,
  Package,
  Grid2x2 as Grid,
  List,
  Upload,
  Link,
} from "lucide-react";
import {
  apiService,
  Category,
  CreateUpdateCategoryRequest,
  UpdateCategoryRequest,
} from "../services/api";

export default function CategoriesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );
  const [filterType, setFilterType] = useState<"all" | "parent" | "sub">("all");
  const [imageUploadMethod, setImageUploadMethod] = useState<"url" | "upload">(
    "url"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    categoryName: "",
    shortDescription: "",
    longDescription: "",
    parentCategoryIds: [] as number[],
    isSubCategory: false,
    coverImage: "",
  });
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const handleParentCategoryToggle = (categoryId: number) => {
    const newIds = formData.parentCategoryIds.includes(categoryId)
      ? formData.parentCategoryIds.filter((id) => id !== categoryId)
      : [...formData.parentCategoryIds, categoryId];
    handleInputChange("parentCategoryIds", newIds);
  };

  // Check if we're in add or edit mode based on URL
  const isAddMode = location.pathname === "/categories/new";
  const isEditMode = location.pathname === "/categories/update";

  useEffect(() => {
    // Handle edit mode from location state
    if (isEditMode && location.state?.editCategory) {
      const category = location.state.editCategory;
      setFormData({
        categoryName: category.categoryName,
        shortDescription: category.shortDescription,
        longDescription: category.longDescription,
        parentCategoryIds: category.parentCategoryIds || [],
        isSubCategory: category.isSubCategory,
        coverImage: category.coverImage,
      });
      setImagePreview(category.coverImage);
      setEditingCategory(category);
      setShowAddForm(true);
    } else if (isAddMode) {
      resetForm();
      setShowAddForm(true);
    }
  }, [location, isAddMode, isEditMode]);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Default demo image
  const DEFAULT_IMAGE =
    "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300";

  // Image base URL from environment variable (only for images, not for API calls)
  const IMAGE_BASE_URL = ((import.meta.env.VITE_IMAGE_BASE_URL as string) || "https://groceryapp-production-d3fc.up.railway.app").trim().replace(/\/+$/, "");

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string | undefined | null): string => {
    if (!imagePath) return DEFAULT_IMAGE;
    
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

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getAllCategories();

      // console.log("Categories API Response:", response);

      if (response.errorCode === 0 && response.data) {
        // Map snake_case to camelCase and ensure parentCategoryIds is always an array
        const mapped = response.data.map((cat: any) => ({
          id: cat.id,
          categoryName: cat.category_name,
          shortDescription: cat.short_description,
          longDescription: cat.long_description,
          isSubCategory: cat.is_sub_category,
          coverImage: getImageUrl(cat.cover_image),
          parentCategoryIds: Array.isArray(cat.parent_categories)
            ? cat.parent_categories.map((p: any) => p.id)
            : [],
          createdAt: cat.created_at || cat.createdAt,
          updatedAt: cat.updated_at || cat.updatedAt,
        }));
        setCategories(mapped);
      } else {
        setError(response.errorMessage || "Failed to load categories");
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error instanceof Error ? error.message : "Failed to load categories",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get all parent categories (non-subcategories)
  const parentCategories = categories.filter((cat) => !cat.isSubCategory);

  // Get subcategories for a specific parent
  const getSubCategories = (parentId: number) => {
    return categories.filter(
      (cat) => cat.isSubCategory && cat.parentCategoryIds?.includes(parentId)
    );
  };

  // Build category tree structure
  const buildCategoryTree = (categories: Category[]): Category[] => {
    const categoryMap = new Map<number, Category & { children: Category[] }>();
    const rootCategories: (Category & { children: Category[] })[] = [];

    // Initialize all categories with children array
    categories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    // Build the tree structure
    categories.forEach((cat) => {
      const categoryWithChildren = categoryMap.get(cat.id)!;

      if (!cat.isSubCategory || !cat.parentCategoryIds?.length) {
        // Root category
        rootCategories.push(categoryWithChildren);
      } else {
        // Sub-category - add to all its parents
        cat.parentCategoryIds.forEach((parentId) => {
          const parent = categoryMap.get(parentId);
          if (parent) {
            parent.children.push(categoryWithChildren);
          }
        });
      }
    });

    return rootCategories;
  };

  // Recursive function to check if category or its children match search
  const categoryMatchesSearch = (
    category: Category,
    searchTerm: string
  ): boolean => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    const matchesName = category.categoryName
      ?.toLowerCase()
      .includes(searchLower);
    const matchesShort = category.shortDescription
      ?.toLowerCase()
      .includes(searchLower);
    const matchesLong = category.longDescription
      ?.toLowerCase()
      .includes(searchLower);

    return matchesName || matchesShort || matchesLong;
  };

  // Recursive function to filter category tree
  const filterCategoryTree = (
    categories: (Category & { children: Category[] })[],
    searchTerm: string,
    filterType: string
  ): (Category & { children: Category[] })[] => {
    return categories.reduce((filtered, category) => {
      const matchesSearch = categoryMatchesSearch(category, searchTerm);
      const matchesFilter =
        filterType === "all" ||
        (filterType === "parent" && !category.isSubCategory) ||
        (filterType === "sub" && category.isSubCategory);

      // Recursively filter children
      const filteredChildren = filterCategoryTree(
        category.children,
        searchTerm,
        filterType
      );

      // Include category if it matches or has matching children
      const shouldInclude =
        (matchesSearch && matchesFilter) || filteredChildren.length > 0;

      if (shouldInclude) {
        filtered.push({
          ...category,
          children: filteredChildren,
        });
      }

      return filtered;
    }, [] as (Category & { children: Category[] })[]);
  };

  // Get category tree and apply filters
  const categoryTree = buildCategoryTree(categories);
  const filteredCategoryTree = filterCategoryTree(
    categoryTree,
    searchTerm,
    filterType
  );

  // Count categories recursively
  const countCategoriesInTree = (
    tree: (Category & { children: Category[] })[]
  ): number => {
    return tree.reduce((count, category) => {
      return count + 1 + countCategoriesInTree(category.children);
    }, 0);
  };

  const filteredCount = countCategoriesInTree(filteredCategoryTree);

  // Recursive component to render category tree
  const CategoryTreeItem = ({
    category,
    level = 0,
  }: {
    category: Category & { children: Category[] };
    level?: number;
  }) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasChildren = category.children.length > 0;
    const indentClass = level > 0 ? `ml-${Math.min(level * 4, 16)}` : "";
    const borderColor =
      level === 0
        ? "border-blue-300"
        : level === 1
        ? "border-orange-300"
        : "border-purple-300";

    return (
      <div key={category.id}>
        {/* Category Row */}
        <div
          className={`hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-200 group ${
            level > 0 ? "bg-gray-50" : ""
          }`}
        >
          <div
            className={`grid grid-cols-12 gap-4 px-6 py-4 items-center ${
              level > 0 ? `border-l-4 ${borderColor} ${indentClass}` : ""
            }`}
          >
            <div className="col-span-1">
              {hasChildren && (
                <button
                  onClick={() => toggleCategoryExpansion(category.id)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>

            <div className="col-span-4">
              <div className="flex items-center space-x-3">
                <div
                  className={`${
                    level > 0 ? "w-10 h-10" : "w-12 h-12"
                  } rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-50 flex items-center justify-center group-hover:border-red-300 transition-all shadow-sm group-hover:shadow-md`}
                >
                  <img
                    src={getImageUrl(category.coverImage)}
                    alt={category.categoryName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling?.classList.remove(
                        "hidden"
                      );
                    }}
                  />
                  <ImageIcon className="w-4 h-4 text-gray-400 hidden" />
                </div>
                <div>
                  <h4
                    className={`font-semibold text-gray-800 group-hover:text-red-600 transition-colors ${
                      level > 0 ? "text-sm" : "text-base"
                    }`}
                  >
                    {"".repeat(level)}
                    {category.categoryName}
                  </h4>
                  {hasChildren && (
                    <span className="text-xs text-gray-500 font-medium">
                      {category.children.length} sub-categories
                    </span>
                  )}
                  {level > 0 && (
                    <span className="text-xs text-gray-400">
                      Level {level + 1}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="col-span-3">
              <p
                className={`text-gray-600 line-clamp-2 ${
                  level > 0 ? "text-xs" : "text-sm"
                }`}
              >
                {category.shortDescription}
              </p>
            </div>

            <div className="col-span-2">
              <span
                className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                  !category.isSubCategory
                    ? "bg-blue-50 text-blue-800 border-blue-200"
                    : level === 0
                    ? "bg-orange-50 text-orange-800 border-orange-200"
                    : "bg-purple-50 text-purple-800 border-purple-200"
                }`}
              >
                {!category.isSubCategory ? "Parent" : `Sub-Level ${level + 1}`}
              </span>
            </div>

            <div className="col-span-2">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleViewCategory(category)}
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-200"
                  title="View Details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleEditCategory(category)}
                  className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all border border-transparent hover:border-green-200"
                  title="Edit Category"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-200"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Render Children */}
        {isExpanded && hasChildren && (
          <div
            className={
              level === 0
                ? "bg-gray-50"
                : level === 1
                ? "bg-gray-100"
                : "bg-gray-150"
            }
          >
            {category.children.map((child) => (
              <CategoryTreeItem
                key={child.id}
                category={child}
                level={level + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const totalCategories = categories.length;
  const parentCategoriesCount = parentCategories.length;
  const subCategoriesCount = categories.filter(
    (cat) => cat.isSubCategory
  ).length;

  const resetForm = () => {
    setFormData({
      categoryName: "",
      shortDescription: "",
      longDescription: "",
      parentCategoryIds: [],
      isSubCategory: false,
      coverImage: "",
    });
    setEditingCategory(null);
    setSelectedFile(null);
    setImagePreview("");
    setImageUploadMethod("url");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        handleInputChange("coverImage", result);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleAddCategory = () => {
    resetForm();
    setShowAddForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setFormData({
      categoryName: category.categoryName,
      shortDescription: category.shortDescription,
      longDescription: category.longDescription,
      parentCategoryIds: category.parentCategoryIds || [],
      isSubCategory: category.isSubCategory,
      coverImage: category.coverImage,
    });
    setImagePreview(category.coverImage);
    setEditingCategory(category);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      if (formData.isSubCategory && formData.parentCategoryIds.length === 0) {
        setError("Please select at least one parent category for sub-category");
        setIsSubmitting(false);
        return;
      }

      // Use default image if no image is provided
      const finalCoverImage = formData.coverImage.trim() || DEFAULT_IMAGE;
      const categoryData = {
        ...(editingCategory && { id: editingCategory.id }),
        categoryName: formData.categoryName.trim(),
        shortDescription: formData.shortDescription.trim(),
        longDescription: formData.longDescription.trim(),
        isSubCategory: formData.isSubCategory,
        coverImage: finalCoverImage,
        parentCategoryIds: formData.isSubCategory
          ? formData.parentCategoryIds
          : [],
      };

      let response;
      if (editingCategory) {
        response = await apiService.updateCategory(
          categoryData as UpdateCategoryRequest
        );
      } else {
        response = await apiService.createUpdateCategory(categoryData);
      }

      if (response && response.errorCode === 0) {
        await loadCategories();
        navigate("/categories");
        resetForm();
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: `Category ${
            editingCategory ? "updated" : "created"
          } successfully`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            response?.errorMessage ||
            `Failed to ${editingCategory ? "update" : "create"} category`,
        });
      }
    } catch (error) {
      console.error(
        `Error ${editingCategory ? "updating" : "creating"} category:`,
        error
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error instanceof Error
            ? error.message
            : `Failed to ${editingCategory ? "update" : "create"} category`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | boolean | number[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleViewCategory = (category: Category) => {
    navigate(`/categories/${category.id}`);
  };

  const handleDeleteCategory = async (categoryId: number) => {
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
      const categoryToDelete = categories.find((cat) => cat.id === categoryId);

      if (!categoryToDelete) {
        throw new Error("Category not found");
      }

      let deletePayload;

      if (
        categoryToDelete.isSubCategory &&
        categoryToDelete.parentCategoryIds?.length > 0
      ) {
        // For subcategories with parent: detach from parent using categoryId and parentCategoryId
        deletePayload = {
          categoryId: categoryId,
          parentCategoryId: categoryToDelete.parentCategoryIds[0],
        };
      } else {
        // For parent categories or orphan categories: soft delete using only categoryId
        deletePayload = {
          categoryId: categoryId,
        };
      }

      // console.log("Deleting category with payload:", deletePayload);

      const response = await apiService.deleteCategory(deletePayload);

      if (response.success) {
        await loadCategories();
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Category has been deleted.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(response.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error instanceof Error ? error.message : "Failed to delete category",
      });
    }
  };

  const toggleCategoryExpansion = (categoryId: number) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleRefresh = () => {
    loadCategories();
  };

  if (showAddForm) {
    return (
      <div className="space-y-6 pb-6">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-5"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-48 -mt-48"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -ml-32 -mb-32"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                  navigate("/categories", { replace: true });
                }}
                className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-opacity-30 transition-all flex items-center space-x-2 font-medium shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Categories</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-xl">
                <FolderOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h1>
                <p className="text-white text-opacity-90 text-lg">
                  {editingCategory
                    ? "Update category information and details"
                    : "Create a new category for your products"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-300 text-red-800 px-6 py-4 rounded-xl text-sm mb-6 flex items-center space-x-2">
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Type Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Category Type
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    handleInputChange("isSubCategory", false);
                    handleInputChange("parentCategoryIds", []);
                  }}
                  className={`p-6 rounded-lg border transition-all ${
                    !formData.isSubCategory
                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
                      : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                  disabled={isSubmitting}
                >
                  <Folder className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold text-base">Parent Category</div>
                  <div className="text-sm text-gray-600">Main category</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("isSubCategory", true)}
                  className={`p-6 rounded-lg border transition-all ${
                    formData.isSubCategory
                      ? "border-orange-500 bg-orange-50 text-orange-700 shadow-md"
                      : "border-gray-300 bg-white text-gray-700 hover:border-orange-400 hover:bg-orange-50"
                  }`}
                  disabled={isSubmitting}
                >
                  <FolderOpen className="w-8 h-8 mx-auto mb-2" />
                  <div className="font-semibold text-base">Sub Category</div>
                  <div className="text-sm text-gray-600">Under parent</div>
                </button>
              </div>
            </div>

            {/* Category Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Category Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.categoryName}
                    onChange={(e) =>
                      handleInputChange("categoryName", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
                    placeholder="Enter category name"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      handleInputChange("shortDescription", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
                    placeholder="Enter short description (max 100 characters)"
                    maxLength={100}
                    required
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white resize-none"
                    placeholder="Enter detailed description of the category"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Parent Category Selection for Sub Categories */}
                {formData.isSubCategory && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Parent Categories <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {/* Trigger */}
                      <div
                        onClick={() =>
                          setShowCategoryDropdown(!showCategoryDropdown)
                        }
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 cursor-pointer bg-white min-h-[42px] flex items-center justify-between hover:border-gray-400 transition-all"
                      >
                        <div className="flex-1">
                          {formData.parentCategoryIds.length === 0 ? (
                            <span className="text-gray-500">
                              Select parent categories...
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {formData.parentCategoryIds
                                .slice(0, 3)
                                .map((id) => {
                                  const category = categories.find(
                                    (cat) => cat.id === id
                                  );
                                  return category ? (
                                    <span
                                      key={id}
                                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                    >
                                      <img
                                        src={getImageUrl(category.coverImage)}
                                        alt={category.categoryName}
                                        className="w-4 h-4 rounded-full object-cover"
                                      />
                                      {category.categoryName}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleInputChange(
                                            "parentCategoryIds",
                                            formData.parentCategoryIds.filter(
                                              (cid) => cid !== id
                                            )
                                          );
                                        }}
                                        className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ) : null;
                                })}
                              {formData.parentCategoryIds.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                                  +{formData.parentCategoryIds.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dropdown menu */}
                      {showCategoryDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                          <div className="p-2 space-y-1">
                            {categories
                              .filter((cat) => !cat.isSubCategory) // only parent categories
                              .map((category) => (
                                <label
                                  key={category.id}
                                  className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.parentCategoryIds.includes(
                                      category.id
                                    )}
                                    onChange={() =>
                                      handleParentCategoryToggle(category.id)
                                    }
                                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                  />
                                  <img
                                    src={getImageUrl(category.coverImage)}
                                    alt={category.categoryName}
                                    className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                                  />
                                  <span className="text-sm font-medium text-gray-800">
                                    {category.categoryName}
                                  </span>
                                </label>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {formData.parentCategoryIds.length === 0 && (
                      <p className="text-sm text-red-500 mt-1">
                        Please select at least one parent category
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Cover Image
                </h3>
              </div>

              {/* Image Upload Method Selection */}
              <div className="mb-4">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setImageUploadMethod("url");
                      setSelectedFile(null);
                      setImagePreview("");
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                      imageUploadMethod === "url"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50"
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
                      handleInputChange("coverImage", "");
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                      imageUploadMethod === "upload"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:bg-green-50"
                    }`}
                    disabled={isSubmitting}
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                  </button>
                </div>
              </div>
              {/* Image URL Input */}
              {imageUploadMethod === "url" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.coverImage}
                    onChange={(e) => {
                      handleInputChange("coverImage", e.target.value);
                      setImagePreview(e.target.value);
                    }}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white"
                    placeholder="https://example.com/image.jpg"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* File Upload Input */}
              {imageUploadMethod === "upload" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-all bg-gray-50">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-700 mb-1">
                      {selectedFile
                        ? selectedFile.name
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      PNG, JPG, GIF up to 5MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="image-upload"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("image-upload")?.click()
                      }
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all text-sm font-medium flex items-center space-x-2 mx-auto"
                      disabled={isSubmitting}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>Choose File</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {(imagePreview || formData.coverImage) && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview
                  </label>
                  <img
                    src={getImageUrl(imagePreview || formData.coverImage)}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_IMAGE;
                    }}
                  />
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                  navigate("/categories", { replace: true });
                }}
                className="bg-white text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-all font-medium border border-gray-300 hover:border-gray-400"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-red-500 text-white px-6 py-2.5 rounded-lg hover:bg-red-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>
                      {editingCategory ? "Update Category" : "Create Category"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Header */}
      <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -ml-32 -mb-32"></div>
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl">
                  <FolderOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">
                    Categories Management
                  </h1>
                  <p className="text-white text-opacity-90 text-lg">
                    Organize your products with categories and subcategories
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-opacity-30 transition-all flex items-center space-x-2 font-medium shadow-lg"
              >
                <RefreshCw
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleAddCategory}
                className="bg-white text-red-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Add Category</span>
              </button>
            </div>
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
        <div className="group relative bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-blue-700 mb-1">
                {totalCategories}
              </p>
              <p className="text-sm font-medium text-blue-600">Total Categories</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <FolderOpen className="w-6 h-6 text-blue-700" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>

        <div className="group relative bg-gradient-to-br from-green-50 via-green-50 to-green-100 rounded-xl border border-green-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-green-700 mb-1">
                {parentCategoriesCount}
              </p>
              <p className="text-sm font-medium text-green-600">Parent Categories</p>
            </div>
            <div className="bg-green-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <Folder className="w-6 h-6 text-green-700" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>

        <div className="group relative bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 rounded-xl border border-orange-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-orange-700 mb-1">
                {subCategoriesCount}
              </p>
              <p className="text-sm font-medium text-orange-600">Sub Categories</p>
            </div>
            <div className="bg-orange-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <FolderOpen className="w-6 h-6 text-orange-700" />
            </div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as "all" | "parent" | "sub")
              }
              className="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
            >
              <option value="all">All Categories</option>
              <option value="parent">Parent Only</option>
              <option value="sub">Sub Categories Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Loading Categories
          </h3>
          <p className="text-gray-600">
            Please wait while we fetch your categories...
          </p>
        </div>
      )}

      {/* Categories Table Accordion */}
      {!loading && categories.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Categories
              </h3>
              <p className="text-sm text-gray-600 font-medium">
                Showing {filteredCount} of {categories.length} categories
              </p>
            </div>
          </div>

          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
              <div className="col-span-1"></div>
              <div className="col-span-4">Category Name</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Actions</div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {/* Render category tree */}
            {filteredCategoryTree.map((category) => (
              <CategoryTreeItem
                key={category.id}
                category={category}
                level={0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && categories.length === 0 && !error && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Categories Found
          </h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first category to organize your
            products.
          </p>
          <button
            onClick={handleAddCategory}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg hover:from-red-600 hover:to-red-700 transition-all flex items-center space-x-2 mx-auto shadow-md hover:shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Category</span>
          </button>
        </div>
      )}

      {/* No Search Results */}
      {!loading &&
        categories.length > 0 &&
        filteredCategoryTree.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Categories Match Your Search
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find what you're
              looking for.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterType("all");
              }}
              className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Clear Search
            </button>
          </div>
        )}
    </div>
  );
}
