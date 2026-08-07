import React, { useState } from "react";
import { createInteraction } from "../../api/employeeApi";

export const AddInteractionForm = ({ customerId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    customerId: customerId,
    notes: "",
    status: "CONTACTED",
    nextFollowUpDate: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await createInteraction(formData);
      onSuccess();
    } catch (err) {
      console.error("Error creating interaction:", err);
      setError("Failed to create interaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          required
          value={formData.notes}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          rows="3"
        ></textarea>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="NEW">NEW</option>
            <option value="CONTACTED">CONTACTED</option>
            <option value="INTERESTED">INTERESTED</option>
            <option value="NOT_INTERESTED">NOT_INTERESTED</option>
            <option value="CLOSED">CLOSED</option>
            <option value="PENDING">PENDING</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Next Follow-up</label>
          <input
            type="date"
            name="nextFollowUpDate" 
            min={minDate}
            value={formData.nextFollowUpDate}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {loading ? "Saving..." : "Save Interaction"}
        </button>
      </div>
    </form>
  );
};
