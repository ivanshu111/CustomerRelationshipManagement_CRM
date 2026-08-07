import api from "./axios";

export const addCustomer = (data) => {
  return api.post("/api/customers", data);
};

export const getMyCustomers = () => {
  return api.get("/api/customers/my");
};

export const getCustomerById = (id) => {
  return api.get(`/api/customers/${id}`);
};

export const updateCustomer = (id, data) => {
  return api.put(`/api/customers/${id}`, data);
};

export const getInterestedCustomers = () => {
  return api.get("/api/customers/interested");
};

export const getPendingCustomers = () => {
  return api.get("/api/customers/pending");
};

export const getClosedCustomers = () => {
  return api.get("/api/customers/closed");
};

export const getNotInterestedCustomers = () => {
  return api.get("/api/customers/not-interested");
};

export const createInteraction = (data) => {
  return api.post("/api/interaction", data);
};

export const getCustomerInteractions = (customerId) => {
  return api.get(`/api/interaction/customer/${customerId}`);
};

export const updateLeadStatus = (customerId, status) => {
  return api.put(`/api/leads/${customerId}/status`, { status });
};

export const submitResignation = (data) => {
  return api.post("/api/employee/resign", data);
};

export const requestUnblock = (reason) => {
  return api.post("/api/employee/request-unblock", { reason });
};

export const updatePassword = (data) => {
  return api.post("/api/employee/update-password", data);
};

export const getEmployeeConversionRate = (employeeId) => {
  return api.get(`/api/employee/analytics/conversion-rate/${employeeId}`);
};
