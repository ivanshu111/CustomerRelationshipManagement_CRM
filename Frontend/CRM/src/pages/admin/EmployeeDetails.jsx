import React, { useEffect, useState } from "react";
import { 
  getEmployeeById, 
  getAllCustomersOfEmployee,
  blockEmployee,
  unblockEmployee,
  softDeleteEmployee,
  approveResignation,
  rejectResignation,
  restoreEmployee
} from "../../api/adminApi";
import toast from "react-hot-toast";

export const EmployeeDetails = ({ employeeId, onUpdate }) => {
  const [employee, setEmployee] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Block form states
  const [isBlockFormOpen, setIsBlockFormOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [blockDuration, setBlockDuration] = useState(7);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = () => {
    if (employeeId) {
      setLoading(true);
      Promise.all([
        getEmployeeById(employeeId),
        getAllCustomersOfEmployee(employeeId)
      ])
        .then(([empRes, custRes]) => {
          setEmployee(empRes.data);
          setCustomers(custRes.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching employee details:", err);
          setError("Failed to load employee details.");
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [employeeId]);

  const handleApproveResignation = async () => {
    if (!window.confirm("Are you sure you want to APPROVE this resignation? This employee will be inactivated and their customers reassigned to you.")) return;
    setActionLoading(true);
    try {
      await approveResignation(employee.id);
      toast.success("Resignation approved successfully!");
      fetchDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to approve resignation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectResignation = async () => {
    if (!window.confirm("Are you sure you want to REJECT this resignation?")) return;
    setActionLoading(true);
    try {
      await rejectResignation(employee.id);
      toast.success("Resignation request rejected.");
      fetchDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject resignation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBlockEmployee = async (e) => {
    e.preventDefault();
    if (!blockReason.trim()) {
      toast.error("Please enter a reason for blocking");
      return;
    }
    setActionLoading(true);
    try {
      await blockEmployee(employee.id, {
        blockReason,
        blockDuration: parseInt(blockDuration)
      });
      toast.success("Employee blocked successfully!");
      setIsBlockFormOpen(false);
      setBlockReason("");
      fetchDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to block employee.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockEmployee = async () => {
    setActionLoading(true);
    try {
      await unblockEmployee(employee.id);
      toast.success("Employee unblocked successfully!");
      fetchDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unblock employee.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSoftDeleteEmployee = async () => {
    if (!window.confirm("Are you sure you want to soft delete this employee? They will no longer be able to login, and all of their customers will automatically be reassigned to the ADMIN account.")) return;
    setActionLoading(true);
    try {
      await softDeleteEmployee(employee.id);
      toast.success("Employee soft deleted successfully!");
      fetchDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to soft delete employee.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreEmployee = async () => {
    if (!window.confirm("Are you sure you want to restore this employee? Their status will be set back to ACTIVE.")) return;
    setActionLoading(true);
    try {
      await restoreEmployee(employee.id);
      toast.success("Employee restored successfully!");
      fetchDetails();
      if (onUpdate) onUpdate();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to restore employee.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading details...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!employee) return null;

  // Status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case "ACTIVE":
        return <span className="bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold border border-green-200">ACTIVE</span>;
      case "PENDING_RESIGNATION":
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold border border-amber-200 animate-pulse">PENDING RESIGNATION</span>;
      case "RESIGNED":
        return <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-bold border border-gray-200">RESIGNED</span>;
      case "BLOCKED":
        return <span className="bg-red-100 text-red-800 text-xs px-2.5 py-1 rounded-full font-bold border border-red-200">BLOCKED</span>;
      case "DELETED":
        return <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-1 rounded-full font-bold border border-rose-200">DELETED (SOFT)</span>;
      default:
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold">{status}</span>;
    }
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto pr-2">
      {/* Basic Info Section */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-slate-800">Basic Information</h3>
          {getStatusBadge(employee.employeeStatus)}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Name</p>
            <p className="text-sm font-medium text-slate-800">{employee.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email</p>
            <p className="text-sm font-medium text-slate-800">{employee.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Role</p>
            <p className="text-sm font-medium text-slate-800">{employee.role}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Joined Date</p>
            <p className="text-sm font-medium text-slate-800">{employee.created_at ? new Date(employee.created_at).toLocaleDateString() : "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Resignation Audit Logs */}
      {employee.employeeStatus === "PENDING_RESIGNATION" && (
        <div className="bg-amber-50/50 border border-amber-200 p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-amber-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Resignation Request Details
          </h4>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700"><strong>Reason:</strong> {employee.resignationReason}</p>
            <p className="text-gray-700"><strong>Requested Date:</strong> {employee.resignationRequestedAt ? new Date(employee.resignationRequestedAt).toLocaleString() : "N/A"}</p>
            <p className="text-gray-700"><strong>Requested Last Working Date:</strong> {employee.lastWorkingDate ? new Date(employee.lastWorkingDate).toLocaleDateString() : "N/A"}</p>
          </div>
        </div>
      )}

      {employee.employeeStatus === "RESIGNED" && (
        <div className="bg-gray-50 border border-gray-200 p-5 rounded-2xl text-sm space-y-2">
          <h4 className="text-sm font-bold text-gray-700 mb-1">Resignation Audit Details</h4>
          <p className="text-gray-600"><strong>Reason:</strong> {employee.resignationReason}</p>
          <p className="text-gray-600"><strong>Last Working Date:</strong> {employee.lastWorkingDate}</p>
          <p className="text-gray-600"><strong>Approved At:</strong> {employee.resignationApprovedAt ? new Date(employee.resignationApprovedAt).toLocaleString() : "N/A"}</p>
          <p className="text-gray-600"><strong>Approved By:</strong> {employee.resignationApprovedByEmail || "System Admin"}</p>
        </div>
      )}

      {/* Block Audit Logs */}
      {employee.employeeStatus === "BLOCKED" && (
        <div className="bg-rose-50/50 border border-rose-200 p-5 rounded-2xl">
          <h4 className="text-sm font-bold text-rose-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
            Block Audit Details
          </h4>
          <div className="space-y-2 text-sm">
            <p className="text-gray-700"><strong>Block Reason:</strong> {employee.blockedReason}</p>
            <p className="text-gray-700"><strong>Blocked At:</strong> {employee.blockedAt ? new Date(employee.blockedAt).toLocaleString() : "N/A"}</p>
            <p className="text-gray-700"><strong>Blocked Until:</strong> {employee.blockedUntil ? new Date(employee.blockedUntil).toLocaleString() : "N/A"}</p>
            
            {employee.blockRemovalRequested && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl shadow-sm">
                <p className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                  Removal of Block Requested
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  <strong>Reason:</strong> {employee.blockRemovalReason}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deleted Audit Logs */}
      {employee.employeeStatus === "DELETED" && (
        <div className="bg-rose-50/30 border border-rose-100 p-5 rounded-2xl text-sm space-y-2">
          <h4 className="text-sm font-bold text-rose-900 mb-1">Archived Soft Delete Details</h4>
          <p className="text-gray-700"><strong>Soft Deleted At:</strong> {employee.deletedAt ? new Date(employee.deletedAt).toLocaleString() : "N/A"}</p>
          <p className="text-gray-700"><strong>Deleted By:</strong> {employee.deletedByEmail || "System Admin"}</p>
        </div>
      )}

      {/* Action Buttons Section */}
      {employee.role !== "ADMIN" && employee.employeeStatus !== "RESIGNED" && (
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <h4 className="text-sm font-bold text-slate-800">Administrative Actions</h4>
          <div className="flex flex-wrap gap-3">
            {employee.employeeStatus === "DELETED" ? (
              <button
                disabled={actionLoading}
                onClick={handleRestoreEmployee}
                className="bg-emerald-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
              >
                Restore Employee
              </button>
            ) : (
              <>
                {employee.employeeStatus === "PENDING_RESIGNATION" && (
                  <>
                    <button
                      disabled={actionLoading}
                      onClick={handleApproveResignation}
                      className="bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                      Approve Resignation
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={handleRejectResignation}
                      className="bg-gray-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                      Reject Resignation
                    </button>
                  </>
                )}

                {employee.employeeStatus === "BLOCKED" ? (
                  <button
                    disabled={actionLoading}
                    onClick={handleUnblockEmployee}
                    className="bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                  >
                    Unblock Employee
                  </button>
                ) : (
                  <button
                    disabled={actionLoading || isBlockFormOpen}
                    onClick={() => setIsBlockFormOpen(true)}
                    className="bg-amber-500 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-50"
                  >
                    Block Employee
                  </button>
                )}

                <button
                  disabled={actionLoading}
                  onClick={handleSoftDeleteEmployee}
                  className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  Soft Delete Employee
                </button>
              </>
            )}
          </div>

          {/* Block Employee inline Form */}
          {isBlockFormOpen && (
            <form onSubmit={handleBlockEmployee} className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl space-y-3 mt-3">
              <h5 className="text-sm font-bold text-slate-800">Specify Block Parameters</h5>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Block Reason</label>
                <textarea
                  required
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Policy violation, under performance investigation"
                  className="block w-full text-sm border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Duration (Days)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={blockDuration}
                  onChange={(e) => setBlockDuration(e.target.value)}
                  className="block w-28 text-sm border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsBlockFormOpen(false);
                    setBlockReason("");
                  }}
                  className="text-gray-500 text-xs font-semibold px-3 py-1.5 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-amber-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Confirm Block
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Customer Associations */}
      <div className="border-t border-slate-100 pt-5">
        <h3 className="text-base font-bold text-slate-800 mb-3">
          Assigned Customers ({customers.length})
        </h3>
        {customers.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No customers currently assigned to this employee.</p>
        ) : (
          <div className="max-h-[200px] overflow-y-auto border border-gray-100 rounded-xl">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {customers.map((cust) => (
                  <tr key={cust.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 font-medium">{cust.name}</td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${cust.status === 'CLOSED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                        {cust.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
