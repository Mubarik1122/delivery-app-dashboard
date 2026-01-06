import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ArrowLeft, Save, Loader, Upload, Image as ImageIcon, MapPin } from "lucide-react";
import { apiService } from "../services/api";

interface VendorFormData {
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  street_address1: string;
  street_address2: string;
  city: string;
  state: string;
  zip_code: string;
  restaurant_name: string;
  restaurant_image?: string;
  description: string;
  latitude?: number;
  longitude?: number;
  is_food?: boolean;
  is_grocery?: boolean;
}

export default function EditVendorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [restaurantImageFile, setRestaurantImageFile] = useState<File | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

  // Image base URL from environment variable (only for images, not for API calls)
  const IMAGE_BASE_URL = ((import.meta.env.VITE_IMAGE_BASE_URL as string) || "https://groceryapp-production-d3fc.up.railway.app").trim().replace(/\/+$/, "");

  // Helper function to get full image URL
  const getImageUrl = (imagePath: string | undefined | null): string => {
    if (!imagePath) return "";
    
    // Trim the path to remove any leading/trailing spaces
    const trimmedPath = imagePath.trim();
    
    // If already a full URL (starts with http:// or https://), return as is
    if (trimmedPath.startsWith("http://") || trimmedPath.startsWith("https://")) {
      return trimmedPath;
    }
    
    // If it's a base64 data URL, return as is
    if (trimmedPath.startsWith("data:")) {
      return trimmedPath;
    }
    
    // Remove leading slash if present
    const cleanPath = trimmedPath.startsWith("/") ? trimmedPath.substring(1) : trimmedPath;
    
    // Join base URL and path without double slashes
    return `${IMAGE_BASE_URL}/${cleanPath}`;
  };

  const [formData, setFormData] = useState<VendorFormData>({
    first_name: "",
    last_name: "",
    email_address: "",
    phone_number: "",
    street_address1: "",
    street_address2: "",
    city: "",
    state: "",
    zip_code: "",
    restaurant_name: "",
    restaurant_image: "",
    description: "",
    latitude: undefined,
    longitude: undefined,
    is_food: false,
    is_grocery: false,
  });

  // Geocode address if latitude/longitude are missing
  const geocodeAddress = async (street: string, city: string, state: string) => {
    if (typeof window.google === 'undefined' || !window.google.maps || !window.google.maps.Geocoder) {
      return;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();
      const address = `${street}, ${city}, ${state}`;
      
      geocoder.geocode({ address }, (results: any, status: any) => {
        if (status === 'OK' && results && results[0] && results[0].geometry && results[0].geometry.location) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }));
        }
      });
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  };

  useEffect(() => {
    if (id) {
      loadVendorData(parseInt(id));
    }
  }, [id]);

  const loadVendorData = async (userId: number) => {
    try {
      setLoading(true);
      // Call API with role=Vendor and user_id
      const response = await apiService.getUsers('Vendor', userId);

      if (response.errorCode === 0 && response.data) {
        // API will return the specific vendor directly
        const vendor = Array.isArray(response.data) ? response.data[0] : response.data;

        if (vendor) {
          setFormData({
            first_name: vendor.first_name,
            last_name: vendor.last_name,
            email_address: vendor.email_address,
            phone_number: vendor.phone_number,
            street_address1: vendor.street_address1,
            street_address2: vendor.street_address2 || "",
            city: vendor.city,
            state: vendor.state,
            zip_code: vendor.zip_code,
            restaurant_name: vendor.restaurant_name || "",
            restaurant_image: vendor.restaurant_image || "",
            description: vendor.description || "",
            latitude: vendor.latitude, // Set from API if available
            longitude: vendor.longitude, // Set from API if available
            is_food: vendor.is_food || false,
            is_grocery: vendor.is_grocery || false,
          });
          
          // Set image preview if restaurant_image exists (convert to full URL)
          if (vendor.restaurant_image) {
            setImagePreview(getImageUrl(vendor.restaurant_image));
          }
          
          // If latitude/longitude are not available, geocode the address
          if ((!vendor.latitude || !vendor.longitude) && typeof window.google !== 'undefined' && window.google.maps) {
            geocodeAddress(vendor.street_address1, vendor.city, vendor.state);
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Not Found",
            text: "Vendor not found",
          });
          navigate("/vendors");
        }
      }
    } catch (error) {
      console.error("Error loading vendor data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load vendor data",
      });
    } finally {
      setLoading(false);
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Invalid File",
          text: "Please select a valid image file (JPG, PNG, or GIF)",
        });
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Image size should be less than 5MB",
        });
        return;
      }

      setRestaurantImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Load Google Maps script dynamically
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || 'AIzaSyDF9W6kpZzxWD1C-xR8VHfz2W9-dw9Fvbc';
      
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Script already loaded, wait for it to be ready
        const checkGoogleMaps = setInterval(() => {
          if (typeof window.google !== 'undefined' && window.google.maps && window.google.maps.places && addressInputRef.current) {
            clearInterval(checkGoogleMaps);
            initializeAutocomplete();
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkGoogleMaps);
        }, 5000);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        // Wait for Google Maps to be fully ready AND input ref to be available
        const checkGoogleMaps = setInterval(() => {
          if (typeof window.google !== 'undefined' && window.google.maps && window.google.maps.places && addressInputRef.current) {
            clearInterval(checkGoogleMaps);
            initializeAutocomplete();
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkGoogleMaps);
        }, 5000);
      };
      script.onerror = () => {
        console.error('Failed to load Google Maps script');
        Swal.fire({
          icon: 'error',
          title: 'Google Maps API Error',
          html: `
            <p class="text-left mb-4">Google Maps API load nahi ho rahi. Please check:</p>
            <ol class="text-left list-decimal list-inside space-y-2">
              <li>Google Cloud Console mein <strong>Maps JavaScript API</strong> enable karein</li>
              <li><strong>Places API</strong> bhi enable karein</li>
              <li>API key sahi hai ya nahi check karein</li>
              <li>Billing account linked hai ya nahi verify karein</li>
            </ol>
            <p class="text-left mt-4 text-sm text-gray-600">
              <a href="https://console.cloud.google.com/apis/library" target="_blank" class="text-blue-600 underline">
                Google Cloud Console - APIs Library
              </a>
            </p>
          `,
          confirmButtonText: 'OK',
        });
      };
      document.head.appendChild(script);
    };

    const initializeAutocomplete = () => {
      if (!addressInputRef.current) {
        console.log('Address input ref not available, will retry...');
        // Retry after a short delay if ref is not available
        setTimeout(() => {
          if (addressInputRef.current) {
            initializeAutocomplete();
          }
        }, 200);
        return;
      }

      if (typeof window.google === 'undefined' || !window.google.maps || !window.google.maps.places) {
        console.log('Google Maps API not loaded yet');
        return;
      }

      try {
        // Clear any existing autocomplete
        if (autocompleteRef.current) {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        }

        // Check if Places API is available
        if (!window.google.maps.places) {
          console.error('Places API not loaded');
          Swal.fire({
            icon: 'error',
            title: 'Places API Error',
            text: 'Places API load nahi ho rahi. Please enable Places API in Google Cloud Console.',
            confirmButtonText: 'OK',
          });
          return;
        }

        const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
          // No types restriction - will show addresses, establishments, and all places
          componentRestrictions: { country: ['pk', 'us'] },
          fields: ['formatted_address', 'geometry', 'address_components', 'name', 'place_id', 'types'],
        });

        // Add CSS to ensure dropdown is visible and styled
        const styleDropdown = () => {
          const pacContainer = document.querySelector('.pac-container') as HTMLElement;
          if (pacContainer) {
            pacContainer.style.zIndex = '9999';
            pacContainer.style.borderRadius = '0.75rem';
            pacContainer.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)';
            pacContainer.style.border = '1px solid #e5e7eb';
            pacContainer.style.marginTop = '4px';
            pacContainer.style.overflow = 'hidden';
            
            // Style the items inside
            const pacItems = pacContainer.querySelectorAll('.pac-item');
            pacItems.forEach((item: Element) => {
              const htmlItem = item as HTMLElement;
              htmlItem.style.padding = '12px 16px';
              htmlItem.style.cursor = 'pointer';
              htmlItem.style.borderBottom = '1px solid #f3f4f6';
              htmlItem.style.transition = 'background-color 0.2s';
              
              // Hover effect
              htmlItem.addEventListener('mouseenter', () => {
                htmlItem.style.backgroundColor = '#f9fafb';
              });
              htmlItem.addEventListener('mouseleave', () => {
                htmlItem.style.backgroundColor = 'transparent';
              });
            });
            
            // Style the icons
            const pacIcons = pacContainer.querySelectorAll('.pac-icon');
            pacIcons.forEach((icon: Element) => {
              const htmlIcon = icon as HTMLElement;
              htmlIcon.style.marginRight = '12px';
              htmlIcon.style.width = '20px';
              htmlIcon.style.height = '20px';
            });
          }
        };
        
        styleDropdown();

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          
          if (place.geometry && place.geometry.location) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            // For establishments, use name + formatted_address
            // For addresses, use formatted_address
            let addressText = '';
            if (place.types && place.types.includes('establishment')) {
              // It's a business/establishment - show name and address
              addressText = place.name ? `${place.name}, ${place.formatted_address || ''}` : place.formatted_address || place.name || '';
            } else {
              // It's an address
              addressText = place.formatted_address || place.name || '';
            }
            
            setFormData((prev) => ({
              ...prev,
              latitude: lat,
              longitude: lng,
              street_address1: addressText || prev.street_address1,
            }));

            // Extract address components
            let city = '';
            let state = '';
            let zipCode = '';

            place.address_components?.forEach((component: any) => {
              const types = component.types;
              if (types.includes('locality')) {
                city = component.long_name;
              }
              if (types.includes('administrative_area_level_1')) {
                state = component.long_name;
              }
              if (types.includes('postal_code')) {
                zipCode = component.long_name;
              }
            });

            setFormData((prev) => ({
              ...prev,
              city: city || prev.city,
              state: state || prev.state,
              zip_code: zipCode || prev.zip_code,
            }));
          }
        });

        autocompleteRef.current = autocomplete;

        // Monitor for pac-container and set z-index
        const observer = new MutationObserver(() => {
          const pacContainer = document.querySelector('.pac-container') as HTMLElement;
          if (pacContainer) {
            pacContainer.style.zIndex = '9999';
          }
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });

        return () => {
          observer.disconnect();
        };
      } catch (error) {
        console.error('Error initializing autocomplete:', error);
      }
    };

    // Add CSS for Google Places dropdown
    const style = document.createElement('style');
    style.textContent = `
      .pac-container {
        z-index: 9999 !important;
        border-radius: 8px !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        margin-top: 4px !important;
      }
      .pac-item {
        padding: 12px !important;
        cursor: pointer !important;
      }
      .pac-item:hover {
        background-color: #f3f4f6 !important;
      }
      .pac-item-selected {
        background-color: #e5e7eb !important;
      }
    `;
    document.head.appendChild(style);

    // Wait for component to fully render before initializing
    const timer = setTimeout(() => {
      loadGoogleMapsScript();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (autocompleteRef.current && typeof window.google !== 'undefined') {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate business type
    if (!formData.is_food && !formData.is_grocery) {
      Swal.fire({
        icon: 'error',
        title: 'Business Type Required',
        text: 'Please select at least one business type (Food Restaurant or Grocery).',
        confirmButtonText: 'OK',
      });
      return;
    }
    
    // Validate business image (either new upload or existing image)
    if (!restaurantImageFile && !formData.restaurant_image) {
      Swal.fire({
        icon: 'error',
        title: 'Business Image Required',
        text: 'Please upload a business image.',
        confirmButtonText: 'OK',
      });
      return;
    }
    
    // Validate latitude and longitude
    if (!formData.latitude || !formData.longitude) {
      Swal.fire({
        icon: 'error',
        title: 'Location Required',
        text: 'Please select a location from the address suggestions to get latitude and longitude.',
        confirmButtonText: 'OK',
      });
      return;
    }
    
    setSaving(true);

    try {
      let restaurantImageBase64: string | undefined;

      // Convert new image to base64 if uploaded
      if (restaurantImageFile) {
        restaurantImageBase64 = await convertImageToBase64(restaurantImageFile);
      } else if (formData.restaurant_image) {
        // Keep existing image if no new image uploaded
        restaurantImageBase64 = formData.restaurant_image;
      }

      const updateData = {
        role_name: "Vendor",
        first_name: formData.first_name,
        last_name: formData.last_name,
        email_address: formData.email_address,
        phone_number: formData.phone_number,
        street_address1: formData.street_address1,
        street_address2: formData.street_address2,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        restaurant_name: formData.restaurant_name,
        restaurant_image: restaurantImageBase64,
        description: formData.description,
        password: "",
        latitude: formData.latitude,
        longitude: formData.longitude,
        is_food: formData.is_food,
        is_grocery: formData.is_grocery,
      };

      const response = await apiService.updateUser(parseInt(id!), updateData);

      if (response.errorCode === 0) {
        Swal.fire({
          title: "Success!",
          text: "Vendor information updated successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/vendors");
      } else {
        throw new Error(response.errorMessage || "Failed to update");
      }
    } catch (error) {
      console.error("Error updating vendor:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update vendor information",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/vendors")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Vendors</span>
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Vendor</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email_address"
                value={formData.email_address}
                onChange={handleChange}
                required
                disabled
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurant Name
              </label>
              <input
                type="text"
                name="restaurant_name"
                value={formData.restaurant_name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Type *
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_food || false}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_food: e.target.checked }))
                    }
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    disabled={saving}
                  />
                  <span className="text-sm text-gray-700">Food Restaurant</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_grocery || false}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, is_grocery: e.target.checked }))
                    }
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    disabled={saving}
                  />
                  <span className="text-sm text-gray-700">Grocery</span>
                </label>
              </div>
              {!formData.is_food && !formData.is_grocery && (
                <p className="mt-1 text-xs text-red-500">
                  Please select at least one business type
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Image *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    {restaurantImageFile
                      ? restaurantImageFile.name
                      : formData.restaurant_image
                      ? "Current image (click to change)"
                      : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    PNG, JPG, GIF up to 5MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="business-image-upload"
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("business-image-upload")?.click()
                    }
                    className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1 mx-auto"
                    disabled={saving}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Choose File</span>
                  </button>
                </div>
                {imagePreview && (
                  <div className="flex items-center justify-center">
                    <div className="relative w-full">
                      <img
                        src={imagePreview}
                        alt="Business preview"
                        className="w-full h-auto max-h-64 object-contain rounded-lg border border-gray-300 bg-gray-50"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address 1 * (Search with Google Places)
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={addressInputRef}
                  type="text"
                  name="street_address1"
                  value={formData.street_address1}
                  onChange={(e) => {
                    // Allow Google Places to handle the input, but also update our state
                    handleChange(e);
                  }}
                  onBlur={(e) => {
                    // Update state on blur if needed
                    if (e.target.value !== formData.street_address1) {
                      handleChange(e);
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Start typing address (e.g., Lahore, Pakistan)..."
                  required
                  autoComplete="off"
                />
              </div>
              {(formData.latitude && formData.longitude) && (
                <p className="mt-1 text-xs text-gray-500">
                  Location: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address 2
              </label>
              <input
                type="text"
                name="street_address2"
                value={formData.street_address2}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ZIP Code
              </label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/vendors")}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
