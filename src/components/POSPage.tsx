import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  DollarSign,
  Loader,
  Package,
} from "lucide-react";
import { apiService, Item, Category } from "../services/api";
import Swal from "sweetalert2";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export default function POSPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | "all">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const DEFAULT_COVER_IMAGE =
    "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300";

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [itemsResponse, categoriesResponse] = await Promise.all([
        apiService.getAllItems(),
        apiService.getAllCategories(),
      ]);

      if (itemsResponse.errorCode === 0 && itemsResponse.data) {
        const mappedItems = itemsResponse.data.items.map((item: any) => ({
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
          quantity: Number(item.quantity) || 0,
          price:
            item.unit_price !== undefined && item.unit_price !== null
              ? parseFloat(String(item.unit_price)) || 0
              : item.price !== undefined && item.price !== null
              ? parseFloat(String(item.price)) || 0
              : 0,
          vendorId: item.vendor_id || item.vendorId,
        }));
        setItems(mappedItems);
      }

      if (categoriesResponse.errorCode === 0 && categoriesResponse.data) {
        const mappedCategories = categoriesResponse.data.map((cat: any) => ({
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
        setCategories(mappedCategories);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load items and categories");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Failed to load data",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === "all" ||
      item.categoryIds.includes(selectedCategory as number);
    const matchesSearch = item.itemName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (item: Item) => {
    if ((item.quantity || 0) <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Out of Stock",
        text: "This item is currently out of stock",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        if (existing.quantity >= (item.quantity || 0)) {
          Swal.fire({
            icon: "warning",
            title: "Stock Limit",
            text: `Only ${item.quantity} items available in stock`,
            timer: 2000,
            showConfirmButton: false,
          });
          return prev;
        }
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.itemName,
          price: item.price || 0,
          quantity: 1,
          image: item.coverImageUrl,
        },
      ];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== id));
    } else {
      const item = items.find((i) => i.id === id);
      if (item && quantity > (item.quantity || 0)) {
        Swal.fire({
          icon: "warning",
          title: "Stock Limit",
          text: `Only ${item.quantity} items available in stock`,
          timer: 2000,
          showConfirmButton: false,
        });
        return;
      }
      setCart((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity } : item))
      );
    }
  };

  const getCategoryName = (categoryIds: number[]) => {
    if (categoryIds.length === 0) return "Uncategorized";
    const category = categories.find((cat) => cat.id === categoryIds[0]);
    return category?.categoryName || "Uncategorized";
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Empty Cart",
        text: "Please add items to cart before checkout",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Order Placed!",
      text: `Total amount: $${grandTotal.toFixed(2)}`,
      confirmButtonText: "OK",
    }).then(() => {
      setCart([]);
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = total * 0.1;
  const grandTotal = total + tax;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 text-red-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full gap-6">
      <div className="flex-1">
        <div className="bg-white rounded-xl border border-gray-200 p-6 h-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Point of Sale
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
          )}

          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === "all"
                  ? "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.categoryName}
              </button>
            ))}
          </div>

          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                >
                  <img
                    src={item.coverImageUrl}
                    alt={item.itemName}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_COVER_IMAGE;
                    }}
                  />
                  <h3 className="font-medium text-gray-800 mb-1 text-sm line-clamp-2">
                    {item.itemName}
                  </h3>
                  <p className="text-red-600 font-bold">
                    ${(item.price || 0).toFixed(2)}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs ${
                        (item.quantity || 0) > 0
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {(item.quantity || 0) > 0
                        ? `${item.quantity} in stock`
                        : "Out of Stock"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {getCategoryName(item.categoryIds)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-800 mb-2">
                No Items Found
              </h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== "all"
                  ? "No items match your current filters."
                  : "No items available in your inventory."}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="w-full lg:w-96">
        <div className="bg-white rounded-xl border border-gray-200 p-6 h-full">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">Current Order</h3>
            <ShoppingCart className="w-6 h-6 text-gray-600" />
          </div>

          <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No items in cart</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 text-sm">
                      {item.name}
                    </h4>
                    <p className="text-red-600 font-bold">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <>
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (10%):</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                  <span>Total:</span>
                  <span className="text-red-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Pay with Card</span>
                </button>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <DollarSign className="w-5 h-5" />
                  <span>Pay with Cash</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
