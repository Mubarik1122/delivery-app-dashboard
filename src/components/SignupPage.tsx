import React, { useState } from "react";
import { Eye, EyeOff, Mail, Lock, User, Phone, Utensils, Upload, Image as ImageIcon } from "lucide-react";
import { apiService, CreateUserRequest } from "../services/api";
import Swal from "sweetalert2";

interface SignupPageProps {
  onSignup: () => void;
  onSwitchToLogin: () => void;
  onRoleSelect: (role: "admin" | "vendor" | "rider") => void;
}

export default function SignupPage({
  onSignup,
  onSwitchToLogin,
  onRoleSelect,
}: SignupPageProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "vendor" as "admin" | "vendor" | "rider",
    restaurantImage: null as File | null,
    is_food: false,
    is_grocery: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    if (formData.role === "vendor") {
      if (!formData.is_food && !formData.is_grocery) {
        setError("Please select at least one business type (Food Restaurant or Grocery)");
        return;
      }
      if (!formData.restaurantImage) {
        setError("Please upload a business image for vendor account");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let restaurantImageBase64: string | undefined;

      // Convert image to base64 if vendor/rider role and image is uploaded
      if ((formData.role === "vendor" || formData.role === "rider") && formData.restaurantImage) {
        restaurantImageBase64 = await convertImageToBase64(formData.restaurantImage);
        
        // Ensure image was converted successfully
        if (!restaurantImageBase64) {
          setError("Failed to process image. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }

      // Ensure image is converted and available for vendor/rider
      if ((formData.role === "vendor" || formData.role === "rider") && !restaurantImageBase64) {
        setError("Failed to process image. Please upload the image again.");
        setIsSubmitting(false);
        return;
      }

      // Map role to API role_name
      let roleName: string;
      if (formData.role === "admin") {
        roleName = "Admin";
      } else if (formData.role === "rider") {
        roleName = "Rider";
      } else {
        roleName = "Vendor";
      }

      const requestData: CreateUserRequest = {
        role_name: roleName,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone_number: formData.phone.trim(),
        email_address: formData.email.trim(),
        street_address1: "", // These fields might need to be added to the form
        city: "",
        state: "",
        zip_code: "",
        password: formData.password,
        restaurant_image: (formData.role === "vendor" || formData.role === "rider") ? restaurantImageBase64 : undefined, // Send image for vendor and rider
        is_food: formData.role === "vendor" ? formData.is_food : undefined,
        is_grocery: formData.role === "vendor" ? formData.is_grocery : undefined,
      };
      
      // Final verification that image is included in request
      if (formData.role === "vendor" || formData.role === "rider") {
        if (!requestData.restaurant_image || requestData.restaurant_image.length === 0) {
          setError("Image is required and must be processed. Please upload the image again.");
          setIsSubmitting(false);
          return;
        }
      }

      const response = await apiService.createUser(requestData);

      if (response && response.errorCode === 0) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Account created successfully",
          timer: 2000,
          showConfirmButton: false,
        });
        onRoleSelect(formData.role);
        onSignup();
      } else {
        setError(response?.errorMessage || "Failed to create account");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response?.errorMessage || "Failed to create account",
        });
      }
    } catch (error) {
      console.error("Error creating account:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create account";
      setError(errorMessage);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError("");
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

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Food Image and Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-50 to-red-50 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)",
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center text-center p-12 text-white">
          <div className="flex items-center space-x-3 mb-8">
            <img src="\image\logo\logo_main_bg.png" alt="logo"></img>
          </div>

          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-4">
              Your
              <br />
              <span className="text-red-400">Kitchen</span>
              <br />
              Your Food....
            </h1>
            <p className="text-xl text-gray-200">
              Manage your restaurant business with our comprehensive food
              management system
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                <Utensils className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-bold text-gray-800">eFood</span>
            </div>
          </div>

          {/* Header */}
          <div className="text-center lg:text-right mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Create Account
            </h2>
            <p className="text-gray-600 mb-4">Join eFood Platform</p>
            <div className="text-sm text-gray-500">
              Want To Create Admin Account?
              <button
                onClick={() => handleInputChange("role", "admin")}
                className={`ml-1 font-medium ${
                  formData.role === "admin"
                    ? "text-red-600"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                Admin Signup
              </button>
              <span className="mx-2">|</span>
              <button
                onClick={() => handleInputChange("role", "vendor")}
                className={`font-medium ${
                  formData.role === "vendor"
                    ? "text-red-600"
                    : "text-blue-600 hover:text-blue-700"
                }`}
              >
                Vendor Signup
              </button>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange("role", "admin")}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.role === "admin"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold">Admin</div>
                    <div className="text-xs">Platform Administrator</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("role", "vendor")}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.role === "vendor"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg font-semibold">Vendor</div>
                    <div className="text-xs">Restaurant Owner</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="John"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Create a strong password"
                  required
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

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleInputChange("confirmPassword", e.target.value)
                  }
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="Confirm your password"
                  required
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

            {/* Profile Image Upload - For Vendor and Rider */}
            {(formData.role === "vendor" || formData.role === "rider") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {formData.role === "vendor" ? "Business Image *" : "Profile Image *"}
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
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500 mt-1"
                required
              />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <button
                  type="button"
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  className="text-red-600 hover:text-red-700 font-medium"
                >
                  Privacy Policy
                </button>
              </span>
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-medium hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{" "}
            </span>
            <button
              onClick={onSwitchToLogin}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
