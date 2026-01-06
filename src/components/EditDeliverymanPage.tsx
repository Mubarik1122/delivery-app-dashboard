import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ArrowLeft, Save, Loader, Upload, Image as ImageIcon, MapPin } from "lucide-react";
import { apiService } from "../services/api";

interface DeliverymanFormData {
  first_name: string;
  last_name: string;
  email_address: string;
  phone_number: string;
  street_address1: string;
  street_address2: string;
  city: string;
  state: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
}

export default function EditDeliverymanPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [formData, setFormData] = useState<DeliverymanFormData>({
    first_name: "",
    last_name: "",
    email_address: "",
    phone_number: "",
    street_address1: "",
    street_address2: "",
    city: "",
    state: "",
    zip_code: "",
    latitude: undefined,
    longitude: undefined,
  });

  useEffect(() => {
    if (id) {
      loadDeliverymanData(parseInt(id));
    }
  }, [id]);

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

      setProfileImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadDeliverymanData = async (userId: number) => {
    try {
      setLoading(true);
      // Call API with role=Rider and user_id
      const response = await apiService.getUsers('Rider', userId);

      if (response.errorCode === 0 && response.data) {
        // API will return the specific rider directly
        const driver = Array.isArray(response.data) ? response.data[0] : response.data;

        if (driver && driver.role_name === "Rider") {
          setFormData({
            first_name: driver.first_name,
            last_name: driver.last_name,
            email_address: driver.email_address,
            phone_number: driver.phone_number,
            street_address1: driver.street_address1,
            street_address2: driver.street_address2 || "",
            city: driver.city,
            state: driver.state,
            zip_code: driver.zip_code,
            latitude: driver.latitude,
            longitude: driver.longitude,
          });
          
          // If latitude/longitude are missing, geocode the address
          if ((!driver.latitude || !driver.longitude) && driver.street_address1) {
            setTimeout(() => {
              geocodeAddress(driver.street_address1, driver.city, driver.state);
            }, 500);
          }
          
          // Set image preview if existing image exists
          if (driver.restaurant_image) {
            setImagePreview(driver.restaurant_image);
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Not Found",
            text: "Delivery driver not found",
          });
          navigate("/delivery-man-list");
        }
      }
    } catch (error) {
      console.error("Error loading deliveryman data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load delivery driver data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Geocode address if latitude/longitude are missing
  const geocodeAddress = async (streetAddress: string, city: string, state: string) => {
    if (typeof window.google === 'undefined' || !window.google.maps) {
      return;
    }

    try {
      const geocoder = new window.google.maps.Geocoder();
      const fullAddress = `${streetAddress}, ${city}, ${state}`;
      geocoder.geocode({ address: fullAddress }, (results, status) => {
        if (status === 'OK' && results && results[0] && results[0].geometry && results[0].geometry.location) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
          }));
        } else if (status === 'REQUEST_DENIED' || status === 'OVER_QUERY_LIMIT') {
          // Silently fail - geocoding API might not be enabled
          console.warn('Geocoding API not available or quota exceeded:', status);
        }
      });
    } catch (error) {
      console.error('Error geocoding address:', error);
    }
  };

  // Initialize Autocomplete function (defined outside useEffect so it can be called from multiple places)
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

      // Store observer for cleanup if needed
      // Note: observer cleanup should be handled when component unmounts or autocomplete is reinitialized
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }
  };

  // Load Google Maps script and initialize Autocomplete
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

    // Delay to ensure component is rendered
    setTimeout(() => {
      loadGoogleMapsScript();
    }, 100);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate profile image (required)
    if (!profileImageFile && !imagePreview) {
      Swal.fire({
        icon: 'error',
        title: 'Profile Image Required',
        text: 'Please upload a profile image.',
        confirmButtonText: 'OK',
      });
      return;
    }
    
    setSaving(true);

    try {
      let profileImageBase64: string | undefined;

      // Convert new image to base64 if uploaded
      if (profileImageFile) {
        profileImageBase64 = await convertImageToBase64(profileImageFile);
      } else if (imagePreview) {
        // Keep existing image if no new image uploaded
        profileImageBase64 = imagePreview;
      }

      // Validate latitude and longitude
      if (!formData.latitude || !formData.longitude) {
        Swal.fire({
          icon: 'error',
          title: 'Location Required',
          text: 'Please select an address from the suggestions to get location coordinates.',
          confirmButtonText: 'OK',
        });
        setSaving(false);
        return;
      }

      const updateData = {
        role_name: "Rider",
        first_name: formData.first_name,
        last_name: formData.last_name,
        email_address: formData.email_address,
        phone_number: formData.phone_number,
        street_address1: formData.street_address1,
        street_address2: formData.street_address2,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        restaurant_image: profileImageBase64, // Include image in update request
        latitude: formData.latitude,
        longitude: formData.longitude,
        password: "",
      };

      const response = await apiService.updateUser(parseInt(id!), updateData);

      if (response.errorCode === 0) {
        Swal.fire({
          title: "Success!",
          text: "Delivery driver information updated successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        navigate("/delivery-man-list");
      } else {
        throw new Error(response.errorMessage || "Failed to update");
      }
    } catch (error) {
      console.error("Error updating deliveryman:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update delivery driver information",
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
            onClick={() => navigate("/delivery-man-list")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to List</span>
          </button>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Edit Delivery Driver
        </h1>

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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address 1 *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  ref={addressInputRef}
                  type="text"
                  name="street_address1"
                  value={formData.street_address1}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Search for address or location"
                />
              </div>
              {(formData.latitude && formData.longitude) && (
                <p className="text-xs text-gray-500 mt-1">
                  Location: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Image *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    {profileImageFile
                      ? profileImageFile.name
                      : imagePreview
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
                    id="profile-image-upload"
                    disabled={saving}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      document.getElementById("profile-image-upload")?.click()
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
                        alt="Profile preview"
                        className="w-full h-auto max-h-64 object-contain rounded-lg border border-gray-300 bg-gray-50"
                      />
                    </div>
                  </div>
                )}
              </div>
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
              onClick={() => navigate("/delivery-man-list")}
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
