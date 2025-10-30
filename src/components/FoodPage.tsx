import React, { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Eye, Package, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { apiService, Item, Category } from "../services/api";

export default function FoodPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const DEFAULT_COVER_IMAGE =
    "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300";

  useEffect(() => {
    loadItems();
    loadCategories();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getAllItems();

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
            item.background_image_url || item.backgroundImageUrl || "",
          categoryIds: Array.isArray(item.categories)
            ? item.categories.map((cat: any) => cat.id)
            : [],
          quantity: item.quantity || 0,
          price: item.price || 0,
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
    const matchesSearch = item.itemName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" ||
      item.categoryIds.some((catId) => {
        const category = categories.find((cat) => cat.id === catId);
        return category?.categoryName === selectedCategory;
      });
    return matchesSearch && matchesCategory;
  });

  const handleAddItem = () => {
    navigate("/items/new");
  };

  const handleEditItem = (item: Item) => {
    navigate("/items/update", { state: { editItem: item } });
  };

  const handleViewItem = (item: Item) => {
    navigate(`/items/${item.id}`);
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

  const getCategoryName = (categoryIds: number[]) => {
    if (categoryIds.length === 0) return "Uncategorized";
    const category = categories.find((cat) => cat.id === categoryIds[0]);
    return category?.categoryName || "Uncategorized";
  };

  const inStockCount = items.filter((item) => (item.quantity || 0) > 0).length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              Food Management
            </h1>
            <p className="text-gray-600">Manage your restaurant menu items</p>
          </div>
          <button
            onClick={handleAddItem}
            className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Food</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
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
                Filtered Items
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredItems.length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Package className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Stock</p>
              <p className="text-2xl font-bold text-gray-900">{inStockCount}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
              <Package className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search food items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryOptions.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

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

      {!loading && filteredItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div className="relative">
                <img
                  src={item.coverImageUrl}
                  alt={item.itemName}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_COVER_IMAGE;
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      (item.quantity || 0) > 0
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {(item.quantity || 0) > 0
                      ? `${item.quantity} in stock`
                      : "Out of Stock"}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 text-lg">
                    {item.itemName}
                  </h3>
                  {item.price && (
                    <span className="text-red-600 font-bold text-lg">
                      ${item.price.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.shortDescription || "No description available"}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {getCategoryName(item.categoryIds)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleViewItem(item)}
                    className="flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">View</span>
                  </button>
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
    </div>
  );
}
