import api from "./axios";

// Register a new applicant
export const registerApplicant = (data) => {
  return api.post("/api/recruitment/register", data);
};

// Get all applicants
export const getAllApplicants = () => {
  return api.get("/api/recruitment/applicants");
};

// Get a single applicant by ID
export const getApplicantById = (id) => {
  return api.get(`/api/recruitment/applicants/${id}`);
};

// Get AI evaluation of an applicant
export const getApplicantEvaluation = (id) => {
  return api.get(`/api/recruitment/applicants/${id}/evaluation`);
};

// Accept an applicant
export const acceptApplicant = (id) => {
  return api.put(`/api/recruitment/applicants/${id}/accept`);
};

// Reject an applicant
export const rejectApplicant = (id) => {
  return api.put(`/api/recruitment/applicants/${id}/reject`);
};

