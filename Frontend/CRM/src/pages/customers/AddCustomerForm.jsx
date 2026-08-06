import React, { useState, useContext, useEffect } from "react";
import { addCustomer } from "../../api/employeeApi";
import { getAllEmployees } from "../../api/adminApi";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

export const AddCustomerForm = ({ onSuccess, onCancel }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    assignedToUserId: ""
  });
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (isAdmin) {
      getAllEmployees()
        .then((res) => {
          setEmployees(res.data);
        })
        .catch((err) => {
          console.error("Failed to load employees for assignment", err);
        });
    }
  }, [isAdmin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const submitData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    };

    if (isAdmin) {
      if (!formData.assignedToUserId) {
        setError("Please select an employee to assign this customer to");
        setIsLoading(false);
        return;
      }
      submitData.assignedToUserId = parseInt(formData.assignedToUserId);
    }

    console.log("Submitting customer data:", submitData);
    try {
      const response = await addCustomer(submitData);
      console.log("Customer added successfully:", response.data);
      toast.success(`Customer ${formData.name} added successfully!`);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Add customer error:", err);
      const errorMessage = err.response?.data?.message || "Failed to add customer. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {error && <p className="text-sm text-red-600 text-center mb-4 bg-red-50 p-2 rounded font-medium">{error}</p>}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            name="name"
            type="text"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email Address</label>
          <input
            name="email"
            type="email"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            name="phone"
            type="text"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Assign To Employee</label>
            <select
              name="assignedToUserId"
              required
              disabled={isLoading}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 font-medium"
              value={formData.assignedToUserId}
              onChange={handleChange}
            >
              <option value="">Choose Employee...</option>
              {employees
                .filter(emp => emp.employeeStatus === "ACTIVE")
                .map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} (ID: {emp.id})
                  </option>
                ))}
            </select>
          </div>
        )}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400 flex justify-center items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : "Add Customer"}
          </button>
          {onCancel && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onCancel}
              className="flex-1 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
