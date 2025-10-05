import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  Search,
  Plus,
  Eye,
  CreditCard as Edit,
  Trash2,
  Filter,
  Download,
  User,
  Phone,
  Mail,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Loader,
  RefreshCw,
} from "lucide-react";
import { apiService, User as ApiUser } from "../services/api";
import { useNavigate } from "react-router-dom";

interface DeliverymanData {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  joiningDate: string;
  totalOrders: number;
  ongoing: number;
  cancelled: number;
  completed: number;
  payedAmount: number;
  pendingAmount: number;
  status: "active" | "inactive";
  avatar?: string;
}

export default function DeliverymanListPage() {
  const navigate = useNavigate();
  const [deliverymen, setDeliverymen] = useState<DeliverymanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    loadDeliverymen();
  }, []);

  const loadDeliverymen = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getUsers();

      if (response.errorCode === 0 && response.data) {
        // Filter only users with role 'driver'
        const drivers = response.data.filter(
          (user) => user.role_name === "Rider"
        );

        // Map API data to component format
        const mappedDrivers: DeliverymanData[] = drivers.map((driver) => ({
          id: driver.id,
          name: `${driver.first_name} ${driver.last_name}`,
          email: driver.email_address,
          phone: driver.phone_number,
          address: `${driver.street_address1}${
            driver.street_address2 ? ", " + driver.street_address2 : ""
          }, ${driver.city}, ${driver.state} ${driver.zip_code}`,
          joiningDate: driver.created_at
            ? new Date(driver.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
            : "N/A",
          totalOrders: 0, // These would come from order statistics API
          ongoing: 0,
          cancelled: 0,
          completed: 0,
          payedAmount: 0,
          pendingAmount: 0,
          status: driver.is_active !== false ? "active" : "inactive",
        }));

        setDeliverymen(mappedDrivers);
      } else {
        setError(response.errorMessage || "Failed to load delivery drivers");
      }
    } catch (error) {
      console.error("Error loading delivery drivers:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to load delivery drivers",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (
    driverId: number,
    currentStatus: "active" | "inactive"
  ) => {
    try {
      setIsUpdatingStatus(driverId);
      const newStatus = currentStatus === "active" ? false : true;

      await apiService.updateUserStatus(driverId, newStatus);

      // Update local state
      setDeliverymen((prev) =>
        prev.map((driver) =>
          driver.id === driverId
            ? { ...driver, status: newStatus ? "active" : "inactive" }
            : driver
        )
      );
    } catch (error) {
      console.error("Error updating driver status:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update driver status",
      });
    } finally {
      setIsUpdatingStatus(null);
    }
  };

  const handleDeleteDriver = async (driverId: number) => {
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
      await apiService.deleteUser(driverId);
      setDeliverymen((prev) => prev.filter((driver) => driver.id !== driverId));
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Delivery driver has been deleted.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error deleting driver:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete driver",
      });
    }
  };

  const handleRefresh = () => {
    loadDeliverymen();
  };

  const handleExport = () => {
    const csvHeaders = [
      "SL",
      "Name",
      "Email",
      "Phone",
      "Address",
      "Joining Date",
      "Total Orders",
      "Status",
    ];

    const csvRows = filteredDeliverymen.map((driver, index) => [
      index + 1,
      driver.name,
      driver.email,
      driver.phone,
      driver.address.replace(/,/g, ";"),
      driver.joiningDate,
      driver.totalOrders,
      driver.status,
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `delivery-drivers-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    Swal.fire({
      icon: "success",
      title: "Exported!",
      text: "Delivery drivers list has been exported successfully.",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const filteredDeliverymen = deliverymen.filter((deliveryman) => {
    const matchesSearch =
      deliveryman.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deliveryman.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deliveryman.phone.includes(searchTerm);
    const matchesStatus =
      statusFilter === "All" ||
      deliveryman.status === statusFilter.toLowerCase();
    const matchesDate =
      !joiningDate || deliveryman.joiningDate.includes(joiningDate);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalDeliverymen = deliverymen.length;
  const activeDeliverymen = deliverymen.filter(
    (d) => d.status === "active"
  ).length;
  const inactiveDeliverymen = deliverymen.filter(
    (d) => d.status === "inactive"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
              🚚 Deliveryman List
            </h1>
            <p className="text-gray-600">Manage your delivery team</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => navigate("/add-new-delivery-man")}
              className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Deliveryman</span>
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

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deliveryman Joining Date
            </label>
            <input
              type="date"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Select Date"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Deliveryman Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setJoiningDate("");
                setStatusFilter("All");
              }}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors mr-2"
            >
              Clear
            </button>
            <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors">
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {totalDeliverymen}
              </p>
              <p className="text-sm text-blue-700">Total Deliveryman</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {activeDeliverymen}
              </p>
              <p className="text-sm text-green-700">Active Deliveryman</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-600">
                {inactiveDeliverymen}
              </p>
              <p className="text-sm text-red-700">Inactive Deliveryman</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            Loading Delivery Drivers
          </h3>
          <p className="text-gray-600">
            Please wait while we fetch the delivery team...
          </p>
        </div>
      )}

      {/* Search and Actions */}
      {!loading && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Deliveryman List
              </h3>
              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm font-medium">
                {filteredDeliverymen.length}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name or email or phone"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-80"
                />
              </div>
              <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                Search
              </button>
              <button
                onClick={handleExport}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Table */}
          {deliverymen.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joining Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Orders
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDeliverymen.map((deliveryman, index) => (
                    <tr key={deliveryman.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {deliveryman.avatar ? (
                              <img
                                src={deliveryman.avatar}
                                alt={deliveryman.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {deliveryman.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="flex items-center space-x-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span>{deliveryman.email}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Phone className="w-3 h-3 text-gray-400" />
                            <span>{deliveryman.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        <div className="truncate" title={deliveryman.address}>
                          {deliveryman.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deliveryman.joiningDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                        {deliveryman.totalOrders}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            handleStatusToggle(
                              deliveryman.id,
                              deliveryman.status
                            )
                          }
                          disabled={isUpdatingStatus === deliveryman.id}
                          className="flex items-center disabled:opacity-50"
                        >
                          {isUpdatingStatus === deliveryman.id ? (
                            <Loader className="w-6 h-6 text-gray-400 animate-spin" />
                          ) : deliveryman.status === "active" ? (
                            <ToggleRight className="w-8 h-8 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-8 h-8 text-gray-400" />
                          )}
                        </button>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              navigate(`/delivery-man-list/${deliveryman.id}`)
                            }
                            className="text-blue-600 hover:text-blue-800 p-1 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/delivery-man-list/edit/${deliveryman.id}`
                              )
                            }
                            className="text-green-600 hover:text-green-800 p-1 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDriver(deliveryman.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded"
                            title="Delete"
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
          ) : (
            !loading && (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  No Delivery Drivers Found
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || statusFilter !== "All" || joiningDate
                    ? "No drivers match your current filters."
                    : "Get started by adding your first delivery driver."}
                </p>
                {!searchTerm && statusFilter === "All" && !joiningDate && (
                  <button
                    onClick={() => navigate("/add-new-delivery-man")}
                    className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Your First Driver</span>
                  </button>
                )}
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
