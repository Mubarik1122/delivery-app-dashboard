import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  FolderOpen,
  Image as ImageIcon,
  Calendar,
  Tag,
  Store,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Category, Item, apiService } from "../services/api";

// Mock products data - replace with actual API call
const mockProducts = [
  {
    id: 1,
    name: "Italian Spicy Pizza",
    price: 45,
    image:
      "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300",
    rating: 4.5,
    inStock: true,
  },
  {
    id: 2,
    name: "Margherita Pizza",
    price: 35,
    image:
      "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300",
    rating: 4.2,
    inStock: true,
  },
  {
    id: 3,
    name: "Pepperoni Pizza",
    price: 40,
    image:
      "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300",
    rating: 4.7,
    inStock: false,
  },
];

interface CategoryDetailPageProps {
  onBack?: () => void;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: number) => void;
}
export default function CategoryDetailPage({
  onBack,
  onEdit,
  onDelete,
}: CategoryDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState(mockProducts);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [relatedItems, setRelatedItems] = useState<Item[]>([]);

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

  useEffect(() => {
    if (id) {
      fetchCategoryDetails(id);
    }
  }, [id]);

  const fetchCategoryDetails = async (categoryId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch category by ID
      const response = await apiService.getCategoryById(Number(categoryId));

      if (response.errorCode === 0 && response.data) {
        const cat: any = response.data;
        
        // Map the category data
        const mappedCategory: Category = {
          id: cat.id,
          categoryName: cat.category_name || cat.categoryName,
          shortDescription: cat.short_description || cat.shortDescription,
          longDescription: cat.long_description || cat.longDescription,
          isSubCategory: cat.is_sub_category || cat.isSubCategory,
          coverImage: getImageUrl(cat.cover_image || cat.coverImage),
          parentCategoryIds: (() => {
            if (Array.isArray(cat.parent_categories)) {
              return cat.parent_categories.map((p: any) =>
                typeof p === "object" ? p.id : p
              );
            } else if (Array.isArray(cat.parentCategoryIds)) {
              return cat.parentCategoryIds;
            } else if (
              cat.parent_category_ids &&
              Array.isArray(cat.parent_category_ids)
            ) {
              return cat.parent_category_ids;
            }
            return [];
          })(),
          createdAt: cat.creation_timestamp || cat.created_at || cat.createdAt,
          updatedAt: cat.updation_timestamp || cat.updated_at || cat.updatedAt,
        };

        setCategory(mappedCategory);

        // Fetch all categories to find parent and subcategories
        const allCategoriesResponse = await apiService.getAllCategories();
        if (allCategoriesResponse.errorCode === 0 && allCategoriesResponse.data) {
          const mapped = allCategoriesResponse.data.map((cat: any) => ({
            id: cat.id,
            categoryName: cat.category_name || cat.categoryName,
            shortDescription: cat.short_description || cat.shortDescription,
            longDescription: cat.long_description || cat.longDescription,
            isSubCategory: cat.is_sub_category || cat.isSubCategory,
            coverImage: getImageUrl(cat.cover_image || cat.coverImage),
            parentCategoryIds: (() => {
              if (Array.isArray(cat.parent_categories)) {
                return cat.parent_categories.map((p: any) =>
                  typeof p === "object" ? p.id : p
                );
              } else if (Array.isArray(cat.parentCategoryIds)) {
                return cat.parentCategoryIds;
              } else if (
                cat.parent_category_ids &&
                Array.isArray(cat.parent_category_ids)
              ) {
                return cat.parent_category_ids;
              }
              return [];
            })(),
            createdAt: cat.creation_timestamp || cat.created_at || cat.createdAt,
            updatedAt: cat.updation_timestamp || cat.updated_at || cat.updatedAt,
          }));

          setAllCategories(mapped);

          // Find parent categories by IDs
          if (
            mappedCategory.isSubCategory &&
            mappedCategory.parentCategoryIds?.length > 0
          ) {
            const parents = mapped.filter((cat) =>
              mappedCategory.parentCategoryIds?.includes(cat.id)
            );
            setParentCategories(parents);
          } else {
            setParentCategories([]);
          }

          // Find subcategories for this category
          const subCats = mapped.filter(
            (cat) =>
              cat.isSubCategory &&
              cat.parentCategoryIds?.includes(mappedCategory.id)
          );
          setSubCategories(subCats);
        }

        // Fetch related items
        fetchRelatedItems(mappedCategory.id);
      } else {
        setError(response.errorMessage || "Failed to load category");
      }
    } catch (err) {
      console.error("Error fetching category details:", err);
      setError("Failed to load category details");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/categories");
    }
    if (onBack) {
      onBack();
    } else {
      navigate("/categories");
    }
  };

  const handleEdit = (category: Category) => {
    if (onEdit) {
      onEdit(category);
    } else {
      // Navigate back to categories page with edit mode
      navigate("/categories/update", { state: { editCategory: category } });
    }
  };

  const handleDelete = async (categoryId: number) => {
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
      if (!category) {
        throw new Error("Category not found");
      }

      let deletePayload;

      if (category.isSubCategory && category.parentCategoryIds?.length > 0) {
        // For subcategories: use subcategoryId and parentCategoryId
        deletePayload = {
          subcategoryId: categoryId,
          parentCategoryId: category.parentCategoryIds[0],
        };
      } else {
        // For parent categories: use only categoryId
        deletePayload = {
          categoryId: categoryId,
        };
      }

      //console.log("Deleting category with payload:", deletePayload);

      const response = await apiService.deleteCategory(deletePayload);

      if (response.success) {
        if (onDelete) {
          onDelete(categoryId);
        } else {
          navigate("/categories");
        }
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
    } catch (err) {
      console.error("Error deleting category:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete category",
      });
    }
  };

  const handleViewSubCategory = (subCategory: Category) => {
    navigate(`/categories/${subCategory.id}`);
  };

  const handleViewParentCategory = (parentCategory: Category) => {
    navigate(`/categories/${parentCategory.id}`);
  };

  const fetchRelatedItems = async (categoryId: number) => {
    try {
      const response = await apiService.getAllItems();
      if (response.errorCode === 0 && response.data && response.data.items) {
        const DEFAULT_COVER_IMAGE =
          "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300";
        const DEFAULT_BACKGROUND_IMAGE =
          "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800";

        const mappedItems = response.data.items
          .map((item: any) => ({
            id: Number(item.id),
            itemName: item.item_name || item.itemName,
            shortDescription:
              item.short_description || item.shortDescription || "",
            longDescription:
              item.long_description || item.longDescription || "",
            coverImageUrl: getImageUrl(item.cover_image_url || item.coverImageUrl) || DEFAULT_COVER_IMAGE,
            backgroundImageUrl:
              item.background_image_url ||
              item.backgroundImageUrl ||
              DEFAULT_BACKGROUND_IMAGE,
            categoryIds: Array.isArray(item.categories)
              ? item.categories.map((cat: any) => cat.id)
              : [],
            createdAt: item.created_at || item.createdAt,
            updatedAt: item.updated_at || item.updatedAt,
            vendorId: item.vendor_id || item.vendorId,
          }))
          .filter((item: Item) => item.categoryIds.includes(categoryId));

        setRelatedItems(mappedItems);
      }
    } catch (err) {
      console.error("Error fetching related items:", err);
    }
  };

  const handleViewItem = (itemId: number) => {
    navigate(`/items/${itemId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading category details...</div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
        <div className="text-center">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <div className="text-red-600 text-xl font-semibold mb-2">Error</div>
          <div className="text-gray-600 mb-6">
            {error || "The requested category could not be found."}
          </div>
          <button
            onClick={handleBack}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

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
              onClick={handleBack}
              className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-opacity-30 transition-all flex items-center space-x-2 font-medium shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Categories</span>
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/categories/update", { state: { editCategory: category } })}
                className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition-all flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Edit className="w-5 h-5" />
                <span>Edit Category</span>
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-all flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete Category</span>
              </button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
            {/* Category Image */}
            <div className="relative group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-transparent opacity-30 rounded-full blur-xl"></div>
                <img
                  src={getImageUrl(category.coverImage)}
                  alt={category.categoryName}
                  className="relative w-48 h-48 rounded-full object-cover border-4 border-white shadow-2xl ring-4 ring-white ring-opacity-30 transform transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_IMAGE;
                  }}
                />
              </div>
              <div className="absolute inset-0 -z-10 bg-white opacity-20 rounded-full blur-2xl transform scale-110"></div>
            </div>

            {/* Category Info */}
            <div className="text-center md:text-left text-white flex-1">
              <h1 className="text-4xl font-extrabold mb-2 leading-tight">
                {category.categoryName}
              </h1>
              <p className="text-white text-opacity-90 text-lg mb-3">
                {category.shortDescription}
              </p>
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-3">
                <span className={`px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-2 backdrop-blur-sm ${
                  category.isSubCategory
                    ? "bg-orange-500 bg-opacity-70 text-white"
                    : "bg-blue-500 bg-opacity-70 text-white"
                }`}>
                  <Tag className="w-4 h-4" />
                  <span>{category.isSubCategory ? "Sub Category" : "Parent Category"}</span>
                </span>
                <span className="bg-white bg-opacity-30 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-2 backdrop-blur-sm">
                  <Package className="w-4 h-4" />
                  <span>{relatedItems.length} Items</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group relative bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6 text-blue-700" />
            </div>
          </div>
          <p className="text-sm font-semibold text-blue-700 mb-1">Created Date</p>
          <p className="text-sm font-medium text-blue-700">
            {formatDate(category.createdAt || "")}
          </p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>

        <div className="group relative bg-gradient-to-br from-green-50 via-green-50 to-green-100 rounded-xl border border-green-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <Tag className="w-6 h-6 text-green-700" />
            </div>
          </div>
          <p className="text-sm font-semibold text-green-700 mb-1">Category Type</p>
          <p className="text-sm font-medium text-green-700">
            {category.isSubCategory ? "Sub Category" : "Parent Category"}
          </p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>

        <div className="group relative bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6 text-purple-700" />
            </div>
          </div>
          <p className="text-sm font-semibold text-purple-700 mb-1">Related Items</p>
          <p className="text-2xl font-bold text-purple-700">
            {relatedItems.length}
          </p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>

        <div className="group relative bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 rounded-xl border border-orange-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-orange-200 p-3 rounded-xl group-hover:scale-110 transition-transform">
              <FolderOpen className="w-6 h-6 text-orange-700" />
            </div>
          </div>
          <p className="text-sm font-semibold text-orange-700 mb-1">Sub Categories</p>
          <p className="text-2xl font-bold text-orange-700">
            {subCategories.length}
          </p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {category.longDescription && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Info className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    Description
                  </h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {category.longDescription}
                </p>
              </div>
            </div>
          )}

          {/* Parent Categories (for sub-categories) */}
          {category.isSubCategory && parentCategories.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Parent Categories
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parentCategories.map((parent) => (
                    <div
                      key={parent.id}
                      onClick={() => handleViewParentCategory(parent)}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer bg-gray-50 hover:bg-blue-50"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={getImageUrl(parent.coverImage)}
                          alt={parent.categoryName}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_IMAGE;
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {parent.categoryName}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {parent.shortDescription}
                          </p>
                          <span className="inline-block mt-2 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-lg border border-blue-200">
                            Parent Category
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sub Categories Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  {category.isSubCategory ? "Related Sub Categories" : "Sub Categories"}
                </h3>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {subCategories.length} items
                </span>
              </div>
            </div>
            <div className="p-6">
              {subCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subCategories.map((subCategory) => (
                    <div
                      key={subCategory.id}
                      onClick={() => handleViewSubCategory(subCategory)}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-orange-300 transition-all cursor-pointer bg-gray-50 hover:bg-orange-50"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={getImageUrl(subCategory.coverImage)}
                          alt={subCategory.categoryName}
                          className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_IMAGE;
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {subCategory.categoryName}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {subCategory.shortDescription}
                          </p>
                          <span className="inline-block mt-2 px-2.5 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-lg border border-orange-200">
                            Sub Category
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    {category.isSubCategory
                      ? "No related sub-categories found"
                      : "No sub-categories found"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {category.isSubCategory
                      ? "Sub-categories with the same parent will appear here"
                      : "Sub-categories will appear here when created"}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Show related subcategories for subcategories */}
          {category.isSubCategory &&
            parentCategories.length > 0 &&
            (() => {
              // Get all subcategories that share the same parent(s) but exclude current category
              const relatedSubCategories = allCategories.filter(
                (cat) =>
                  cat.isSubCategory &&
                  cat.id !== category.id &&
                  cat.parentCategoryIds?.some((parentId) =>
                    category.parentCategoryIds?.includes(parentId)
                  )
              );

              return relatedSubCategories.length > 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Other Sub Categories in Same Parent
                      </h3>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        {relatedSubCategories.length} items
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {relatedSubCategories.map((relatedSubCategory) => (
                        <div
                          key={relatedSubCategory.id}
                          onClick={() => handleViewSubCategory(relatedSubCategory)}
                          className="border border-gray-200 rounded-xl p-4 hover:shadow-md hover:border-purple-300 transition-all cursor-pointer bg-gray-50 hover:bg-purple-50"
                        >
                          <div className="flex items-center space-x-3">
                            <img
                              src={getImageUrl(relatedSubCategory.coverImage)}
                              alt={relatedSubCategory.categoryName}
                              className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200"
                              onError={(e) => {
                                e.currentTarget.src = DEFAULT_IMAGE;
                              }}
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 mb-1">
                                {relatedSubCategory.categoryName}
                              </h4>
                              <p className="text-sm text-gray-600 line-clamp-2">
                                {relatedSubCategory.shortDescription}
                              </p>
                              <span className="inline-block mt-2 px-2.5 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-lg border border-purple-200">
                                Related Sub Category
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null;
            })()}

          {/* Related Items Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Related Items
                </h3>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {relatedItems.length} items
                </span>
              </div>
            </div>
            <div className="p-6">
              {relatedItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleViewItem(item.id)}
                      className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-red-300 transition-all cursor-pointer bg-white group"
                    >
                      <div className="relative">
                        <img
                          src={getImageUrl(item.coverImageUrl)}
                          alt={item.itemName}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_IMAGE;
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-lg">
                          <span className="text-xs font-semibold text-gray-700">View</span>
                        </div>
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                          {item.itemName}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                          {item.shortDescription}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>
                            {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString()
                              : ""}
                          </span>
                          <span className="text-blue-600 font-medium">
                            View Details →
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No items found in this category</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Items assigned to this category will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Category Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Category Information
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <p className="font-semibold text-gray-800">Category ID</p>
                </div>
                <p className="text-sm text-gray-700 font-mono">{category.id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <p className="font-semibold text-gray-800">Created Date</p>
                </div>
                <p className="text-sm text-gray-700">
                  {formatDate(category.createdAt || "")}
                </p>
              </div>
              {category.updatedAt && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center space-x-2 mb-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <p className="font-semibold text-gray-800">Last Updated</p>
                  </div>
                  <p className="text-sm text-gray-700">
                    {formatDate(category.updatedAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
