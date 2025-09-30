import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Image as ImageIcon,
  Calendar,
  Tag,
  Star,
  Clock,
  Users,
} from "lucide-react";
import { Item, Category, apiService } from "../services/api";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [itemCategories, setItemCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default demo images
  const DEFAULT_COVER_IMAGE =
    "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300";
  const DEFAULT_BACKGROUND_IMAGE =
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800";

  useEffect(() => {
    if (id) {
      fetchItemDetails(id);
      loadCategories();
    }
  }, [id]);

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

  const fetchItemDetails = async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching item details for ID:", itemId);

      const response = await apiService.getAllItems();
      console.log("Items API Response:", response);

      if (response.errorCode === 0 && response.data) {
        // Map the API response to ensure consistent structure
        const mappedItems = response.data.items.map((item: any) => ({
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
            : Array.isArray(item.categoryIds)
            ? item.categoryIds
            : [],
          createdAt: item.created_at || item.createdAt,
          updatedAt: item.updated_at || item.updatedAt,
          vendorId: item.vendor_id || item.vendorId,
        }));

        console.log("Mapped items:", mappedItems);
        console.log("Looking for item with ID:", Number(itemId));

        const foundItem = mappedItems.find((i) => i.id === Number(itemId));
        console.log("Found item:", foundItem);

        if (foundItem) {
          setItem(foundItem);
        } else {
          console.log("Item not found in mapped items");
          setError(`Item with ID ${itemId} not found`);
        }
      } else {
        setError(response.errorMessage || "Failed to load item");
      }
    } catch (err) {
      console.error("Error fetching item details:", err);
      setError("Failed to load item details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (item && categories.length > 0) {
      const itemCats = categories.filter((cat) =>
        item.categoryIds.includes(cat.id)
      );
      setItemCategories(itemCats);
    }
  }, [item, categories]);

  const handleBack = () => {
    navigate("/items");
  };

  const handleEdit = () => {
    // Navigate to items page and trigger edit mode
    if (item) {
      navigate("/items/update", { state: { editItem: item } });
    }
  };

  const handleDelete = async () => {
    if (!item) return;

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
      await apiService.deleteItem(item.id);
      navigate("/items");
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Item has been deleted.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error deleting item:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete item",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <span className="text-gray-600">Loading item details...</span>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Item Not Found
        </h2>
        <p className="text-gray-600 mb-4">
          {error || "The requested item could not be found."}
        </p>
        <button
          onClick={handleBack}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Back to Items
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Background Image */}
        <div className="relative h-64 bg-gradient-to-r from-gray-100 to-gray-200">
          <img
            src={item.backgroundImageUrl}
            alt={item.itemName}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_BACKGROUND_IMAGE;
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>

          {/* Back Button */}
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-lg p-2 transition-all duration-200 flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
            <span className="text-gray-700 font-medium">Back to Items</span>
          </button>

          {/* Item ID Badge */}
          {/* <div className="absolute top-4 right-4">
            <span className="bg-white bg-opacity-90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              Item #{item.id}
            </span>
          </div> */}
        </div>

        {/* Item Info */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-6 flex-1">
              <img
                src={item.coverImageUrl}
                alt={item.itemName}
                className="w-32 h-32 object-cover rounded-xl border border-gray-200 shadow-sm"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_COVER_IMAGE;
                }}
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {item.itemName}
                </h1>
                <p className="text-lg text-gray-600 mb-4">
                  {item.shortDescription}
                </p>
                {/* <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-1">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-lg font-medium text-gray-700">
                      4.5
                    </span>
                    <span className="text-gray-500">(128 reviews)</span>
                  </div>
                </div> */}
                <div className="flex flex-wrap gap-2">
                  {itemCategories.map((category) => (
                    <span
                      key={category.id}
                      className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                    >
                      {category.categoryName}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 ml-6">
              <button
                onClick={handleEdit}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Item Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Created Date</span>
          </div>
          <span className="text-gray-600">
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : "N/A"}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Tag className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Categories</span>
          </div>
          <span className="text-gray-600">
            {itemCategories.length} assigned
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Package className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Status</span>
          </div>
          <span className="text-gray-600">Active</span>
        </div>
      </div>

      {/* Description */}
      {item.longDescription && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Description
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {item.longDescription}
          </p>
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
            <Tag className="w-6 h-6 text-gray-600" />
            <span>Assigned Categories</span>
          </h2>
          <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {itemCategories.length} categories
          </span>
        </div>

        {itemCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {itemCategories.map((category) => (
              <div
                key={category.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={category.coverImage}
                    alt={category.categoryName}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_COVER_IMAGE;
                    }}
                  />
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {category.categoryName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {category.shortDescription}
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    category.isSubCategory
                      ? "bg-orange-100 text-orange-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {category.isSubCategory ? "Sub Category" : "Parent Category"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No categories assigned</p>
            <p className="text-sm text-gray-500">
              Categories will appear here when assigned to this item
            </p>
          </div>
        )}
      </div>

      {/* Additional Info */}
      {/* <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">
          Additional Information
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-xl font-bold text-orange-600">4.5</div>
            <div className="text-sm text-orange-700">Rating</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">128</div>
            <div className="text-sm text-green-700">Reviews</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">
                Preparation Time
              </span>
            </div>
            <span className="text-gray-600">15-20 minutes</span>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Serves</span>
            </div>
            <span className="text-gray-600">2-3 people</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}
