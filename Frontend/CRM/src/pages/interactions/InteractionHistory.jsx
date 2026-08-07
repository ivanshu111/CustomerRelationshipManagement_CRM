import React, { useEffect, useState } from "react";
import { getCustomerInteractions } from "../../api/employeeApi";

export const InteractionHistory = ({ customerId }) => {
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (customerId) {
      setLoading(true);
      getCustomerInteractions(customerId)
        .then((res) => {
          setInteractions(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching interactions:", err);
          setError("Failed to load interaction history.");
          setLoading(false);
        });
    }
  }, [customerId]);

  if (loading)
    return (
      <div className="p-4 text-center text-gray-500 italic">
        Loading interactions...
      </div>
    );
  if (error) return <div className="p-4 text-center text-red-500">{error}</div>;

  if (interactions.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No interaction history found for this customer.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        Showing {interactions.length} interaction(s) for this customer.
      </p>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {interactions
          .sort(
            (a, b) => new Date(b.interactionDate) - new Date(a.interactionDate),
          )
          .map((inter) => (
            <div
              key={inter.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
            >
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <span className="text-xs font-semibold text-indigo-600 uppercase">
                  {inter.status}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(inter.interactionDate).toLocaleString()}
                </span>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {inter.notes}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] uppercase text-gray-400 font-bold">
                      Recorded By
                    </p>
                    <p className="text-xs font-medium text-gray-700">
                      {inter.employee?.name || "System"}
                    </p>
                  </div>
                  {inter.nextFollowUpDate && (
                    <div>
                      <p className="text-[10px] uppercase text-gray-400 font-bold">
                        Next Follow-up
                      </p>
                      <p className="text-xs font-medium text-indigo-600">
                        {new Date(inter.nextFollowUpDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
