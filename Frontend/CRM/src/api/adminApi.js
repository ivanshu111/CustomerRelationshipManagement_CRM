import api from "./axios";

export const getAllEmployees = () => {
  return api.get("/api/admin/employees");
};

export const getEmployeeById = (id) => {
  return api.get(`/api/admin/employees/${id}`);
};

export const getAllCustomersOfEmployee = (id) => {
  return api.get(`/api/admin/employee/${id}/customers`);
};

export const getAllCustomers = (params) => {
  return api.get("/api/admin/customers", { params });
};

export const getAllInteractions = () => {
  return api.get("/api/admin/interactions");
};

export const getLeadsCount = () => {
  return api.get("/api/admin/leads/count");
};

export const getClosedLeadsCount = () => {
  return api.get("/api/admin/leads/closed");
};

export const getConversionRate = () => {
  return api.get("/api/admin/analytics/conversion-rate");
};

export const getBestEmployee = () => {
  return api.get("/api/admin/analytics/best-employee");
};

export const getCustomerCount = (employeeId) => {
  const url = employeeId ? `/api/dashboard/customers/count?employeeId=${employeeId}` : "/api/dashboard/customers/count";
  return api.get(url);
};

// Resignation management
export const getResignationRequests = () => {
  return api.get("/api/admin/employees/resignations");
};

export const approveResignation = (id) => {
  return api.put(`/api/admin/employees/${id}/approve-resignation`);
};

export const rejectResignation = (id) => {
  return api.put(`/api/admin/employees/${id}/reject-resignation`);
};

// Block/Unblock management
export const blockEmployee = (id, data) => {
  return api.put(`/api/admin/employees/${id}/block`, data);
};

export const unblockEmployee = (id) => {
  return api.put(`/api/admin/employees/${id}/unblock`);
};

export const getBlockedEmployees = () => {
  return api.get("/api/admin/employees/blocked");
};

// Soft delete management
export const softDeleteEmployee = (id) => {
  return api.delete(`/api/admin/employees/${id}`);
};

export const getDeletedEmployees = () => {
  return api.get("/api/admin/employees/deleted");
};

export const restoreEmployee = (id) => {
  return api.put(`/api/admin/employees/${id}/restore`);
};

// Access Requests management
export const getPendingAccessRequests = () => {
  return api.get("/api/admin/access-requests");
};

export const approveAccessRequest = (id) => {
  return api.post(`/api/admin/access-requests/${id}/approve`);
};

export const rejectAccessRequest = (id) => {
  return api.post(`/api/admin/access-requests/${id}/reject`);
};