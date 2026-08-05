import React, { useState } from "react";
import { submitResignation } from "../../api/employeeApi";
import { toast } from "react-hot-toast";

export const ResignationForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    resignationReason: "",
    lastWorkingDate: ""
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await submitResignation(formData);
      toast.success("Resignation request submitted successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Resignation request error:", err);
      const errorMessage = err.response?.data?.message || "Failed to submit resignation request.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Get tomorrow's date for min attribute
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 60);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <div className="w-full relative overflow-hidden p-1">
      {/* Abstract CRM Theme Background for Modal */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <circle cx="200" cy="200" r="120" fill="#f59e0b" fillOpacity="0.15" />
          <path d="M 50 150 L 350 250" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5" />
        </svg>
      </div>

      <div className="relative z-10">
        {error && (
          <p className="text-sm text-red-600 text-center mb-4 bg-red-50 p-2 rounded font-medium border border-red-100">
            {error}
          </p>
        )}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Resignation Reason</label>
            <textarea
              name="resignationReason"
              required
              disabled={isLoading}
              rows={4}
              placeholder="Please describe the reason for your resignation..."
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 text-sm"
              value={formData.resignationReason}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">Requested Last Working Date</label>
            <input
              name="lastWorkingDate"
              type="date"
              required
              min={minDate}
              disabled={isLoading}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 text-sm"
              value={formData.lastWorkingDate}
              onChange={handleChange}
            />
          </div>
          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 text-white bg-amber-600 rounded-md hover:bg-amber-700 focus:outline-none disabled:bg-amber-400 flex justify-center items-center font-semibold text-sm transition-colors shadow font-medium"
            >
              {isLoading ? "Submitting..." : "Submit Resignation"}
            </button>
            {onCancel && (
              <button
                type="button"
                disabled={isLoading}
                onClick={onCancel}
                className="flex-1 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none disabled:opacity-50 font-semibold text-sm transition-colors font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
