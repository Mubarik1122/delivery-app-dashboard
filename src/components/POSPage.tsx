import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  Loader,
  Package,
  X,
  Trash2,
} from "lucide-react";
import {
  apiService,
  Item,
  Category,
  CartItem as ApiCartItem,
} from "../services/api";
import Swal from "sweetalert2";

interface LocalCartItem {
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
  const [cart, setCart] = useState<LocalCartItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const [checkoutForm, setCheckoutForm] = useState({
    cardholderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const DEFAULT_COVER_IMAGE =
    "https://images.pexels.com/photos/315755/pexels-photo-315755.jpeg?auto=compress&cs=tinysrgb&w=300";

  useEffect(() => {
    loadData();
    loadCart();
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
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const response = await apiService.getCartDetails();
      if (response.errorCode === 0 && response.data) {
        const cartItems: LocalCartItem[] = response.data.items.map(
          (item: ApiCartItem) => ({
            id: item.item_id,
            name: item.item_name || "Item",
            price: Number(item.unit_price) || Number(item.price) || 0,
            quantity: item.quantity,
            image: item.cover_image_url || DEFAULT_COVER_IMAGE,
          })
        );
        setCart(cartItems);
        setCartCount(cartItems.reduce((sum, item) => sum + item.quantity, 0));
      }
    } catch (error) {
      console.error("Error loading cart:", error);
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

  const addToCart = async (item: Item) => {
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

    try {
      const response = await apiService.addToCart({
        item_id: item.id,
        quantity: 1,
      });

      if (response.errorCode === 0) {
        await loadCart();
        Swal.fire({
          icon: "success",
          title: "Added!",
          text: `${item.itemName} added to cart`,
          timer: 1500,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Failed to add to cart",
      });
    }
  };

  const updateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(id);
      return;
    }

    try {
      const response = await apiService.updateCartItem(id, {
        quantity: newQuantity,
      });
      if (response.errorCode === 0) {
        await loadCart();
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update cart",
      });
    }
  };

  const removeFromCart = async (id: number) => {
    try {
      await apiService.removeCartItem(id);
      await loadCart();
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  const getCategoryName = (categoryIds: number[]) => {
    if (categoryIds.length === 0) return "Uncategorized";
    const category = categories.find((cat) => cat.id === categoryIds[0]);
    return category?.categoryName || "Uncategorized";
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Empty Cart",
        text: "Please add items to cart before checkout",
      });
      return;
    }
    setShowCheckoutModal(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const paymentMethod = await apiService.createStripePaymentMethod(
        "tok_visa"
      );

      const orderData = {
        shipping_address: {
          line1: checkoutForm.address,
          city: checkoutForm.city,
          state: checkoutForm.state,
          zip: checkoutForm.zip,
        },
        payment_method_id: paymentMethod.id,
        order_total: grandTotal.toString(),
        items: cart.map((item) => ({
          item_id: item.id,
          quantity: item.quantity,
        })),
      };

      const response = await apiService.createOrder(orderData);

      if (response.errorCode === 0) {
        await apiService.clearCart();
        setCart([]);
        setCartCount(0);
        setShowCheckoutModal(false);
        setCheckoutForm({
          cardholderName: "",
          cardNumber: "",
          expiryDate: "",
          cvv: "",
          address: "",
          city: "",
          state: "",
          zip: "",
        });

        Swal.fire({
          icon: "success",
          title: "Order Placed!",
          text: `Your order has been placed successfully. Total: $${grandTotal.toFixed(
            2
          )}`,
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      Swal.fire({
        icon: "error",
        title: "Checkout Failed",
        text:
          error instanceof Error ? error.message : "Failed to process payment",
      });
    } finally {
      setIsProcessing(false);
    }
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
    <>
      <div className="flex flex-col lg:flex-row h-full gap-6">
        <div className="flex-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Point of Sale
              </h2>
              <div className="relative">
                <button
                  onClick={() => setShowCheckoutModal(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      {cartCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

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
                    className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-lg transition-all duration-200"
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
                    <p className="text-red-600 font-bold mb-2">
                      ${(item.price || 0).toFixed(2)}
                    </p>
                    <button
                      onClick={() => addToCart(item)}
                      disabled={(item.quantity || 0) <= 0}
                      className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-xs">Add to Cart</span>
                    </button>
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
      </div>

      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Checkout</h2>
                <button
                  onClick={() => setShowCheckoutModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Cart Items
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 text-sm">
                              {item.name}
                            </h4>
                            <p className="text-red-600 font-bold text-sm">
                              ${(item.price || 0).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center hover:bg-green-200"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 mt-4 pt-4 space-y-2">
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
                      <span className="text-red-600">
                        ${grandTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Payment Details
                  </h3>
                  <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        value={checkoutForm.cardholderName}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            cardholderName: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={checkoutForm.cardNumber}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            cardNumber: e.target.value,
                          })
                        }
                        placeholder="4242 4242 4242 4242"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.expiryDate}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              expiryDate: e.target.value,
                            })
                          }
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.cvv}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              cvv: e.target.value,
                            })
                          }
                          placeholder="123"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Shipping Address
                      </label>
                      <input
                        type="text"
                        value={checkoutForm.address}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            address: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.city}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              city: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.state}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              state: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP
                        </label>
                        <input
                          type="text"
                          value={checkoutForm.zip}
                          onChange={(e) =>
                            setCheckoutForm({
                              ...checkoutForm,
                              zip: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          <span>Pay ${grandTotal.toFixed(2)}</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
