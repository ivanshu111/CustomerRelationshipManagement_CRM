import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { RegisterForm } from "./RegisterForm";

export const Register = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center text-gray-800">Register</h2>
        <RegisterForm onSuccess={handleSuccess} />
        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};
