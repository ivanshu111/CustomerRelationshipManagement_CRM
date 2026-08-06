import React, { useState } from "react";
import { registerUser } from "../../api/authApi";
import { toast } from "react-hot-toast";

export const RegisterForm = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "EMPLOYEE"
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
    console.log("Submitting registration data:", formData);
    try {
      const response = await registerUser(formData);
      console.log("Registration successful:", response.data);
      toast.success(`Employee ${formData.name} registered successfully!`);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.message || "Registration failed. Please check if you have Admin permissions.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full relative overflow-hidden p-1">
      {/* Abstract CRM Theme Background for Modal */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="#4f46e5" fillOpacity="0.2" />
          <circle cx="350" cy="80" r="60" fill="#4f46e5" fillOpacity="0.1" />
          <circle cx="100" cy="350" r="50" fill="#4f46e5" fillOpacity="0.15" />
          
          {/* Connection Lines */}
          <line x1="50" y1="50" x2="350" y2="80" stroke="#4f46e5" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="50" y1="50" x2="100" y2="350" stroke="#4f46e5" strokeWidth="2" strokeDasharray="5,5" />
          <line x1="350" y1="80" x2="100" y2="350" stroke="#4f46e5" strokeWidth="2" strokeDasharray="5,5" />
          
          {/* Nodes */}
          <circle cx="50" cy="50" r="5" fill="#4f46e5" />
          <circle cx="350" cy="80" r="5" fill="#4f46e5" />
          <circle cx="100" cy="350" r="5" fill="#4f46e5" />
          <circle cx="250" cy="200" r="8" fill="#4f46e5" className="animate-pulse" />
        </svg>
      </div>

      <div className="relative z-10">
        {error && <p className="text-sm text-red-600 text-center mb-4 bg-red-50 p-2 rounded font-medium border border-red-100">{error}</p>}
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
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            name="password"
            type="password"
            required
            disabled={isLoading}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <select
            name="role"
            disabled={isLoading}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
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
                Registering...
              </>
            ) : "Register Employee"}
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
    </div>
  );
};
