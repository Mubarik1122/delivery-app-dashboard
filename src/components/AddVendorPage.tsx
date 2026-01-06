import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Save,
  ArrowLeft,
  Upload,
  FileText,
  Loader,
  Lock,
  Eye,
  EyeOff,
  Image as ImageIcon,
} from "lucide-react";
import { apiService, CreateUserRequest } from "../services/api";
import { useNavigate } from "react-router-dom";

interface AddVendorPageProps {
  onBack: () => void;
}

export default function AddVendorPage({ onBack }: AddVendorPageProps) {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    restaurantName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    description: "",
    agreement: null as File | null,
    restaurantImage: null as File | null,
    password: "",
    confirmPassword: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    is_food: false,
    is_grocery: false,
  });
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.is_food && !formData.is_grocery) {
      setError("Please select at least one business type (Food Restaurant or Grocery)");
      return;
    }

    if (!formData.restaurantImage) {
      setError("Please upload a business image");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      let restaurantImageBase64: string | undefined;

      // Convert image to base64 (required, so it will always be present)
      if (formData.restaurantImage) {
        restaurantImageBase64 = await convertImageToBase64(formData.restaurantImage);
      }

      const requestData: CreateUserRequest = {
        role_name: "Vendor",
        first_name: formData.name.trim(),
        last_name: formData.lastName.trim(),
        phone_number: formData.phone.trim(),
        email_address: formData.email.trim(),
        street_address1: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        zip_code: formData.zipCode.trim(),
        description: formData.description.trim() || "Restaurant vendor",
        restaurant_name: formData.restaurantName.trim(),
        restaurant_image: restaurantImageBase64,
        agreement_docs: formData.agreement?.name || undefined,
        password: formData.password,
        latitude: formData.latitude,
        longitude: formData.longitude,
        is_food: formData.is_food,
        is_grocery: formData.is_grocery,
      };

      // console.log("Creating vendor with data:", requestData);

      const response = await apiService.createVendor(requestData);

      if (response && response.errorCode === 0) {
        // Success - navigate back to vendors list
        navigate("/vendors");
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Vendor created successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response?.errorMessage || "Failed to create vendor",
        });
      }
    } catch (error) {
      console.error("Error creating vendor:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error instanceof Error ? error.message : "Failed to create vendor",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError("Please select a valid file (.doc, .pdf, or image files)");
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size should be less than 10MB");
        return;
      }

      handleInputChange("agreement", file);
      setError(""); // Clear any previous errors
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        setError("Please select a valid image file (JPG, PNG, or GIF)");
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      handleInputChange("restaurantImage", file);
      setError("");

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

        // Add CSS to ensure dropdown is visible
        const pacContainer = document.querySelector('.pac-container') as HTMLElement;
        if (pacContainer) {
          pacContainer.style.zIndex = '9999';
        }

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
              address: addressText || prev.address,
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
              zipCode: zipCode || prev.zipCode,
            }));
          }
        });

        autocompleteRef.current = autocomplete;

        // Monitor for pac-container and style it
        const observer = new MutationObserver(() => {
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

    loadGoogleMapsScript();

    return () => {
      if (autocompleteRef.current && typeof window.google !== 'undefined') {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Vendors</span>
            </button>
          </div>
        </div>
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-800">Add New Vendor</h1>
          <p className="text-gray-600">
            Create a new vendor account for restaurant partners
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter first name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter last name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.restaurantName}
                    onChange={(e) =>
                      handleInputChange("restaurantName", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter restaurant name"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type *
                </label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_food}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, is_food: e.target.checked }))
                      }
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      disabled={isSubmitting}
                    />
                    <span className="text-sm text-gray-700">Food Restaurant</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_grocery}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, is_grocery: e.target.checked }))
                      }
                      className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      disabled={isSubmitting}
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
                      {formData.restaurantImage
                        ? formData.restaurantImage.name
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
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        document.getElementById("business-image-upload")?.click()
                      }
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1 mx-auto"
                      disabled={isSubmitting}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter email address"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter phone number"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address * (Search with Google Places)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    ref={addressInputRef}
                    type="text"
                    value={formData.address}
                    onChange={(e) => {
                      // Allow Google Places to handle the input, but also update our state
                      handleInputChange("address", e.target.value);
                    }}
                    onBlur={(e) => {
                      // Update state on blur if needed
                      if (e.target.value !== formData.address) {
                        handleInputChange("address", e.target.value);
                      }
                    }}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Start typing address (e.g., Lahore, Pakistan)..."
                    required
                    disabled={isSubmitting}
                    autoComplete="off"
                  />
                </div>
                {(formData.latitude && formData.longitude) && (
                  <p className="mt-1 text-xs text-gray-500">
                    Location: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter city"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter state"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter ZIP code"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Brief description about the restaurant (optional)"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Account Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter password (min 8 characters)"
                    required
                    minLength={8}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Confirm password"
                    required
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agreement Document (PDF/Image)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  {formData.agreement
                    ? formData.agreement.name
                    : "Click to upload agreement document"}
                </p>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="agreement-upload"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("agreement-upload")?.click()
                  }
                  disabled={isSubmitting}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center space-x-1 mx-auto"
                >
                  <FileText className="w-4 h-4" />
                  <span>Choose File</span>
                </button>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              Terms & Conditions
            </h4>
            <p className="text-sm text-gray-600">
              By creating this vendor account, you agree that the vendor will
              comply with all platform policies, maintain food quality
              standards, and provide timely service to customers.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              <span>
                {isSubmitting ? "Creating..." : "Create Vendor Account"}
              </span>
            </button>
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
