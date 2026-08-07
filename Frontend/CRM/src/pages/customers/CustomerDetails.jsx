import React, { useEffect, useState, useContext } from "react";
import { getCustomerById, getCustomerInteractions, updateCustomer } from "../../api/employeeApi";
import { AddInteractionForm } from "./AddInteractionForm";
import { EditCustomerForm } from "./EditCustomerForm";
import { getAllEmployees } from "../../api/adminApi";
import { AuthContext } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

export const CustomerDetails = ({ customerId, onUpdate }) => {
  const { user } = useContext(AuthContext);
  const [customer, setCustomer] = useState(null);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Reassignment states
  const [employees, setEmployees] = useState([]);
  const [reassignUserId, setReassignUserId] = useState("");
  const [isReassigning, setIsReassigning] = useState(false);

  const isAdmin = user?.role === "ADMIN";

  useEffect(() => {
    if (isAdmin) {
      getAllEmployees()
        .then((res) => {
          setEmployees(res.data);
        })
        .catch((err) => {
          console.error("Failed to load employees for reassignment", err);
        });
    }
  }, [isAdmin]);

  const handleQuickReassign = async (empId) => {
    if (!empId) return;
    const selectedEmp = employees.find(e => e.id === parseInt(empId));
    if (!selectedEmp) return;
    
    if (!window.confirm(`Are you sure you want to reassign this customer to employee ${selectedEmp.name}?`)) {
      setReassignUserId("");
      return;
    }
    
    setIsReassigning(true);
    try {
      await updateCustomer(customerId, {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        assignedToUserId: parseInt(empId)
      });
      toast.success(`Customer successfully reassigned to ${selectedEmp.name}!`);
      fetchCustomerData();
      if (onUpdate){
        console.log("on update called");
        onUpdate();
      } 
    } catch (err) {
      console.error("Reassignment error:", err);
      toast.error(err.response?.data?.message || "Failed to reassign customer.");
    } finally {
      setIsReassigning(false);
      setReassignUserId("");
    }
  };

  const fetchCustomerData = () => {
    if (customerId) {
      setLoading(true);
      Promise.all([
        getCustomerById(customerId),
        getCustomerInteractions(customerId)
      ])
        .then(([custRes, interRes]) => {
          setCustomer(custRes.data);
          setInteractions(interRes.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching customer details:", err);
          setError("Failed to load customer details.");
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchCustomerData();
    setIsEditing(false); // Reset editing state when customer changes
  }, [customerId]);

  const handleInteractionSuccess = () => {
    setShowAddInteraction(false);
    fetchCustomerData();
    if (onUpdate) onUpdate();
  };

  const handleEditSuccess = () => {
    setIsEditing(false);
    fetchCustomerData();
    if (onUpdate) onUpdate();
  };

  if (loading) return <div className="p-4 text-center">Loading details...</div>;
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;
  if (!customer) return null;

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Customer Information</h3>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="bg-white p-4 rounded border border-gray-200">
            <EditCustomerForm
              customer={customer}
              onSuccess={handleEditSuccess}
              onCancel={() => setIsEditing(false)}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="text-base font-medium">{customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-base font-medium">{customer.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-base font-medium">{customer.phone}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Current Status</p>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${customer.status === 'CLOSED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {customer.status}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-500 font-semibold mb-1">Assigned Agent</p>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full shadow-sm">
                  {customer.assignedToName || "System / Unassigned"}
                </span>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Quick Reassign:</span>
                    <select
                      value={reassignUserId}
                      onChange={(e) => handleQuickReassign(e.target.value)}
                      disabled={isReassigning}
                      className="text-xs font-semibold text-gray-700 border border-gray-300 rounded-xl p-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white cursor-pointer shadow-sm"
                    >
                      <option value="">Choose Employee...</option>
                      {employees
                      .filter((emp) => emp.employeeStatus === "ACTIVE")
                      .map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Interactions ({interactions.length})</h3>
          {!showAddInteraction && (
            <button
              onClick={() => setShowAddInteraction(true)}
              className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
            >
              Add Interaction
            </button>
          )}
        </div>

        {showAddInteraction && (
          <div className="mb-6 p-4 border border-indigo-100 rounded-lg bg-indigo-50">
            <h4 className="text-md font-medium text-indigo-900 mb-3">New Interaction</h4>
            <AddInteractionForm
              customerId={customerId}
              onSuccess={handleInteractionSuccess}
              onCancel={() => setShowAddInteraction(false)}
            />
          </div>
        )}

        {interactions.length === 0 ? (
          <p className="text-gray-500 italic">No interactions recorded yet.</p>
        ) : (
          <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
            {interactions.sort((a,b) => new Date(b.interactionDate) - new Date(a.interactionDate)).map((inter) => (
              <div key={inter.id} className="border-l-4 border-indigo-300 pl-4 py-2 bg-white shadow-sm rounded-r-lg">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{new Date(inter.interactionDate).toLocaleString()}</span>
                  <span className="font-semibold uppercase">{inter.status}</span>
                </div>
                <p className="text-sm text-gray-800">{inter.notes}</p>
                {inter.nextFollowUpDate && (
                  <p className="text-xs text-indigo-600 mt-1">
                    Next follow-up: {new Date(inter.nextFollowUpDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
