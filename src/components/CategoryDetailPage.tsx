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
} from "lucide-react";
import { Category, apiService } from "../services/api";

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

  // Default demo image
  const DEFAULT_IMAGE =
    "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300";

  useEffect(() => {
    if (id) {
      fetchCategoryDetails(id);
    }
  }, [id]);

  const fetchCategoryDetails = async (categoryId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching category details for ID:", categoryId);

      const response = await apiService.getAllCategories();
      console.log("API Response:", response);

      if (response.errorCode === 0 && response.data) {
        // Map snake_case to camelCase and ensure parentCategoryIds is always an array
        const mapped = response.data.map((cat: any) => ({
          id: cat.id,
          categoryName: cat.category_name || cat.categoryName,
          shortDescription: cat.short_description || cat.shortDescription,
          longDescription: cat.long_description || cat.longDescription,
          isSubCategory: cat.is_sub_category || cat.isSubCategory,
          coverImage: cat.cover_image || cat.coverImage || DEFAULT_IMAGE,
          parentCategoryIds: (() => {
            // Handle different possible structures for parent categories
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
          createdAt: cat.created_at || cat.createdAt,
          updatedAt: cat.updated_at || cat.updatedAt,
        }));

        console.log("Mapped categories:", mapped);
        setAllCategories(mapped);

        // Find the current category
        const foundCategory = mapped.find(
          (cat) => cat.id.toString() === categoryId
        );

        console.log("Found category:", foundCategory);

        if (foundCategory) {
          setCategory(foundCategory);

          // Find parent categories by IDs
          if (
            foundCategory.isSubCategory &&
            foundCategory.parentCategoryIds?.length > 0
          ) {
            console.log(
              "Finding parents for IDs:",
              foundCategory.parentCategoryIds
            );
            const parents = mapped.filter((cat) =>
              foundCategory.parentCategoryIds?.includes(cat.id)
            );
            console.log("Found parents:", parents);
            setParentCategories(parents);
          } else {
            setParentCategories([]);
          }

          // Find subcategories for this category
          const subCats = mapped.filter(
            (cat) =>
              cat.isSubCategory &&
              cat.parentCategoryIds?.includes(foundCategory.id)
          );
          console.log("Found subcategories:", subCats);
          setSubCategories(subCats);

          // Set mock products
          setProducts(mockProducts);
        } else {
          setError("Category not found");
        }
      } else {
        setError(response.errorMessage || "Failed to load categories");
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

      console.log("Deleting category with payload:", deletePayload);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <span className="text-gray-600">Loading category details...</span>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Category Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          {error || "The requested category could not be found."}
        </p>
        <button
          onClick={handleBack}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Back to Categories
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-64 bg-gradient-to-r from-gray-100 to-gray-200">
          <img
            src={category.coverImage}
            alt={category.categoryName}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-20 hidden flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-white opacity-50" />
          </div>

          {/* Back Button */}
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg p-2 transition-all duration-200 flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
            <span className="text-gray-700 font-medium">Back</span>
          </button>

          {/* Category Badge */}
          <div className="absolute top-4 right-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                category.isSubCategory
                  ? "bg-orange-100 text-orange-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {category.isSubCategory ? "Sub Category" : "Parent Category"}
            </span>
          </div>
        </div>

        {/* Category Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {category.categoryName}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {category.shortDescription}
              </p>
              {category.longDescription && (
                <p className="text-gray-700 leading-relaxed">
                  {category.longDescription}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 ml-6">
              <button
                onClick={() => {
                  console.log("Edit button clicked for category:", category);
                  navigate("/categories/update", {
                    state: { editCategory: category },
                  });
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => {
                  console.log("Delete button clicked for category:", category);
                  handleDelete(category.id);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Category Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Created Date</span>
              </div>
              <span className="text-gray-600">
                {category.createdAt
                  ? new Date(category.createdAt).toLocaleDateString()
                  : "N/A"}
              </span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Tag className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Category Type</span>
              </div>
              <span className="text-gray-600">
                {category.isSubCategory ? "Sub Category" : "Parent Category"}
              </span>
            </div>

            {/* <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Package className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Products</span>
              </div>
              <span className="text-gray-600">{products.length} items</span>
            </div> */}
          </div>

          {/* Parent Categories (for sub-categories) */}
          {category.isSubCategory && parentCategories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Parent Categories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {parentCategories.map((parent) => (
                  <div
                    key={parent.id}
                    onClick={() => handleViewParentCategory(parent)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <img
                        src={parent.coverImage}
                        alt={parent.categoryName}
                        className="w-12 h-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_IMAGE;
                        }}
                      />
                      <div>
                        <h4 className="font-medium text-gray-800">
                          {parent.categoryName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {parent.shortDescription}
                        </p>
                      </div>
                    </div>
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Parent Category
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub Categories Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <FolderOpen className="w-6 h-6 text-gray-600" />
            <span>
              {category.isSubCategory
                ? "Related Sub Categories"
                : "Sub Categories"}
            </span>
          </h2>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {subCategories.length} items
          </span>
        </div>

        {subCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subCategories.map((subCategory) => (
              <div
                key={subCategory.id}
                onClick={() => handleViewSubCategory(subCategory)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={subCategory.coverImage}
                    alt={subCategory.categoryName}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_IMAGE;
                    }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {subCategory.categoryName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {subCategory.shortDescription}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                    Sub Category
                  </span>
                  <span className="text-xs text-gray-500">
                    Click to view details
                  </span>
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
            <p className="text-sm text-gray-500">
              {category.isSubCategory
                ? "Sub-categories with the same parent will appear here"
                : "Sub-categories will appear here when created"}
            </p>
          </div>
        )}
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

          return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
                  <FolderOpen className="w-6 h-6 text-gray-600" />
                  <span>Other Sub Categories in Same Parent</span>
                </h2>
                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                  {relatedSubCategories.length} items
                </span>
              </div>

              {relatedSubCategories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {relatedSubCategories.map((relatedSubCategory) => (
                    <div
                      key={relatedSubCategory.id}
                      onClick={() => handleViewSubCategory(relatedSubCategory)}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={relatedSubCategory.coverImage}
                          alt={relatedSubCategory.categoryName}
                          className="w-12 h-12 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = DEFAULT_IMAGE;
                          }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-800">
                            {relatedSubCategory.categoryName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {relatedSubCategory.shortDescription}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          Related Sub Category
                        </span>
                        <span className="text-xs text-gray-500">
                          Click to view details
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">
                    No related sub-categories found
                  </p>
                  <p className="text-sm text-gray-500">
                    Other sub-categories with the same parent will appear here
                  </p>
                </div>
              )}
            </div>
          );
        })()}

      {/* Products Section */}
      {/* <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Package className="w-6 h-6 text-gray-600" />
            <span>Products in this Category</span>
          </h2>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {products.length} items
          </span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-800 line-clamp-2">
                      {product.name}
                    </h4>
                    <span className="text-lg font-bold text-red-600">
                      ${product.price}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm text-gray-600">
                        {product.rating}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.inStock
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No products found in this category</p>
            <p className="text-sm text-gray-500">
              Products will appear here when added to this category
            </p>
          </div>
        )}
      </div> */}
    </div>
  );
}
