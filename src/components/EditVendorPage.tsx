import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ArrowLeft, Save, Loader } from "lucide-react";
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
  description: string;
}

export default function EditVendorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    description: "",
  });

  useEffect(() => {
    if (id) {
      loadVendorData(parseInt(id));
    }
  }, [id]);

  const loadVendorData = async (userId: number) => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();

      if (response.errorCode === 0 && response.data) {
        const vendor = response.data.find(
          (user) => user.id === userId && user.role_name === "Vendor"
        );

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
            description: vendor.description || "",
          });
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
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
        description: formData.description,
        password: "",
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

            <div className="md:col-span-2">
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
                Street Address 1
              </label>
              <input
                type="text"
                name="street_address1"
                value={formData.street_address1}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
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
