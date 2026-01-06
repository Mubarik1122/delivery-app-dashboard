import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Loader,
  CreditCard as Edit,
  FileText,
  Download,
  Image as ImageIcon,
  FileCheck,
  Award,
  Badge,
  Eye,
} from "lucide-react";
import { apiService } from "../services/api";

interface DeliverymanDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  street_address1: string;
  street_address2?: string;
  city: string;
  state: string;
  zip_code: string;
  joiningDate: string;
  status: "active" | "inactive";
  profileImage?: string;
  agreement_docs?: string;
  certificate_doc?: string;
  driver_licence_doc?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export default function DeliverymanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deliveryman, setDeliveryman] = useState<DeliverymanDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDeliverymanDetails(parseInt(id));
    }
  }, [id]);

  const loadDeliverymanDetails = async (userId: number) => {
    try {
      setLoading(true);
      // Call API with role=Rider and user_id
      const response = await apiService.getUsers('Rider', userId);

      if (response.errorCode === 0 && response.data) {
        // API will return the specific rider directly
        const driver = Array.isArray(response.data) ? response.data[0] : response.data;

        if (driver && driver.role_name === "Rider") {
          const mappedDriver: DeliverymanDetails = {
            id: driver.id,
            name: `${driver.first_name} ${driver.last_name}`,
            email: driver.email_address,
            phone: driver.phone_number,
            street_address1: driver.street_address1,
            street_address2: driver.street_address2 || "",
            city: driver.city,
            state: driver.state,
            zip_code: driver.zip_code,
            address: `${driver.street_address1}${
              driver.street_address2 ? ", " + driver.street_address2 : ""
            }, ${driver.city}, ${driver.state} ${driver.zip_code}`,
            joiningDate: driver.created_at
              ? new Date(driver.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "2-digit",
                })
              : "N/A",
            status: driver.is_active !== false ? "active" : "inactive",
            profileImage: driver.restaurant_image,
            agreement_docs: driver.agreement_docs,
            certificate_doc: driver.certificate_doc,
            driver_licence_doc: driver.driver_licence_doc,
            description: driver.description,
            latitude: driver.latitude,
            longitude: driver.longitude,
          };
          setDeliveryman(mappedDriver);
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
      console.error("Error loading deliveryman details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load delivery driver details",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    );
  }

  if (!deliveryman) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Delivery driver not found</p>
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
          <button
            onClick={() =>
              navigate(`/delivery-man-list/edit/${deliveryman.id}`)
            }
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>

        <div className="flex items-start space-x-6 mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-100">
            {deliveryman.profileImage ? (
              <img
                src={deliveryman.profileImage}
                alt={deliveryman.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-500" />
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {deliveryman.name}
            </h1>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                deliveryman.status === "active"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {deliveryman.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-7 shadow-sm">
            <div className="flex items-center space-x-3 mb-7 pb-5 border-b border-gray-200">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-gray-700" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 flex-shrink-0 mt-0.5">
                  <Mail className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Email Address</p>
                  <p className="text-gray-900 font-semibold text-[15px] leading-snug break-all">{deliveryman.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 flex-shrink-0 mt-0.5">
                  <Phone className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Phone Number</p>
                  <p className="text-gray-900 font-semibold text-[15px] leading-snug">{deliveryman.phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Full Address</p>
                  <div className="space-y-1.5">
                    <p className="text-gray-900 font-semibold text-[15px] leading-snug">{deliveryman.street_address1}</p>
                    {deliveryman.street_address2 && (
                      <p className="text-gray-600 text-sm leading-snug">{deliveryman.street_address2}</p>
                    )}
                    <p className="text-gray-600 text-sm leading-snug font-medium">
                      {deliveryman.city}, {deliveryman.state} {deliveryman.zip_code}
                    </p>
                    {deliveryman.latitude && deliveryman.longitude && (
                      <p className="text-gray-400 text-xs mt-2.5 font-mono">
                        Location: {deliveryman.latitude}, {deliveryman.longitude}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-200 flex-shrink-0 mt-0.5">
                  <Calendar className="w-5 h-5 text-gray-700" />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Join Date</p>
                  <p className="text-gray-900 font-semibold text-[15px] leading-snug">
                    {deliveryman.joiningDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
              <FileText className="w-6 h-6 text-red-500" />
              <span>Documents & Certificates</span>
            </h2>
            
            <div className="grid grid-cols-1 gap-4">
              {deliveryman.agreement_docs && (
                <div className="group relative bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:border-blue-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <FileCheck className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-800 mb-1">Agreement Document</p>
                        <p className="text-xs text-gray-600">Legal agreement and terms</p>
                      </div>
                    </div>
                    <a
                      href={deliveryman.agreement_docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">View</span>
                    </a>
                  </div>
                </div>
              )}

              {deliveryman.certificate_doc && (
                <div className="group relative bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:border-green-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-800 mb-1">Certificate Document</p>
                        <p className="text-xs text-gray-600">Professional certification</p>
                      </div>
                    </div>
                    <a
                      href={deliveryman.certificate_doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors shadow-md hover:shadow-lg"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">View</span>
                    </a>
                  </div>
                </div>
              )}

              {deliveryman.driver_licence_doc && (
                <div className="group relative bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:border-purple-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                        <Badge className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-800 mb-1">Driver License Document</p>
                        <p className="text-xs text-gray-600">Valid driving license</p>
                      </div>
                    </div>
                    <a
                      href={deliveryman.driver_licence_doc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors shadow-md hover:shadow-lg"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="text-sm font-medium">View</span>
                    </a>
                  </div>
                </div>
              )}

              {!deliveryman.agreement_docs && !deliveryman.certificate_doc && !deliveryman.driver_licence_doc && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-base font-medium text-gray-600 mb-1">No Documents Available</p>
                  <p className="text-sm text-gray-500">Documents will appear here once uploaded</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
