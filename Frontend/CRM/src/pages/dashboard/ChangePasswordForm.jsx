import React, { useState } from "react";
import { updatePassword } from "../../api/employeeApi";
import { toast } from "react-hot-toast";

export const ChangePasswordForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      const msg = "New password and confirm password do not match.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (formData.newPassword.length < 4) {
      const msg = "New password must be at least 4 characters long.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success("Password updated successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Update password error:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to update password. Please check your current password.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && (
        <p className="text-sm text-red-600 text-center mb-4 bg-red-50 p-2 rounded font-medium border border-red-100">
          {error}
        </p>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Current Password
          </label>
          <input
            name="currentPassword"
            type="password"
            required
            disabled={isLoading}
            placeholder="Enter current password"
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-sm"
            value={formData.currentPassword}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            New Password
          </label>
          <input
            name="newPassword"
            type="password"
            required
            disabled={isLoading}
            placeholder="Enter new password"
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-sm"
            value={formData.newPassword}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700">
            Confirm New Password
          </label>
          <input
            name="confirmPassword"
            type="password"
            required
            disabled={isLoading}
            placeholder="Confirm new password"
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 text-sm"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400 flex justify-center items-center font-semibold text-sm transition-colors shadow"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
          {onCancel && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="flex-1 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none disabled:opacity-50 font-semibold text-sm transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
