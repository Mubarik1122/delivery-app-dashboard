import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Package,
  Calendar,
  Tag,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Store,
  Info,
  PlusCircle,
  Ruler,
  Sparkles,
} from "lucide-react";
import { Item, Category, Addon, ItemSize, Flavor, apiService } from "../services/api";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [itemCategories, setItemCategories] = useState<Category[]>([]);
  const [itemAddons, setItemAddons] = useState<Addon[]>([]);
  const [itemSizes, setItemSizes] = useState<ItemSize[]>([]);
  const [itemFlavors, setItemFlavors] = useState<Flavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default demo images
  const DEFAULT_COVER_IMAGE =
    "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300";
  const DEFAULT_BACKGROUND_IMAGE =
    "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800";

  // Image base URL from environment variable (only for images, not for API calls)
  const IMAGE_BASE_URL = ((import.meta.env.VITE_IMAGE_BASE_URL as string) || "https://groceryapp-production-d3fc.up.railway.app").trim().replace(/\/+$/, "");

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string | undefined | null): string => {
    if (!imagePath) return DEFAULT_COVER_IMAGE;
    
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
      fetchItemDetails(id);
    }
  }, [id]);

  const fetchItemDetails = async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Call API with specific item ID
      const response: any = await apiService.getItemById(Number(itemId));

      if (response.errorCode === 0 && response.data) {
        // Handle response format: { items: [...] } or direct Item object
        const responseData: any = response.data;
        const itemData: any = (responseData.items && Array.isArray(responseData.items) && responseData.items.length > 0)
          ? responseData.items[0]
          : responseData;
        
        // Map the API response to ensure consistent structure
        const mappedItem: Item = {
          id: Number(itemData.id),
          itemName: itemData.item_name || itemData.itemName,
          shortDescription:
            itemData.short_description || itemData.shortDescription || "",
          longDescription: itemData.long_description || itemData.longDescription || "",
          coverImageUrl: getImageUrl(itemData.cover_image_url || itemData.coverImageUrl) || DEFAULT_COVER_IMAGE,
          backgroundImageUrl: getImageUrl(itemData.background_image_url || itemData.backgroundImageUrl) || DEFAULT_BACKGROUND_IMAGE,
          categoryIds: Array.isArray(itemData.categories)
            ? itemData.categories.map((cat: any) => Number(cat.id))
            : Array.isArray(itemData.categoryIds)
            ? itemData.categoryIds.map((id: any) => Number(id))
            : [],
          addonIds: Array.isArray(itemData.addons)
            ? itemData.addons.map((addon: any) => Number(addon.id || addon))
            : Array.isArray(itemData.addon_ids)
            ? itemData.addon_ids.map((id: any) => Number(id))
            : [],
          sizes: Array.isArray(itemData.sizes)
            ? itemData.sizes.map((size: any) => ({
                sizeName: size.size_name || size.sizeName || "",
                price: typeof size.price === 'string' ? parseFloat(size.price) : (typeof size.price === 'number' ? size.price : 0),
              }))
            : [],
          quantity: Number(itemData.quantity) || 0,
          // Prefer unit_price from API, then fallback to price
          price:
            itemData.unit_price !== undefined && itemData.unit_price !== null
              ? parseFloat(String(itemData.unit_price)) || 0
              : itemData.price !== undefined && itemData.price !== null
              ? parseFloat(String(itemData.price)) || 0
              : 0,
          createdAt: itemData.created_at || itemData.createdAt,
          updatedAt: itemData.updated_at || itemData.updatedAt,
          vendorId: itemData.vendor_id || itemData.vendorId,
        };

        setItem(mappedItem);

        // Extract categories from item response
        if (Array.isArray(itemData.categories)) {
          const mappedCategories = itemData.categories.map((cat: any) => ({
            id: Number(cat.id),
            categoryName: cat.category_name || cat.categoryName,
            shortDescription: cat.short_description || cat.shortDescription || "",
            longDescription: cat.long_description || cat.longDescription || "",
            isSubCategory: cat.is_sub_category !== undefined ? cat.is_sub_category : false,
            coverImage: getImageUrl(cat.cover_image || cat.coverImage),
            parentCategoryIds: Array.isArray(cat.parent_categories)
              ? cat.parent_categories.map((p: any) => Number(p.id))
              : [],
          }));
          setItemCategories(mappedCategories);
        }

        // Extract addons from item response
        if (Array.isArray(itemData.addons)) {
          const mappedAddons = itemData.addons.map((addon: any) => ({
            id: Number(addon.id),
            addonName: addon.addon_name || addon.addonName,
            description: addon.description || "",
            price: typeof addon.price === 'string' ? parseFloat(addon.price) : (typeof addon.price === 'number' ? addon.price : 0),
            isActive: addon.is_active !== undefined ? addon.is_active : true,
            createdAt: addon.created_at || addon.createdAt,
            updatedAt: addon.updated_at || addon.updatedAt,
            userId: addon.user_id || addon.userId,
          }));
          setItemAddons(mappedAddons);
        }

        // Extract sizes from item response
        if (Array.isArray(itemData.sizes)) {
          const mappedSizes = itemData.sizes.map((size: any) => ({
            sizeName: size.size_name || size.sizeName || "",
            price: typeof size.price === 'string' ? parseFloat(size.price) : (typeof size.price === 'number' ? size.price : 0),
          }));
          setItemSizes(mappedSizes);
        }

        // Extract flavors from item response
        if (Array.isArray(itemData.flavors)) {
          const mappedFlavors = itemData.flavors.map((flavor: any) => ({
            id: flavor.id ? Number(flavor.id) : undefined,
            flavorName: flavor.flavor_name || flavor.flavorName || flavor.name || "",
            description: flavor.description || "",
            isActive: flavor.is_active !== undefined ? flavor.is_active : (flavor.isActive !== undefined ? flavor.isActive : true),
          }));
          setItemFlavors(mappedFlavors);
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

  // Categories are now set directly from item response, no need for separate effect

  const handleBack = () => {
    navigate("/items");
  };

  const handleEdit = () => {
    // Navigate to items page and trigger edit mode
    if (item) {
      navigate(`/items/update?id=${item.id}`, { state: { itemId: item.id, editItem: item } });
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <span className="text-gray-600 text-lg">Loading item details...</span>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Item Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          {error || "The requested item could not be found."}
        </p>
        <button
          onClick={handleBack}
          className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-all flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Items</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Hero Section with Background Image */}
      <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32"></div>
        
        {/* Background Image Overlay */}
        <div className="absolute inset-0 opacity-20">
          <img
            src={getImageUrl(item.backgroundImageUrl)}
            alt={item.itemName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_BACKGROUND_IMAGE;
            }}
          />
        </div>

        <div className="relative p-8">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-opacity-30 transition-all flex items-center space-x-2 font-medium shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Items</span>
            </button>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleEdit}
                className="bg-white text-red-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Edit className="w-5 h-5" />
                <span>Edit Item</span>
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-800 bg-opacity-80 text-white px-6 py-3 rounded-xl hover:bg-opacity-100 transition-all flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Trash2 className="w-5 h-5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Item Info in Hero */}
          <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
            {/* Cover Image */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-transparent opacity-30 rounded-2xl blur-xl"></div>
              <img
                src={getImageUrl(item.coverImageUrl)}
                alt={item.itemName}
                className="relative w-48 h-48 rounded-2xl object-cover border-4 border-white shadow-2xl ring-4 ring-white ring-opacity-30 transform transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_COVER_IMAGE;
                }}
              />
              <div className="absolute inset-0 -z-10 bg-white opacity-20 rounded-2xl blur-2xl transform scale-110"></div>
            </div>

            {/* Item Details */}
            <div className="flex-1 text-center md:text-left text-white">
              <div className="mb-4">
                <span className="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium mb-3 inline-block">
                  Item ID: #{item.id}
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-extrabold mb-3 leading-tight">
                {item.itemName}
              </h1>
              <p className="text-white text-opacity-90 text-lg mb-4">
                {item.shortDescription}
              </p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {itemCategories.map((category) => (
                  <span
                    key={category.id}
                    className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium border border-white border-opacity-30"
                  >
                    {category.categoryName}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Item Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Price Card */}
        <div className="group relative bg-gradient-to-br from-green-50 via-green-50 to-green-100 rounded-xl border-2 border-green-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-green-200 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-green-700" />
            </div>
          </div>
          <p className="text-sm font-semibold text-green-700 mb-1">Price</p>
          <p className="text-3xl font-bold text-green-700">
            ${(item.price || 0).toFixed(2)}
          </p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-green-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>

        {/* Stock Card */}
        <div className="group relative bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-blue-200 p-3 rounded-xl">
              <Package className="w-6 h-6 text-blue-700" />
            </div>
          </div>
          <p className="text-sm font-semibold text-blue-700 mb-1">Stock</p>
          <p className="text-3xl font-bold text-blue-700">
            {item.quantity || 0}
          </p>
          <p className="text-xs text-blue-600 mt-1">units available</p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>

        {/* Created Date Card */}
        <div className="group relative bg-gradient-to-br from-purple-50 via-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-purple-200 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-purple-700" />
            </div>
          </div>
          <p className="text-sm font-semibold text-purple-700 mb-1">Created Date</p>
          <p className="text-lg font-bold text-purple-700">
            {item.createdAt
              ? new Date(item.createdAt).toLocaleDateString()
              : "N/A"}
          </p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>

        {/* Categories Card */}
        <div className="group relative bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className="bg-orange-200 p-3 rounded-xl">
              <Tag className="w-6 h-6 text-orange-700" />
            </div>
          </div>
          <p className="text-sm font-semibold text-orange-700 mb-1">Categories</p>
          <p className="text-3xl font-bold text-orange-700">
            {itemCategories.length}
          </p>
          <p className="text-xs text-orange-600 mt-1">assigned</p>
          <div className="absolute top-0 right-0 w-16 h-16 bg-orange-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>

        {/* Status Card */}
        <div className="group relative bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100 rounded-xl border-2 border-emerald-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-xl ${(item.quantity || 0) > 0 ? 'bg-emerald-200' : 'bg-red-200'}`}>
              {(item.quantity || 0) > 0 ? (
                <CheckCircle className="w-6 h-6 text-emerald-700" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-700" />
              )}
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">Status</p>
          <span
            className={`inline-block px-4 py-2 rounded-lg text-sm font-bold ${
              (item.quantity || 0) > 0
                ? "bg-emerald-200 text-emerald-800 border border-emerald-300"
                : "bg-red-200 text-red-800 border border-red-300"
            }`}
          >
            {(item.quantity || 0) > 0 ? "In Stock" : "Out of Stock"}
          </span>
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-200 opacity-20 rounded-full -mr-8 -mt-8"></div>
        </div>
      </div>

      {/* Description */}
      {item.longDescription && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Info className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800">
              Description
            </h3>
          </div>
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <p className="text-gray-700 leading-relaxed text-lg">
              {item.longDescription}
            </p>
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-50 p-2 rounded-lg">
              <Tag className="w-6 h-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Assigned Categories
            </h2>
          </div>
          <span className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 px-4 py-2 rounded-full text-sm font-semibold border border-orange-300">
            {itemCategories.length} {itemCategories.length === 1 ? 'category' : 'categories'}
          </span>
        </div>

        {itemCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itemCategories.map((category) => (
              <div
                key={category.id}
                className="group bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 p-6 hover:shadow-lg hover:border-orange-300 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <img
                      src={getImageUrl(category.coverImage)}
                      alt={category.categoryName}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 group-hover:border-orange-300 transition-all shadow-sm"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_COVER_IMAGE;
                      }}
                    />
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md">
                      <Store className="w-4 h-4 text-orange-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800 text-lg mb-1">
                      {category.categoryName}
                    </h4>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {category.shortDescription || "No description"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      category.isSubCategory
                        ? "bg-orange-100 text-orange-800 border border-orange-300"
                        : "bg-blue-100 text-blue-800 border border-blue-300"
                    }`}
                  >
                    {category.isSubCategory ? "Sub Category" : "Parent Category"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-700 font-medium text-lg mb-2">No categories assigned</p>
            <p className="text-sm text-gray-500">
              Categories will appear here when assigned to this item
            </p>
          </div>
        )}
      </div>

      {/* Addons, Sizes & Flavors Combined Section */}
      {(itemAddons.length > 0 || itemSizes.length > 0 || itemFlavors.length > 0) && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Addons Section */}
            {itemAddons.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="bg-purple-50 p-2 rounded-lg">
                      <PlusCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">Available Addons</h3>
                  </div>
                  <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-md text-xs font-medium">
                    {itemAddons.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {itemAddons.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-200 hover:border-purple-200 hover:bg-purple-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-purple-100 p-2 rounded-lg flex-shrink-0">
                          <PlusCircle className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-800 text-sm truncate">
                              {addon.addonName}
                            </h4>
                            {addon.isActive && (
                              <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                          {addon.description && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {addon.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-md border border-green-200 ml-3 flex-shrink-0">
                        <DollarSign className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">
                          {typeof addon.price === 'number' ? addon.price.toFixed(2) : parseFloat(String(addon.price || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes Section */}
            {itemSizes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="bg-blue-50 p-2 rounded-lg">
                      <Ruler className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">Available Sizes</h3>
                  </div>
                  <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium">
                    {itemSizes.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {itemSizes.map((size, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                          <Ruler className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-800 text-sm">
                            {size.sizeName}
                          </h4>
                          <p className="text-xs text-gray-500">Size Option</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-md border border-green-200 ml-3 flex-shrink-0">
                        <DollarSign className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">
                          {typeof size.price === 'number' ? size.price.toFixed(2) : parseFloat(String(size.price || 0)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Flavors Section */}
            {itemFlavors.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="bg-pink-50 p-2 rounded-lg">
                      <Sparkles className="w-5 h-5 text-pink-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">Available Flavors</h3>
                  </div>
                  <span className="bg-pink-50 text-pink-700 px-2.5 py-1 rounded-md text-xs font-medium">
                    {itemFlavors.length}
                  </span>
                </div>
                <div className="space-y-2.5">
                  {itemFlavors.map((flavor, index) => (
                    <div
                      key={flavor.id || index}
                      className="flex items-center justify-between p-3.5 bg-gray-50 rounded-lg border border-gray-200 hover:border-pink-200 hover:bg-pink-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-pink-100 p-2 rounded-lg flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-pink-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-800 text-sm truncate">
                              {flavor.flavorName}
                            </h4>
                            {flavor.isActive && (
                              <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                          {flavor.description && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {flavor.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
