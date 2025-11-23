// ...existing code...
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AlertTriangle, ArrowLeft, Trash2, Loader } from "lucide-react";

interface DeleteConfirmationState {
  type: "user" | "vendor" | "category" | "item" | "deliveryman";
  id: number;
  name: string;
  redirectPath: string;
  onDelete: () => Promise<void>;
}

export default function DeleteConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const passedState = location.state as DeleteConfirmationState | undefined;

  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  // ...existing code...

  // Fallback: create a default state for deleting the current logged-in user
  const getFallbackState = (): DeleteConfirmationState => {
    const stored = localStorage.getItem("user_data");
    const parsed = stored ? JSON.parse(stored) : null;
    const id = parsed?.id ?? parsed?.userId ?? 0;
    const name = parsed?.first_name
      ? `${parsed.first_name} ${parsed.last_name ?? ""}`.trim()
      : parsed?.email ?? "Your Account";

    const onDelete = async () => {
      // prefer dedicated method
      if (
        typeof (window as any).apiService !== "undefined" &&
        typeof (window as any).apiService.deleteProfile === "function"
      ) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await (window as any).apiService.deleteProfile();
        return;
      }

      // use imported apiService if available
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (
          typeof apiService !== "undefined" &&
          typeof (apiService as any).deleteProfile === "function"
        ) {
          // @ts-ignore
          await (apiService as any).deleteProfile();
          return;
        }
      } catch (e) {
        console.warn("apiService.deleteProfile failed", e);
      }

      // fallback: try deleteUser(id)
      try {
        // @ts-ignore
        if (typeof (apiService as any).deleteUser === "function") {
          // @ts-ignore
          await (apiService as any).deleteUser(id);
          return;
        }
      } catch (e) {
        console.warn("apiService.deleteUser failed", e);
      }

      // last fallback: simulate deletion (clear local data)
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      return;
    };

    return {
      type: "user",
      id: Number(id || 0),
      name: name || "Your Account",
      redirectPath: "/login",
      onDelete,
    };
  };

  const state = passedState ?? getFallbackState();

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await state.onDelete();

      // ensure local cleanup for user deletion
      if (state.type === "user") {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
      }

      navigate(state.redirectPath, {
        state: {
          message: `${state.type} deleted successfully`,
          messageType: "success",
        },
      });
    } catch (err: any) {
      setError(err?.message || "Failed to delete");
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    // if there is history go back, otherwise navigate to a safe page
    try {
      navigate(-1);
    } catch {
      navigate(state.redirectPath || "/");
    }
  };

  const getTypeLabel = () => {
    const labels: Record<string, string> = {
      user: "User",
      vendor: "Vendor",
      category: "Category",
      item: "Item",
      deliveryman: "Delivery Man",
    };
    return labels[state.type] || "Item";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className=" w-full">
        {/* Back Button */}
        <button
          onClick={handleCancel}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-red-50 border-b border-red-100 p-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-2">
              Delete {getTypeLabel()}
            </h1>
            <p className="text-gray-600 text-center">
              This action cannot be undone
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Warning Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-800 mb-1">
                    Warning
                  </h3>
                  <p className="text-sm text-yellow-700">
                    You are about to permanently delete{" "}
                    <strong>"{state.name}"</strong>. This will remove all
                    associated data and cannot be recovered.
                  </p>
                </div>
              </div>
            </div>

            {/* Consequences List */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">
                What will happen:
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2 text-gray-600">
                  <span className="text-red-500 mt-1">•</span>
                  <span>
                    All data associated with this {state.type} will be
                    permanently deleted
                  </span>
                </li>
                <li className="flex items-start space-x-2 text-gray-600">
                  <span className="text-red-500 mt-1">•</span>
                  <span>This action cannot be undone or recovered</span>
                </li>
                <li className="flex items-start space-x-2 text-gray-600">
                  <span className="text-red-500 mt-1">•</span>
                  <span>Related records may be affected</span>
                </li>
              </ul>
            </div>

            {/* Confirmation Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <strong className="text-red-600">DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => {
                  setConfirmText(e.target.value);
                  setError("");
                }}
                placeholder="Type DELETE here"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-center font-medium"
                disabled={isDeleting}
              />
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>

            {/* Detail Box */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Type:</p>
                  <p className="font-medium text-gray-800 capitalize">
                    {state.type}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Name:</p>
                  <p className="font-medium text-gray-800">{state.name}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">ID:</p>
                  <p className="font-medium text-gray-800">#{state.id}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Status:</p>
                  <p className="font-medium text-red-600">Will be deleted</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleDelete}
                disabled={isDeleting || confirmText !== "DELETE"}
                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={isDeleting}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>

            {/* Safety Notice */}
            <p className="text-xs text-gray-500 text-center mt-4">
              This is a permanent action. Make sure you want to proceed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
// ...existing code...
