import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
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
  DollarSign,
  Info,
  AlertCircle,
  Sparkles,
  CheckCircle,
} from "lucide-react";
import {
  apiService,
  Item,
  CreateUpdateItemRequest,
  UpdateItemRequest,
  Category,
  Addon,
  ItemSize,
  Flavor,
} from "../services/api";

export default function ItemsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
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
  const [showAddonDropdown, setShowAddonDropdown] = useState(false);
  const [showFlavorDropdown, setShowFlavorDropdown] = useState(false);
  const [flavors, setFlavors] = useState<Flavor[]>([]);
  const [formData, setFormData] = useState({
    itemName: "",
    shortDescription: "",
    longDescription: "",
    coverImageUrl: "",
    backgroundImageUrl: "",
    categoryIds: [] as number[],
    addonIds: [] as number[],
    flavorIds: [] as number[],
    sizes: [] as ItemSize[],
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

  // Load item data for edit mode
  const loadItemForEdit = async (itemId: number) => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getItemById(itemId);

      if (response.errorCode === 0 && response.data && Array.isArray(response.data.items) && response.data.items.length > 0) {
        const itemData = response.data.items[0];
        
        // Map item data
        const mappedItem: Item = {
          id: Number(itemData.id),
          itemName: itemData.item_name || itemData.itemName,
          shortDescription: itemData.short_description || itemData.shortDescription || "",
          longDescription: itemData.long_description || itemData.longDescription || "",
          coverImageUrl: getImageUrl(itemData.cover_image_url || itemData.coverImageUrl),
          backgroundImageUrl: getImageUrl(itemData.background_image_url || itemData.backgroundImageUrl),
          categoryIds: Array.isArray(itemData.categories)
            ? itemData.categories.map((cat: any) => Number(cat.id))
            : [],
          addonIds: Array.isArray(itemData.addons)
            ? itemData.addons.map((addon: any) => Number(addon.id || addon))
            : [],
          flavorIds: Array.isArray(itemData.flavors)
            ? itemData.flavors.map((flavor: any) => Number(flavor.id || flavor))
            : [],
          sizes: Array.isArray(itemData.sizes)
            ? itemData.sizes.map((size: any) => ({
                sizeName: size.size_name || size.sizeName || "",
                price: typeof size.price === 'string' ? parseFloat(size.price) : (typeof size.price === 'number' ? size.price : 0),
              }))
            : [],
          quantity: Number(itemData.quantity) || 0,
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

        // Extract categories from item response and set them
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
          setCategories(mappedCategories);
        }

        // Extract addons from item response and add them to addons state
        // This ensures selected addons are visible in the dropdown even if they're inactive
        if (Array.isArray(itemData.addons)) {
          const mappedAddonsFromItem = itemData.addons.map((addon: any) => ({
            id: Number(addon.id || addon),
            addonName: addon.addon_name || addon.addonName || "",
            description: addon.description || "",
            price: typeof addon.price === 'string' ? parseFloat(addon.price) : (typeof addon.price === 'number' ? addon.price : 0),
            isActive: addon.is_active !== undefined ? addon.is_active : (addon.isActive !== undefined ? addon.isActive : true),
            createdAt: addon.created_at || addon.createdAt,
            updatedAt: addon.updated_at || addon.updatedAt,
            userId: addon.user_id || addon.userId,
          }));
          
          // Merge with existing addons, avoiding duplicates
          setAddons((prevAddons) => {
            const existingIds = new Set(prevAddons.map(a => a.id));
            const newAddons = mappedAddonsFromItem.filter(a => !existingIds.has(a.id));
            return [...prevAddons, ...newAddons];
          });
        }

        // Extract flavors from item response and merge with existing flavors
        // This ensures selected flavors are visible in the dropdown even if they're inactive
        if (Array.isArray(itemData.flavors)) {
          const mappedFlavorsFromItem = itemData.flavors.map((flavor: any) => ({
            id: flavor.id ? Number(flavor.id) : undefined,
            flavorName: flavor.flavor_name || flavor.flavorName || flavor.name || "",
            description: flavor.description || "",
            imageUrl: flavor.image_url || flavor.imageUrl,
            isActive: flavor.is_active !== undefined ? flavor.is_active : (flavor.isActive !== undefined ? flavor.isActive : true),
          }));
          
          // Merge with existing flavors (from loadFlavors) to avoid duplicates
          setFlavors((prevFlavors) => {
            const merged = [...prevFlavors];
            mappedFlavorsFromItem.forEach((itemFlavor) => {
              if (itemFlavor.id && !merged.find((f) => f.id === itemFlavor.id)) {
                merged.push(itemFlavor);
              }
            });
            return merged;
          });
        }

        // Populate form with item data
        // Store full URLs in formData for display in input fields
        // When submitting, we'll convert them back to relative paths if needed
        const originalCoverImage = itemData.cover_image_url || itemData.coverImageUrl || "";
        const originalBackgroundImage = itemData.background_image_url || itemData.backgroundImageUrl || "";
        
        // Convert relative paths to full URLs for display in input fields
        const coverImageForDisplay = originalCoverImage 
          ? (originalCoverImage.startsWith('http://') || originalCoverImage.startsWith('https://') 
              ? originalCoverImage 
              : getImageUrl(originalCoverImage))
          : "";
        const backgroundImageForDisplay = originalBackgroundImage
          ? (originalBackgroundImage.startsWith('http://') || originalBackgroundImage.startsWith('https://')
              ? originalBackgroundImage
              : getImageUrl(originalBackgroundImage))
          : "";
        
        setFormData({
          itemName: mappedItem.itemName,
          shortDescription: mappedItem.shortDescription,
          longDescription: mappedItem.longDescription,
          coverImageUrl: coverImageForDisplay,
          backgroundImageUrl: backgroundImageForDisplay,
          categoryIds: mappedItem.categoryIds,
          addonIds: mappedItem.addonIds || [],
          flavorIds: (mappedItem as any).flavorIds || [],
          sizes: mappedItem.sizes || [],
          quantity: mappedItem.quantity || 0,
          price: mappedItem.price || 0,
        });
        // Use full URLs for preview display
        setCoverImagePreview(mappedItem.coverImageUrl);
        setBackgroundImagePreview(mappedItem.backgroundImageUrl);
        setEditingItem(mappedItem);
        setShowAddForm(true);
      } else {
        setError(response.errorMessage || "Failed to load item");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.errorMessage || "Failed to load item",
        });
      }
    } catch (error) {
      console.error("Error loading item for edit:", error);
      setError("Failed to load item");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error instanceof Error ? error.message : "Failed to load item",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Handle edit mode - get ID from URL params or location state
    if (isEditMode) {
      const itemId = searchParams.get('id') || location.state?.itemId || location.state?.editItem?.id;
      if (itemId) {
        loadItemForEdit(Number(itemId));
      } else if (location.state?.editItem) {
        // Fallback to old method if ID not available
        const item = location.state.editItem;
        setFormData({
          itemName: item.itemName,
          shortDescription: item.shortDescription,
          longDescription: item.longDescription,
          coverImageUrl: item.coverImageUrl,
          backgroundImageUrl: item.backgroundImageUrl,
          categoryIds: item.categoryIds,
          addonIds: item.addonIds || [],
          flavorIds: (item as any).flavorIds || [],
          sizes: item.sizes || [],
          quantity: Number(item.quantity) || 0,
          price: parseFloat(String(item.price)) || 0,
        });
        setCoverImagePreview(item.coverImageUrl);
        setBackgroundImagePreview(item.backgroundImageUrl);
        setEditingItem(item);
        setShowAddForm(true);
      }
    } else if (isAddMode) {
      resetForm();
      setShowAddForm(true);
    }
  }, [location, isAddMode, isEditMode, searchParams]);

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
    // Only load items and categories if NOT in edit mode
    // In edit mode, item data and categories will be loaded from getItemById
    if (!isEditMode) {
      loadItems();
      loadCategories();
    }
    // Always load addons and flavors as they're needed for the form
    loadAddons();
    loadFlavors();
  }, [isEditMode]);

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
          coverImageUrl: getImageUrl(item.cover_image_url || item.coverImageUrl) || DEFAULT_COVER_IMAGE,
          backgroundImageUrl:
            item.background_image_url ||
            item.backgroundImageUrl ||
            DEFAULT_BACKGROUND_IMAGE,
          categoryIds: Array.isArray(item.categories)
            ? item.categories.map((cat: any) => cat.id)
            : [],
          addonIds: Array.isArray(item.addons)
            ? item.addons.map((addon: any) => Number(addon.id || addon))
            : Array.isArray(item.addon_ids)
            ? item.addon_ids.map((id: any) => Number(id))
            : [],
          sizes: Array.isArray(item.sizes)
            ? item.sizes.map((size: any) => ({
                sizeName: size.size_name || size.sizeName || "",
                price: typeof size.price === 'string' ? parseFloat(size.price) : (typeof size.price === 'number' ? size.price : 0),
              }))
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
          coverImage: getImageUrl(cat.cover_image || cat.coverImage),
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

  const loadAddons = async () => {
    try {
      const response = await apiService.getAllAddons();
      if (response.errorCode === 0 && response.data) {
        // Map snake_case API response to camelCase and filter only active addons
        const mapped = response.data
          .map((addon: any) => ({
            id: addon.id,
            addonName: addon.addon_name || addon.addonName,
            description: addon.description,
            price: typeof addon.price === 'string' ? parseFloat(addon.price) : (typeof addon.price === 'number' ? addon.price : 0),
            isActive: addon.is_active !== undefined ? addon.is_active : addon.isActive,
            createdAt: addon.created_at || addon.createdAt,
            updatedAt: addon.updated_at || addon.updatedAt,
            userId: addon.user_id || addon.userId,
          }))
          .filter((addon: Addon) => addon.isActive); // Only active addons
        setAddons(mapped);
      }
    } catch (error) {
      console.error("Error loading addons:", error);
    }
  };

  const loadFlavors = async () => {
    try {
      const response = await apiService.getAllFlavors();
      if (response.errorCode === 0 && response.data) {
        // Map snake_case API response to camelCase and filter only active flavors
        const mapped = response.data
          .map((flavor: any) => ({
            id: flavor.id,
            flavorName: flavor.flavor_name || flavor.flavorName,
            description: flavor.description || "",
            imageUrl: flavor.image_url || flavor.imageUrl,
            isActive: flavor.is_active !== undefined ? flavor.is_active : flavor.isActive,
            createdAt: flavor.created_at || flavor.createdAt,
            updatedAt: flavor.updated_at || flavor.updatedAt,
            userId: flavor.user_id || flavor.userId,
          }))
          .filter((flavor: Flavor) => flavor.isActive); // Only active flavors
        setFlavors(mapped);
      }
    } catch (error) {
      console.error("Error loading flavors:", error);
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
      addonIds: [],
      flavorIds: [],
      sizes: [],
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
    navigate(`/items/update?id=${item.id}`, { state: { itemId: item.id, editItem: item } });
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

      // Handle image URLs:
      // 1. If it's a base64 data URL (from file upload), send it as is
      // 2. If it's a relative path (starts with /), send it as is (existing image on server - API should not download)
      // 3. If it's a full URL from our server, convert to relative path (remove base URL)
      // 4. If it's an external URL (http:// or https://), send it as is (API will try to download)
      // 5. If it's empty, send undefined (let API handle defaults)
      const getImageValue = (imageUrl: string, defaultImage: string): string | undefined => {
        const trimmed = imageUrl.trim();
        if (!trimmed) {
          return undefined; // Don't send empty strings, let API handle defaults
        }
        
        // If it's a base64 data URL, send it as is
        if (trimmed.startsWith('data:')) {
          return trimmed;
        }
        
        // If it's a relative path (starts with /), send it as is (already on server)
        if (trimmed.startsWith('/')) {
          return trimmed;
        }
        
        // If it's a full URL from our server, convert to relative path
        const baseUrl = IMAGE_BASE_URL;
        if (trimmed.startsWith(baseUrl)) {
          const relativePath = trimmed.substring(baseUrl.length);
          return relativePath.startsWith('/') ? relativePath : '/' + relativePath;
        }
        
        // If it's an external URL (http:// or https://), send it as is
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
          return trimmed;
        }
        
        // Otherwise, use default (but only for new items, not updates)
        return editingItem ? undefined : defaultImage;
      };

      const finalCoverImage = getImageValue(formData.coverImageUrl, DEFAULT_COVER_IMAGE);
      const finalBackgroundImage = getImageValue(formData.backgroundImageUrl, DEFAULT_BACKGROUND_IMAGE);

      const itemData: CreateUpdateItemRequest = {
        ...(editingItem && { id: editingItem.id }),
        itemName: formData.itemName.trim(),
        shortDescription: formData.shortDescription.trim(),
        longDescription: formData.longDescription.trim(),
        coverImageUrl: finalCoverImage,
        backgroundImageUrl: finalBackgroundImage,
        categoryIds: formData.categoryIds,
        addonIds: formData.addonIds.length > 0 ? formData.addonIds : undefined,
        flavorIds: formData.flavorIds.length > 0 ? formData.flavorIds : undefined,
        sizes: formData.sizes.length > 0 ? formData.sizes : undefined,
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
    value: string | number | number[] | ItemSize[]
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

  const handleAddonToggle = (addonId: number) => {
    const newAddonIds = formData.addonIds.includes(addonId)
      ? formData.addonIds.filter((id) => id !== addonId)
      : [...formData.addonIds, addonId];
    handleInputChange("addonIds", newAddonIds);
  };

  const handleFlavorToggle = (flavorId: number) => {
    const newFlavorIds = formData.flavorIds.includes(flavorId)
      ? formData.flavorIds.filter((id) => id !== flavorId)
      : [...formData.flavorIds, flavorId];
    handleInputChange("flavorIds", newFlavorIds);
  };

  const handleAddSize = () => {
    // Get available sizes (not already selected)
    const availableSizes = ["Small", "Medium", "Large"].filter(
      (size) => !formData.sizes.some((s) => s.sizeName === size)
    );
    
    if (availableSizes.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "All Sizes Added",
        text: "You have already added all available sizes (Small, Medium, Large).",
      });
      return;
    }
    
    const newSizes = [...formData.sizes, { sizeName: availableSizes[0], price: 0 }];
    handleInputChange("sizes", newSizes);
  };

  const handleRemoveSize = (index: number) => {
    const newSizes = formData.sizes.filter((_, i) => i !== index);
    handleInputChange("sizes", newSizes);
  };

  const handleSizeChange = (index: number, field: "sizeName" | "price", value: string | number) => {
    const newSizes = [...formData.sizes];
    newSizes[index] = { ...newSizes[index], [field]: value };
    handleInputChange("sizes", newSizes);
  };

  const getCategoryNames = (categoryIds: number[]) => {
    return categories
      .filter((cat) => categoryIds.includes(cat.id))
      .map((cat) => cat.categoryName)
      .join(", ");
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
                  navigate("/items");
                  resetForm();
                }}
                className="bg-white bg-opacity-20 backdrop-blur-sm text-white px-4 py-2 rounded-xl hover:bg-opacity-30 transition-all flex items-center space-x-2 font-medium shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Items</span>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-4 rounded-xl">
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                  {editingItem ? "Edit Item" : "Add New Item"}
                </h1>
                <p className="text-white text-opacity-90 text-lg">
                  {editingItem
                    ? "Update item information and details"
                    : "Create a new item for your menu"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-300 text-red-800 px-6 py-4 rounded-xl text-sm mb-6 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Information */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Item Information
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.itemName}
                    onChange={(e) =>
                      handleInputChange("itemName", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white text-gray-900 placeholder-gray-400"
                    placeholder="e.g., Margherita Pizza"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white text-gray-900 placeholder-gray-400"
                    placeholder="A brief description of the item"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white text-gray-900 placeholder-gray-400 resize-none"
                    placeholder="Provide detailed information about the item"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                    </div>
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
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white text-gray-900 placeholder-gray-400"
                      placeholder="0.00"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity in Stock <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Package className="w-4 h-4 text-gray-400" />
                    </div>
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
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white text-gray-900 placeholder-gray-400"
                      placeholder="0"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Categories
                </h3>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Categories <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                {/* Multi-select dropdown trigger */}
                <div
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 cursor-pointer bg-white min-h-[42px] flex items-center justify-between hover:border-gray-400 transition-all"
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
                                src={getImageUrl(category.coverImage)}
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
                                src={getImageUrl(category.coverImage)}
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

            {/* Addons Selection */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Addons (Optional)
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Select addons that can be added to this item
                </p>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Addons
              </label>
              <div className="relative">
                {/* Multi-select dropdown trigger */}
                <div
                  onClick={() => setShowAddonDropdown(!showAddonDropdown)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 cursor-pointer bg-white min-h-[42px] flex items-center justify-between hover:border-gray-400 transition-all"
                >
                  <div className="flex-1">
                    {formData.addonIds.length === 0 ? (
                      <span className="text-gray-500">
                        Select addons (optional)...
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {formData.addonIds.slice(0, 3).map((addonId) => {
                          const addon = addons.find(
                            (a) => a.id === addonId
                          );
                          return addon ? (
                            <span
                              key={addonId}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs"
                            >
                              {addon.addonName}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddonToggle(addonId);
                                }}
                                className="ml-1 hover:bg-purple-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ) : null;
                        })}
                        {formData.addonIds.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{formData.addonIds.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {formData.addonIds.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInputChange("addonIds", []);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Clear all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div
                      className={`transform transition-transform ${
                        showAddonDropdown ? "rotate-180" : ""
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
                {showAddonDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {addons.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No active addons available
                      </div>
                    ) : (
                      <div className="p-2">
                        {/* Select All / Deselect All */}
                        <div className="flex items-center justify-between p-2 border-b border-gray-100 mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {formData.addonIds.length} of {addons.length}{" "}
                            selected
                          </span>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleInputChange(
                                  "addonIds",
                                  addons.map((a) => a.id)
                                )
                              }
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleInputChange("addonIds", [])
                              }
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>

                        {/* Addon options */}
                        <div className="space-y-1">
                          {addons.map((addon) => (
                            <label
                              key={addon.id}
                              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={formData.addonIds.includes(addon.id)}
                                onChange={() => handleAddonToggle(addon.id)}
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                disabled={isSubmitting}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-800">
                                    {addon.addonName}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    ${typeof addon.price === 'number' ? addon.price.toFixed(2) : parseFloat(String(addon.price || 0)).toFixed(2)}
                                  </span>
                                </div>
                                {addon.description && (
                                  <p className="text-xs text-gray-500 truncate mt-0.5">
                                    {addon.description}
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
                {showAddonDropdown && (
                  <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowAddonDropdown(false)}
                  />
                )}
              </div>
            </div>

            {/* Flavors Selection */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Flavors (Optional)
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Select flavors available for this item
                </p>
              </div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Flavors
              </label>
              <div className="relative">
                {/* Multi-select dropdown trigger */}
                <div
                  onClick={() => setShowFlavorDropdown(!showFlavorDropdown)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 cursor-pointer bg-white min-h-[42px] flex items-center justify-between hover:border-gray-400 transition-all"
                >
                  <div className="flex-1">
                    {formData.flavorIds.length === 0 ? (
                      <span className="text-gray-500">
                        Select flavors (optional)...
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {formData.flavorIds.slice(0, 3).map((flavorId) => {
                          const flavor = flavors.find(
                            (f) => f.id === flavorId
                          );
                          return flavor ? (
                            <span
                              key={flavorId}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs"
                            >
                              {flavor.flavorName}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFlavorToggle(flavorId);
                                }}
                                className="ml-1 hover:bg-pink-200 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ) : null;
                        })}
                        {formData.flavorIds.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{formData.flavorIds.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {formData.flavorIds.length > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleInputChange("flavorIds", []);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-1"
                        title="Clear all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <div
                      className={`transform transition-transform ${
                        showFlavorDropdown ? "rotate-180" : ""
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
                {showFlavorDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {flavors.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No flavors available. Flavors will appear here when available in the item data.
                      </div>
                    ) : (
                      <div className="p-2">
                        {/* Select All / Deselect All */}
                        <div className="flex items-center justify-between p-2 border-b border-gray-100 mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {formData.flavorIds.length} of {flavors.filter(f => f.id).length}{" "}
                            selected
                          </span>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleInputChange(
                                  "flavorIds",
                                  flavors.filter(f => f.id).map((f) => f.id as number)
                                )
                              }
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleInputChange("flavorIds", [])
                              }
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>

                        {/* Flavor options */}
                        <div className="space-y-1">
                          {flavors.map((flavor) => (
                            <label
                              key={flavor.id}
                              className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={flavor.id ? formData.flavorIds.includes(flavor.id) : false}
                                onChange={() => flavor.id && handleFlavorToggle(flavor.id)}
                                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                disabled={isSubmitting || !flavor.id}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-gray-800">
                                    {flavor.flavorName}
                                  </span>
                                  {flavor.isActive && (
                                    <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 ml-2" />
                                  )}
                                </div>
                                {flavor.description && (
                                  <p className="text-xs text-gray-500 truncate mt-0.5">
                                    {flavor.description}
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
                {showFlavorDropdown && (
                  <div
                    className="fixed inset-0 z-0"
                    onClick={() => setShowFlavorDropdown(false)}
                  />
                )}
              </div>
            </div>

            {/* Sizes Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Sizes (Optional)
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Add different sizes with prices for this item
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSize}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    disabled={isSubmitting}
                  >
                    <Plus className="w-4 h-4" />
                    Add Size
                  </button>
                </div>
              </div>

              {formData.sizes.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                  <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No sizes added. Click "Add Size" to add size options.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.sizes.map((size, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Size Name
                          </label>
                          <select
                            value={size.sizeName}
                            onChange={(e) =>
                              handleSizeChange(index, "sizeName", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm bg-white"
                            disabled={isSubmitting}
                          >
                            <option value="">Select Size</option>
                            {["Small", "Medium", "Large"]
                              .filter(
                                (availableSize) =>
                                  !formData.sizes.some(
                                    (s, i) => s.sizeName === availableSize && i !== index
                                  )
                              )
                              .map((availableSize) => (
                                <option key={availableSize} value={availableSize}>
                                  {availableSize}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Price
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={size.price}
                              onChange={(e) =>
                                handleSizeChange(
                                  index,
                                  "price",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                              placeholder="0.00"
                              disabled={isSubmitting}
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={isSubmitting}
                        title="Remove size"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cover Image Upload */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Cover Image
                </h3>
              </div>

              <div className="mb-4">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setImageUploadMethod("url");
                      setSelectedCoverFile(null);
                      setCoverImagePreview("");
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
                      handleInputChange("coverImageUrl", "");
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white text-gray-900 placeholder-gray-400"
                    placeholder="https://example.com/image.jpg"
                    disabled={isSubmitting}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Cover Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-all bg-gray-50">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-700 mb-1">
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
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all text-sm font-medium flex items-center space-x-2 mx-auto"
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
                    src={getImageUrl(coverImagePreview || formData.coverImageUrl)}
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
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  Background Image
                </h3>
              </div>

              <div className="mb-4">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setBackgroundImageMethod("url");
                      setSelectedBackgroundFile(null);
                      setBackgroundImagePreview("");
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                      backgroundImageMethod === "url"
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
                      setBackgroundImageMethod("upload");
                      handleInputChange("backgroundImageUrl", "");
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium ${
                      backgroundImageMethod === "upload"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all bg-white text-gray-900 placeholder-gray-400"
                    placeholder="https://example.com/background.jpg"
                    disabled={isSubmitting}
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Background Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-all bg-gray-50">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-700 mb-1">
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
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all text-sm font-medium flex items-center space-x-2 mx-auto"
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
                    src={backgroundImagePreview || getImageUrl(formData.backgroundImageUrl)}
                    alt="Background Preview"
                    className="w-full max-w-md h-40 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      // If preview fails, try the formData URL, then default
                      if (backgroundImagePreview && e.currentTarget.src !== getImageUrl(formData.backgroundImageUrl)) {
                        e.currentTarget.src = getImageUrl(formData.backgroundImageUrl);
                      } else {
                        e.currentTarget.src = DEFAULT_BACKGROUND_IMAGE;
                      }
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
                  navigate("/items");
                  resetForm();
                }}
                disabled={isSubmitting}
                className="bg-white text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-all font-medium border border-gray-300 hover:border-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || formData.categoryIds.length === 0}
                className="bg-red-500 text-white px-6 py-2.5 rounded-lg hover:bg-red-600 transition-all flex items-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
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
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 pb-6">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-r from-red-500 via-red-600 to-red-700 rounded-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-5"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
          <div className="relative p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-bold text-white mb-1">
                      Items Management
                    </h1>
                    <p className="text-white text-opacity-90">
                      Manage your menu items and products
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddItem}
                className="bg-white text-red-600 px-6 py-3 rounded-xl hover:bg-gray-50 transition-all flex items-center space-x-2 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                <span>Add New Item</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group relative bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 mb-1">Total Items</p>
                <p className="text-3xl font-bold text-blue-700">
                  {items.length}
                </p>
                <p className="text-xs text-blue-500 mt-1">All items in inventory</p>
              </div>
              <div className="bg-blue-200 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200 opacity-20 rounded-full -mr-10 -mt-10"></div>
          </div>

          <div className="group relative bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-600 mb-1">
                  Filtered Results
                </p>
                <p className="text-3xl font-bold text-orange-700">
                  {filteredItems.length}
                </p>
                <p className="text-xs text-orange-500 mt-1">Matching your search</p>
              </div>
              <div className="bg-orange-200 p-4 rounded-xl group-hover:scale-110 transition-transform">
                <Filter className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200 opacity-20 rounded-full -mr-10 -mt-10"></div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search items by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Category Filter Dropdown */}
            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 font-medium cursor-pointer"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Items per page selector */}
            <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200">
              <span className="text-sm text-gray-600 font-medium">Show:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-gray-700 font-medium cursor-pointer"
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
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("itemName")}
                        className="flex items-center space-x-2 hover:text-red-600 transition-colors group"
                      >
                        <span>Item Name</span>
                        <ArrowUpDown className="w-4 h-4 group-hover:text-red-600" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("shortDescription")}
                        className="flex items-center space-x-2 hover:text-red-600 transition-colors group"
                      >
                        <span>Description</span>
                        <ArrowUpDown className="w-4 h-4 group-hover:text-red-600" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Categories
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort("createdAt")}
                        className="flex items-center space-x-2 hover:text-red-600 transition-colors group"
                      >
                        <span>Created</span>
                        <ArrowUpDown className="w-4 h-4 group-hover:text-red-600" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-200 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="relative">
                          <img
                            src={getImageUrl(item.coverImageUrl)}
                            alt={item.itemName}
                            className="w-16 h-16 rounded-xl object-cover border-2 border-gray-200 group-hover:border-red-300 transition-all shadow-sm group-hover:shadow-md"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_COVER_IMAGE;
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                              {item.itemName}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {item.shortDescription?.substring(0, 40)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-xs truncate">
                          {item.shortDescription || "No description"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold text-green-700 bg-green-50 border border-green-200">
                          ${(item.price || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${
                            (item.quantity || 0) > 0
                              ? "bg-green-100 text-green-800 border border-green-300"
                              : "bg-red-100 text-red-800 border border-red-300"
                          }`}
                        >
                          {item.quantity || 0}{" "}
                          {(item.quantity || 0) === 1 ? "unit" : "units"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {item.categoryIds.slice(0, 2).map((categoryId) => {
                            const category = categories.find(
                              (cat) => cat.id === categoryId
                            );
                            return category ? (
                              <span
                                key={categoryId}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                              >
                                {category.categoryName}
                              </span>
                            ) : null;
                          })}
                          {item.categoryIds.length > 2 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                              +{item.categoryIds.length - 2}
                            </span>
                          )}
                          {item.categoryIds.length === 0 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                              No categories
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleViewItem(item)}
                            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-all p-2 rounded-lg border border-transparent hover:border-blue-200"
                            title="View Item"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-green-600 hover:text-green-800 hover:bg-green-50 transition-all p-2 rounded-lg border border-transparent hover:border-green-200"
                            title="Edit Item"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 transition-all p-2 rounded-lg border border-transparent hover:border-red-200"
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
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 font-medium">
                      Showing{" "}
                      <span className="font-bold text-gray-900">{startIndex + 1}</span> to{" "}
                      <span className="font-bold text-gray-900">
                        {Math.min(
                          startIndex + itemsPerPage,
                          sortedItems.length
                        )}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-gray-900">{sortedItems.length}</span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-xl shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-3 py-2 rounded-l-xl border-2 border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                              className={`relative inline-flex items-center px-4 py-2 border-2 text-sm font-semibold transition-all ${
                                currentPage === pageNum
                                  ? "z-10 bg-gradient-to-r from-red-500 to-red-600 border-red-600 text-white shadow-lg"
                                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
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
                        className="relative inline-flex items-center px-3 py-2 rounded-r-xl border-2 border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-lg p-12 text-center">
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Items Found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started by creating your first menu item to build your inventory.
            </p>
            <button
              onClick={handleAddItem}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all flex items-center space-x-2 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Item</span>
            </button>
          </div>
        )}

        {/* No Search Results */}
        {!loading && items.length > 0 && filteredItems.length === 0 && (
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 shadow-lg p-12 text-center">
            <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No Items Match Your Search
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 transition-all font-medium border border-gray-300"
            >
              Clear Search & Filters
            </button>
          </div>
        )}
      </div>
    </>
  );
}
