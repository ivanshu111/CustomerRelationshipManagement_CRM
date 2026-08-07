import React from "react";
import { useNavigate } from "react-router-dom";
import { AddCustomerForm } from "./AddCustomerForm";

export const AddCustomer = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/dashboard");
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800">Add New Customer</h2>
        <AddCustomerForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </div>
  );
};
