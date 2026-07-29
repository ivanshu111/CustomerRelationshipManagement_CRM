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
