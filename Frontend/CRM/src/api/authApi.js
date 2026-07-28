import api from "./axios";

export const loginUser = (data) => {
  return api.post("/auth/signin", data);
};

export const registerUser = (data) => {
  return api.post("/auth/register", data);
};

export const getProfile = () => {
  return api.get("/auth/profile");
};

export const requestAccess = (data) => {
  return api.post("/auth/request-access", data);
};